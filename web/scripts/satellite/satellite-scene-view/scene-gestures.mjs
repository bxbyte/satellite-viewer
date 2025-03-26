import { M4x4 } from "./matrix.mjs"

export class SceneControls {
	/**
	 * Define scene control parameters, a.k.a projection, movements, ...
	 * @param {import("./scene-view.mjs").SatelliteSceneView} sceneView Parent scene
	 */
	constructor(sceneView) {
		this.sceneView = sceneView

		this.setTime = this.sceneView.shader.getUniformSetter("ctrl.time", "1f")
		this.setResolution = this.sceneView.shader.getUniformSetter("ctrl.resolution", "2f")

		this.projection = M4x4.projection(
			40,
			this.sceneView.cvs.width / this.sceneView.cvs.height,
			0,
			100
		)
		const setProjection = this.sceneView.shader.getUniformSetter("ctrl.projection", "Matrix4fv")
		this.updateProjection = () => setProjection(false, this.projection)

		this.view = M4x4.identity()
		const setView = this.sceneView.shader.getUniformSetter("ctrl.view", "Matrix4fv")
		this.updateView = () => setView(false, this.view)

		this.motion = M4x4.identity()
		const setMotion = this.sceneView.shader.getUniformSetter("ctrl.motion", "Matrix4fv")
		this.updateMotion = () => setMotion(false, this.motion)

		this.updAspectRatio()
		this.resetCursor()
		
		this.#setAspectRatioAutoUpdate()
		this.#setZoomControl()
		this.#setRotateControl()

	}

	/**
	 * Set canvas cursor
	 * @param {string} cursor Cursor type
	 */
	set cursor(cursor) {
		this.sceneView.cvs.style.cursor = cursor
	}

	/** Reset canvas cursor */
	resetCursor() {
		this.cursor = "grab"
	}

	/** Update canvas aspect ratio */
	updAspectRatio() {
		this.sceneView.cvs.width = Math.floor(this.sceneView.cvs.clientWidth)
		this.sceneView.cvs.height = Math.floor(this.sceneView.cvs.clientHeight)
		this.sceneView.gl.viewport(0, 0, this.sceneView.cvs.width, this.sceneView.cvs.height)
		this.setResolution(this.sceneView.cvs.width, this.sceneView.cvs.height)
		this.projection.setAspectRatio(this.sceneView.cvs.width / this.sceneView.cvs.height)
		this.updateProjection()
	}

	/** Auto set aspect ratio on canvas size change */
	#setAspectRatioAutoUpdate() {
		new ResizeObserver(this.updAspectRatio.bind(this)).observe(this.sceneView.cvs)
	}

	/** Set zoom control on wheel */
	#setZoomControl() {
		let scrollEndId = 0 // Timeout id resetting on wheel event to detect wheel end
		this.sceneView.cvs.addEventListener("wheel", (ev) => {
			this.view[14] += ev.deltaY * 1e-1
			this.updateView()
			this.cursor = ev.deltaY > 0 ? "zoom-in" : "zoom-out"
			clearTimeout(scrollEndId)
			scrollEndId = setTimeout(this.resetCursor.bind(this), 200)
		})
	}

	/** Set rotate control on grab */
	#setRotateControl() {
		/** @type {{x: number, y: number}?} */
		let prevPointer = null
	
		// Init previous pointer to the point where the user start to click
		this.sceneView.cvs.addEventListener("pointerdown", (ev) => {
			prevPointer = { x: ev.pageX, y: ev.pageY }
			this.cursor = "grabbing"
		})
		// Reset pointer when user stop clicking
		const resetPointer = () => {
			prevPointer = null
			this.resetCursor()
		}
		this.sceneView.cvs.addEventListener("pointerup", resetPointer)
		this.sceneView.cvs.addEventListener("pointerleave", resetPointer)
		// Rotate on user move with pointer down
		this.sceneView.cvs.addEventListener("pointermove", (ev) => {
			if (!prevPointer) return
			const currentPtr = { x: ev.pageX, y: ev.pageY }
			const deltaPtr = { x: currentPtr.x - prevPointer.x, y: currentPtr.y - prevPointer.y }
			this.view.rotateY(deltaPtr.x * 1e-2)
			this.view.rotateX(deltaPtr.y * 1e-2)
			this.updateView()
			prevPointer = currentPtr
		})
	}
}
