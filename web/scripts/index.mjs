import { SatellitesCanvas } from "./canvas/index.mjs";
import { SearchForm } from "./form/index.mjs";
import { getElement } from "./utils.mjs";
import { defaultSatellites } from "./satellite.mjs";

function main() {
  const satelliteCanvas = new SatellitesCanvas(getElement("#cvs"));
  const form = new SearchForm(getElement("nav>form"));

  satelliteCanvas.satellites = defaultSatellites;
  form.onresults = async (satellites) =>
    (satelliteCanvas.satellites = satellites);
}

// Run main
if (document.readyState === "complete") main();
else addEventListener("DOMContentLoaded", main);
