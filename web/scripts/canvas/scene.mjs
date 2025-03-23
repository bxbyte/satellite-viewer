import { getElement, notNull, load } from "../utils.mjs"
import { SATELLITES_PARAMS } from "../satellite.mjs"
import { SceneControls } from "./scene-controls.mjs"
import { ShaderProgram } from "./shader-program.mjs"

/** WebGL fragment and vertex shaders code */
const shadersCode = await Promise.all(
	["./shaders/satellites.frag", "./shaders/satellites.vert"].map(async (f) => load(new URL(f, import.meta.url)))
)

export class Scene {
	/** @type {import("../satellite.mjs").Satellite[]} */
	#satellites = []
	#renderRequestId

	constructor() {
		this.cvs = getElement("canvas")
		this.gl = notNull(
			this.cvs.getContext("webgl2", {
				premultipliedAlpha: false, // Use alpha
				powerPreference: "high-performance",
				preserveDrawingBuffer: true,
			}),
			"Your browser doesn't support the Webgl2 API"
		)

		this.shader = new ShaderProgram(this.gl, ...shadersCode)
		this.shader.use()

		this.controls = new SceneControls(this)
		this.controls.view[14] = this.controls.view[14] - 15 // zoom
		this.controls.updateView()
		this.controls.motion.rotateX(Math.PI / 4)
		this.controls.motion.rotateY(Math.PI / 4)
		this.controls.updateMotion()

		/** @type {(() => void)[]} */
		this.satellitesBinds = SATELLITES_PARAMS.map((paramName) => {
			const attrLocation = this.shader.getBuffer(paramName, 1, this.gl.FLOAT, false, 0, 0)
			return () => {
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrLocation)
				this.gl.bufferData(
					this.gl.ARRAY_BUFFER,
					new Float32Array(this.#satellites.flatMap(({ [paramName]: v }) => v)),
					this.gl.STATIC_DRAW
				)
			}
		})

		this.render((time, dt) => {
			// viewMatrix.rotateY(dt / 1000)

			// Enable the depth test
			this.gl.enable(this.gl.DEPTH_TEST)
			this.gl.depthFunc(this.gl.LEQUAL)

			// // Clear canvas
			this.gl.clearColor(0, 0, 0, 0)
			this.gl.clearDepth(1)
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

			// Pass uniform data
			this.controls.setTime(time)

			// Draw the points
			this.gl.drawArrays(this.gl.POINTS, 0, this.#satellites.length)
		})
	}

	/**
	 *
	 * @param {(time: number, deltaTime: number) => void} callback
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
			this.#renderRequestId = requestAnimationFrame(frameCallback)
		}
		this.#renderRequestId = requestAnimationFrame(frameCallback)
	}

	pause() {
		cancelAnimationFrame(this.#renderRequestId)
	}

	/**
	 *
	 * @param {import("../satellite.mjs").Satellite[]} satellites
	 */
	set satellites(satellites) {
		this.#satellites = satellites
		this.satellitesBinds.forEach((b) => b())

		// TODO : rework the colors
		const colorLocation = this.shader.getBuffer("group", 1, this.gl.UNSIGNED_BYTE, false, 0, 0)

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorLocation)
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Uint8Array(this.#satellites.map(() => 1)),
			this.gl.STATIC_DRAW
		)
	}
}
