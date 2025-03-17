import { OrbitsCanvas } from "./canvas/index.mjs"
import { ORBITS_PARAMS } from "./tle.mjs"

/** Pre-transformed binary orbits ( @see /celestrak-pipe.mjs ) */
const defaultOrbits = await (async () => {
    const res = await fetch(new URL("../data/orbits.bin", import.meta.url)),
        orbitsBuffer = new Float32Array(await res.arrayBuffer())

    const orbits = new Array(orbitsBuffer.length / ORBITS_PARAMS.length)
    let k = 0;
    for (let i = 0; i < orbitsBuffer.length; i += ORBITS_PARAMS.length) {
        orbits[k++] = Object.fromEntries(ORBITS_PARAMS.map((k, offset) => [k, orbitsBuffer[i + offset]]))
    }

    return orbits
})()

function main() {
    const orbitCanvas = new OrbitsCanvas()
    orbitCanvas.setOrbits(defaultOrbits)
}

if (document.readyState === "complete") main()
else document.addEventListener("DOMContentLoaded", main)
