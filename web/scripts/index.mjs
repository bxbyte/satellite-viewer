import { SatelliteController } from "./satellite/index.mjs"
import { SearchController } from "./search/index.mjs"

function main() {
	const searchController = new SearchController()
	const satelliteController = new SatelliteController()
	searchController.onResults = (satellites) => satelliteController.satellites = satellites
}

// Run main
if (document.readyState === "complete") main()
else addEventListener("DOMContentLoaded", main)
