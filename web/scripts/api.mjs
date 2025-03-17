import { parseTLEs, TLE2Orbit } from "./tle.mjs"
import { load } from "./utils.mjs"

const API_BASE = new URL("https://celestrak.org/NORAD/elements/gp.php")

// export async function getOrbits() {
//     return [...parseTLEs(
//         await load(new URL("?GROUP=ACTIVE&FORMAT=2LE&SPECIAL=GPZ-PLUS", API_BASE))
//     )].map(TLE2Orbit)
// }

export async function getOrbits() {
    const data = await load("/data/active.csv")
    console.log(data)
    return []
    // return (await load("/data/active.json")).map(TLE2Orbit)
}
