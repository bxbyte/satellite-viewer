import { SatelliteSceneView } from "./satellite-scene-view/index.mjs"
import { SatelliteListView } from "./satellite-list-view.mjs"
import { Satellite } from "../satellite.mjs"

/** Pre-transformed default satellites (see /celestrak-pipe.mjs) */
const defaultSatellites = await (async () => {
	const res = await fetch(new URL("../../data/satellites.bin", import.meta.url))
	return Satellite.collectionFromBuffer(await res.arrayBuffer())
})()

export class SatelliteController {
	/** @type {import("../satellite.mjs").Satellite[]} */
	#satellites

	#satelliteSceneView = new SatelliteSceneView()
	#satelliteListView = new SatelliteListView()

	constructor() {
		this.#satelliteSceneView.satellites = defaultSatellites
	}

	/** @param {import("../satellite.mjs").Satellite[]} satellites */
	set satellites(satellites) {
		this.#satellites = satellites
		this.#satelliteSceneView.satellites = satellites
		this.#satelliteListView.satellites = satellites
	}
}
