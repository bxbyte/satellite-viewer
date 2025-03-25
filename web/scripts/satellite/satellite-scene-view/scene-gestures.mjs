import { M4x4 } from "./matrix.mjs"

export class SceneControls {
	/**
	 * Define scene control parameters, a.k.a projection, movements, ...
	 * @param {import("./scene-view.mjs").scene} scene Parent scene
	 */
	constructor(SatelliteSceneView) {
		this.SatelliteSceneView = SatelliteSceneView

		/** @type {{x: number, y: number}?} */
		this.prevPointer = null

		this.setTime = this.SatelliteSceneView.shader.getUniformSetter("ctrl.time", "1f")
		this.setResolution = this.SatelliteSceneView.shader.getUniformSetter("ctrl.resolution", "2f")

		this.projection = M4x4.projection(40, this.SatelliteSceneView.cvs.width / this.SatelliteSceneView.cvs.height, 0, 100)
		const setProjection = this.SatelliteSceneView.shader.getUniformSetter("ctrl.projection", "Matrix4fv")
		this.updateProjection = () => setProjection(false, this.projection)

		this.view = M4x4.identity()
		const setView = this.SatelliteSceneView.shader.getUniformSetter("ctrl.view", "Matrix4fv")
		this.updateView = () => setView(false, this.view)

		this.motion = M4x4.identity()
		const setMotion = this.SatelliteSceneView.shader.getUniformSetter("ctrl.motion", "Matrix4fv")
		this.updateMotion = () => setMotion(false, this.motion)

		this.#setAspectRatioAutoUpdate()
		this.#setZoomControl()
		this.#setRotateControl()

		this.updAspectRatio()
		this.resetCursor()
	}

	/**
	 * Set canvas cursor
	 * @param {string} cursor Cursor type
	 */
	set cursor(cursor) {
		this.SatelliteSceneView.cvs.style.cursor = cursor
	}

	/** Reset canvas cursor */
	resetCursor() {
		this.cursor = "grab"
	}

	/** Update canvas aspect ratio */
	updAspectRatio() {
		this.SatelliteSceneView.cvs.width = Math.floor(this.SatelliteSceneView.cvs.clientWidth)
		this.SatelliteSceneView.cvs.height = Math.floor(this.SatelliteSceneView.cvs.clientHeight)
		this.SatelliteSceneView.gl.viewport(0, 0, this.SatelliteSceneView.cvs.width, this.SatelliteSceneView.cvs.height)
		this.setResolution(this.SatelliteSceneView.cvs.width, this.SatelliteSceneView.cvs.height)
		this.projection.setAspectRatio(this.SatelliteSceneView.cvs.width / this.SatelliteSceneView.cvs.height)
		this.updateProjection()
	}

	/** Auto set aspect ratio on canvas size change */
	#setAspectRatioAutoUpdate() {
		new ResizeObserver(this.updAspectRatio.bind(this)).observe(this.SatelliteSceneView.cvs)
	}

	/** Set zoom control on wheel */
	#setZoomControl() {
		let scrollEndId = 0 // Timeout id resetting on wheel event to detect wheel end
		this.SatelliteSceneView.cvs.addEventListener("wheel", (ev) => {
			this.view[14] += ev.deltaY * 1e-1
			this.updateView()
			this.cursor = ev.deltaY > 0 ? "zoom-in" : "zoom-out"
			clearTimeout(scrollEndId)
			scrollEndId = setTimeout(this.resetCursor.bind(this), 200)
		})
	}

	/** Set rotate control on grab */
	#setRotateControl() {
		// Init previous pointer to the point where the user start to click
		this.SatelliteSceneView.cvs.addEventListener("pointerdown", (ev) => {
			this.prevPointer = { x: ev.pageX, y: ev.pageY }
			this.cursor = "grabbing"
		})
		// Reset pointer when user stop clicking
		const resetPointer = () => {
			this.prevPointer = null
			this.resetCursor()
		}
		this.SatelliteSceneView.cvs.addEventListener("pointerup", resetPointer)
		this.SatelliteSceneView.cvs.addEventListener("pointerleave", resetPointer)
		// Rotate on user move with pointer down
		this.SatelliteSceneView.cvs.addEventListener("pointermove", (ev) => {
			if (!this.prevPointer) return
			const now = { x: ev.pageX, y: ev.pageY }
			const delta = { x: now.x - this.prevPointer.x, y: now.y - this.prevPointer.y }
			this.view.rotateY(delta.x * 1e-2)
			this.view.rotateX(delta.y * 1e-2)
			this.updateView()
			this.prevPointer = now
		})
	}
}
