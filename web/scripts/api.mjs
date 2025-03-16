import { parseTLEs, TLE2Orbit } from "./tle.mjs"
import { load } from "./utils.mjs"

const API_ORIGIN = new URL("https://celestrak.org")

export async function getOrbits() {
    return [...parseTLEs(
        await load(new URL("/NORAD/elements/gp.php?GROUP=active&FORMAT=2le", API_ORIGIN))
    )].map(TLE2Orbit)
}
