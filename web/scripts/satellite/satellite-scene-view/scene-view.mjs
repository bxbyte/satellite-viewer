import { getElement, notNull, load } from "../../utils.mjs"
import { SATELLITES_PARAMS } from "../../satellite.mjs"
import { SceneControls } from "./scene-controls.mjs"
import { ShaderProgram } from "./shader-program.mjs"

/** WebGL fragment and vertex shaders code */
const shadersCode = await Promise.all(
	["./shaders/satellites.frag", "./shaders/satellites.vert"].map(async (f) => load(new URL(f, import.meta.url)))
)

export class SatelliteSceneView {
	/**
	 * Current satellites
	 * @type {import("../satellite.mjs").Satellite[]}
	 */
	#satellites = []

	/**
	 * Satellites color buffer
	 * @type {Float32Array}
	 */
	#satellitesColors

	/** Scene canvas */
	#cvs = getElement("canvas")

	/** Rendering context */
	#gl = notNull(
		this.#cvs.getContext("webgl2", {
			premultipliedAlpha: false, // Use alpha
			powerPreference: "high-performance",
		}),
		"Your browser doesn't support the Webgl2 API"
	)

	/** Shader program */
	#shader = new ShaderProgram(this.#gl, ...shadersCode)

	/** Scene controls */
	#controls = new SceneControls(this.#cvs, this.#shader)

	constructor() {
		this.#shader.use()

		this.#controls.zoom = -15
		this.#controls.motion.rotateX(Math.PI / 4)
		this.#controls.motion.rotateY(3 * Math.PI / 4)
		this.#controls.updateMotion()

		const updateSatellitesParamsBuffers = SATELLITES_PARAMS.map((paramName) => {
			const attrLocation = this.#shader.getBuffer(paramName, 1, this.#gl.FLOAT, false, 0, 0)
			return () => {
				this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, attrLocation)
				this.#gl.bufferData(
					this.#gl.ARRAY_BUFFER,
					new Float32Array(this.#satellites.flatMap(({ [paramName]: v }) => v)),
					this.#gl.STATIC_DRAW
				)
			}
		})
		/** Update satellites params buffers (need to set satellites before) */
		this.updateSatellitesParams = () => updateSatellitesParamsBuffers.forEach((b) => b())

		const colorLocation = this.#shader.getBuffer("color", 3, this.#gl.FLOAT, false, 0, 0)
		/** Update satellites color buffer (need to set satellites before) */
		this.updateColors = () => {
			this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, colorLocation)
			this.#gl.bufferData(this.#gl.ARRAY_BUFFER, this.#satellitesColors, this.#gl.STATIC_DRAW)
		}

		// Set render function
		this.render((time, dt) => {
			this.#gl.clearColor(0, 0, 0, 0)
			this.#gl.clearDepth(1)
			this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT)

			this.#controls.setTime(time)

			this.#gl.enable(this.#gl.DEPTH_TEST)
			this.#gl.depthFunc(this.#gl.LEQUAL)
			this.#gl.drawArrays(this.#gl.POINTS, 0, this.#satellites.length)
		})
	}

	/**
	 * Set rendering function
	 * @param {(time: number, deltaTime: number) => void} callback
	 * @param {number} maxFPS Max framerate
	 */
	render(callback, maxFPS = 120) {
		const timeout = 1000 / maxFPS
		let lastTime = 0
		const frameCallback = (time) => {
			const deltaTime = time - lastTime
			if (timeout <= deltaTime) {
				callback(time, deltaTime)
				lastTime = time
			}
			requestAnimationFrame(frameCallback)
		}
		requestAnimationFrame(frameCallback)
	}

	/**
	 * Set satellites points
	 * @param {import("../satellite.mjs").Satellite[]} satellites
	 */
	set satellites(satellites) {
		// Set satellites params
		this.#satellites = satellites
		this.updateSatellitesParams()

		// Set color buffer
		this.#satellitesColors = Float32Array.from({ length: satellites.length * 3 }, () => 1)
		this.updateColors()
	}

	/**
	 * Set color of a specific satellite point
	 * @param {number} idx Satellite index
	 * @param {[number, number, number]} color Satellite rgb color
	 */
	setSatelliteColor(idx, color) {
		idx *= 3
		this.#satellitesColors[idx] = color[0]
		this.#satellitesColors[idx + 1] = color[1]
		this.#satellitesColors[idx + 2] = color[2]
		this.updateColors()
	}
}
