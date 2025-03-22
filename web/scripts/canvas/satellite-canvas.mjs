import { getElement, load } from "../utils.mjs"
import { Renderer } from "./renderer.mjs"
import { M4x4 } from "./matrix.mjs"
import { SATELLITES_PARAMS } from "../satellite.mjs"

/** WebGL fragment and vertex shaders code */
const satellitesShadersCode = await Promise.all(
	["./shaders/satellites.frag", "./shaders/satellites.vert"].map(async (f) => load(new URL(f, import.meta.url)))
)

export class SatellitesCanvas {
	/** @type {import("../satellite.mjs").Satellite[]} */
	#satellites = []

	constructor(cvs) {
		const r = (this.r = new Renderer(getElement("canvas")))

		this.satellitesShader = r.createShader(...satellitesShadersCode)
		this.satellitesShader.use()

		this.setProjectionMatrix = this.satellitesShader.getUniformSetter("projection", "Matrix4fv")
		this.setViewMatrix = this.satellitesShader.getUniformSetter("view", "Matrix4fv")
		this.setMotionMatrix = this.satellitesShader.getUniformSetter("motion", "Matrix4fv")
		this.setTime = this.satellitesShader.getUniformSetter("time", "1f")

		/** @type {(() => void)[]} */
		this.satellitesBinds = SATELLITES_PARAMS.map((paramName) => {
			const attrLocation = this.satellitesShader.getBuffer(paramName, 1, r.gl.FLOAT, false, 0, 0)

			return () => {
				r.gl.bindBuffer(r.gl.ARRAY_BUFFER, attrLocation)
				r.gl.bufferData(
					r.gl.ARRAY_BUFFER,
					new Float32Array(this.#satellites.flatMap(({ [paramName]: v }) => v)),
					r.gl.STATIC_DRAW
				)
			}
		})

		const projectionMatrix = M4x4.projection(40, r.cvs.width / r.cvs.height, 0, 100)

		/** Update projection ratio on resize */
		new ResizeObserver(() => {
			r.updateSize()
			projectionMatrix.updateProjectionRatio(r.cvs.width / r.cvs.height)
		}).observe(r.cvs)

		const viewMatrix = M4x4.identity()
		viewMatrix[14] = viewMatrix[14] - 15 // zoom

		const motionMatrix = M4x4.identity()
		motionMatrix.rotateX(Math.PI / 4)
		motionMatrix.rotateY(Math.PI / 4)

		r.render((time, dt) => {
			viewMatrix.rotateY(dt / 1000)

			// Enable the depth test
			r.gl.enable(r.gl.DEPTH_TEST)
			r.gl.depthFunc(r.gl.LEQUAL)

			// // Clear canvas
			r.gl.clearColor(0, 0, 0, 0)
			r.gl.clearDepth(1)
			r.gl.clear(r.gl.COLOR_BUFFER_BIT | r.gl.DEPTH_BUFFER_BIT)

			// Pass uniform data
			this.setTime(time)
			this.setProjectionMatrix(false, projectionMatrix)
			this.setMotionMatrix(false, motionMatrix)
			this.setViewMatrix(false, viewMatrix)

			// Draw the points
			r.gl.drawArrays(r.gl.POINTS, 0, this.#satellites.length)
		})
	}

	/**
	 *
	 * @param {import("../satellite.mjs").Satellite[]} satellites
	 */
	set satellites(satellites) {
		this.#satellites = satellites
		this.satellitesBinds.forEach((b) => b())

		// TODO : rework the colors
		const colorLocation = this.satellitesShader.getBuffer("group", 1, this.r.gl.UNSIGNED_BYTE, false, 0, 0)

		this.r.gl.bindBuffer(this.r.gl.ARRAY_BUFFER, colorLocation)
		this.r.gl.bufferData(
			this.r.gl.ARRAY_BUFFER,
			new Uint8Array(this.#satellites.map(() => Math.round(Math.random()))),
			this.r.gl.STATIC_DRAW
		)
	}
}
