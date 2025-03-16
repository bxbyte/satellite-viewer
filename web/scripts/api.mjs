import { computeOrbit } from "./tle.mjs"

const API_ORIGIN = new URL("https://tle.ivanstanojevic.me/api/")

export async function getTLE(params = { 'page-size': 100 }) {
    const url = new URL("./tle", API_ORIGIN)
    console.log(url)
    Object.entries(params)
        .forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url)
    const data = await res.json()

    return data.member.map(({line2}) => computeOrbit(line2))
}
