import { OrbitsCanvas } from "./canvas/index.mjs";
import { ORBITS_PARAMS, parseTLEs, TLE2Orbit } from "./tle.mjs";
import { getElement, throttleFn } from "./utils.mjs";
import { search } from "./api.mjs";

/** Pre-transformed binary orbits ( @see /celestrak-pipe.mjs ) */
const defaultOrbits = await (async () => {
  const res = await fetch(new URL("../data/orbits.bin", import.meta.url)),
    orbitsBuffer = new Float32Array(await res.arrayBuffer());

  const orbits = new Array(orbitsBuffer.length / ORBITS_PARAMS.length);
  let k = 0;
  for (let i = 0; i < orbitsBuffer.length; i += ORBITS_PARAMS.length) {
    orbits[k++] = Object.fromEntries(
      ORBITS_PARAMS.map((k, offset) => [k, orbitsBuffer[i + offset]])
    );
  }

  return orbits;
})();

function main() {
  const orbitCanvas = new OrbitsCanvas(getElement("#cvs"));
  orbitCanvas.setOrbits(defaultOrbits);

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

      // Update orbits
      const orbits = data.member.flatMap(({ line2 }) =>
        [...parseTLEs(line2)].map(TLE2Orbit)
      );
      orbitCanvas.setOrbits(orbits);

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
