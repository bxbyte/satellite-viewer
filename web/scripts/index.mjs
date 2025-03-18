import { SatellitesCanvas } from "./canvas/index.mjs";
import { Satellite } from "./satellite.mjs";
import { getElement, throttleFn } from "./utils.mjs";
import { search } from "./api.mjs";

/** Pre-transformed binary satellites ( @see /celestrak-pipe.mjs ) */
const defaultSatellites = await (async () => {
  const res = await fetch(new URL("../data/satellites.bin", import.meta.url)),
    satellitesBuffer = new Float32Array(await res.arrayBuffer());
  return Satellite.collectionFromBuffer(satellitesBuffer);
})();

function main() {
  const satelliteCanvas = new SatellitesCanvas(getElement("#cvs"));
  satelliteCanvas.setSatellites(defaultSatellites);

  const /** @type {HTMLFormElement} */
    form = getElement("nav>form"),
    searchResults = getElement("[name=results]>ul", form);

  form.addEventListener(
    "submit",
    throttleFn(async () => {
      /** @type {Parameters<typeof search>[0]} */
      const params = Object.fromEntries(new FormData(form).entries());

      // When no search string
      if (!params.search) return;

      // API call
      const data = await search(params);

      // When nothing is found
      if (data.totalItems == 0) {
        const row = document.createElement("li");
        row.innerText = "Nothing found";
        searchResults.replaceChildren(row);
        return;
      }

      // Update satellites
      const satellites = data.member.map(({ line2 }) =>
        Satellite.fromTLE(line2)
      );
      console.log(satellites);
      satelliteCanvas.setSatellites(satellites);

      // Update row results
      const rows = data.member.map(({ name }) => {
        const row = document.createElement("li");
        row.innerText = name;
        return row;
      });
      searchResults.replaceChildren(...rows);
    })
  );
}

// Run main
if (document.readyState === "complete") main();
else document.addEventListener("DOMContentLoaded", main);
