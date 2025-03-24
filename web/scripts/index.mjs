import { SceneView } from "./canvas/index.mjs"
import { ExploreController } from "./explore/index.mjs"
import { defaultSatellites } from "./satellite.mjs"

function main() {
	const scene = new SceneView()
	scene.satellites = defaultSatellites

	const nav = new ExploreController()
	nav.onResults = (satellites) => scene.satellites = satellites
}

// Run main
if (document.readyState === "complete") main()
else addEventListener("DOMContentLoaded", main)
