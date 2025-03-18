import { SatellitesCanvas } from "./canvas/index.mjs";
import { Satellite } from "./satellite.mjs";
import { getElement, throttleFn } from "./utils.mjs";
import { search } from "./api.mjs";

/** Pre-transformed binary satellites ( @see /celestrak-pipe.mjs ) */
const defaultSatellites = await (async () => {
  const res = await fetch(new URL("../data/satellites.bin", import.meta.url));
  return Satellite.collectionFromBuffer(await res.arrayBuffer());
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

      // Set loading style
      form.classList.add("loading")

      // API call
      const data = await search(params);

      searchResults.dataset.totalItems = data.totalItems
      searchResults.dataset.loadedItems = data.member.length

      // Update satellites
      const satellites = data.member.map(({ line2 }) =>
        Satellite.fromTLE(line2)
      );
      satelliteCanvas.setSatellites(satellites); 

      // Update row results
      const rows = data.member.map(({ name }) => {
        const row = document.createElement("li");
        row.innerText = name;
        return row;
      });
      searchResults.replaceChildren(...rows);

      // Remove loading style
      form.classList.remove("loading")
    })
  );
}

// Run main
if (document.readyState === "complete") main();
else document.addEventListener("DOMContentLoaded", main);
