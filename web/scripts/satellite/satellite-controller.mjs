import { SatelliteSceneView } from "./satellite-scene-view/index.mjs"
import { SatelliteListView } from "./satellite-list-view.mjs"
import { defaultSatellites } from "../satellite.mjs"

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