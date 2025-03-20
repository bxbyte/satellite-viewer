import { SatellitesCanvas } from "./canvas/index.mjs";
import { Satellite } from "./satellite.mjs";
import { getElement } from "./utils.mjs";
import { SearchForm } from "./form.mjs";

/** Pre-transformed binary satellites ( @see /celestrak-pipe.mjs ) */
const defaultSatellites = await (async () => {
  const res = await fetch(new URL("../data/satellites.bin", import.meta.url));
  return Satellite.collectionFromBuffer(await res.arrayBuffer());
})();

function main() {
  const satelliteCanvas = new SatellitesCanvas(getElement("#cvs"));
  const form = new SearchForm(getElement("form"));
  
  satelliteCanvas.satellites = defaultSatellites;
  form.onresults = async (satellites) => satelliteCanvas.satellites = satellites
}

// Run main
if (document.readyState === "complete") main();
else document.addEventListener("DOMContentLoaded", main);
