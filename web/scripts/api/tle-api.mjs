import { Satellite } from "../satellite.mjs"
import { API } from "./api.mjs"

export const TleApi = new API({
    name: "TLE API",
    entrypoint: new URL("https://tle.ivanstanojevic.me/api/tle"),
    options: {},
    renamedParams: { name: 'search' },
    load: async (res) => (await res.json())
        .member
        .map(({line2, name}) => {
            const satellite = Satellite.from2LE(line2)
            satellite.name = name
            return satellite
        })
})