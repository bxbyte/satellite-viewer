import { Scene } from "./canvas/index.mjs"
import { NavigationHandler } from "./nav/index.mjs"
import { defaultSatellites } from "./satellite.mjs"

function main() {
	const satelliteCanvas = new Scene()
	satelliteCanvas.satellites = defaultSatellites

	const nav = new NavigationHandler()
	nav.onresults = async (satellites) => (satelliteCanvas.satellites = satellites)
}

// Run main
if (document.readyState === "complete") main()
else addEventListener("DOMContentLoaded", main)
