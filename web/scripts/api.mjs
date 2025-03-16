import { parseTLEs, TLE2Orbit } from "./tle.mjs"
import { load } from "./utils.mjs"

const API_BASE = new URL("https://celestrak.org/NORAD/elements/gp.php")

export async function getOrbits() {
    return [...parseTLEs(
        await load(new URL("?GROUP=ACTIVE&FORMAT=2LE&SPECIAL=GPZ-PLUS", API_BASE))
    )].map(TLE2Orbit)
}
