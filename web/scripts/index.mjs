import { Scene } from "./canvas/index.mjs"
import { ExploreHandler } from "./explore/index.mjs"
import { defaultSatellites } from "./satellite.mjs"

function main() {
	const scene = new Scene()
	scene.satellites = defaultSatellites

	const nav = new ExploreHandler()
	nav.onresults = async (satellites) => (scene.satellites = satellites)

	scene.setSatelliteColor(0, [1, 0, 0])
}

// Run main
if (document.readyState === "complete") main()
else addEventListener("DOMContentLoaded", main)
