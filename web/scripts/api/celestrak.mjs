import { Satellite } from "../satellite.mjs"
import { API } from "./api.mjs"

export const CelestrakApi = new API({
    name: "Celestral",
    entrypoint: new URL("https://celestrak.org/NORAD/elements/gp.php?FORMAT=TLE"),
    options: {
        CATNR: { type: "text", pattern: "\\d{1,9}", placeholder: "XXXXXXXXX"},
        INTDES: { type: "text", pattern: "\\d{4}-\\w{3}", placeholder: "yyyy-nnn"},
        GROUP: { type: "text" },
        SPECIAL: ["GPZ", "GPZ-PLUS", "DECAYING"]
    },
    renamedParams: { name: 'NAME' },
    load: async (res) => Satellite.collectionFrom3LEs(await res.text())
})