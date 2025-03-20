import { Satellite } from "../satellite.mjs"
import { API } from "./api.mjs"

const COMMON_OPTIONS = {
    CATNR: { type: "text", pattern: "\\d{1,9}", placeholder: "XXXXXXXXX"},
    INTDES: { type: "text", pattern: "\\d{4}-\\w{3}", placeholder: "yyyy-nnn"},
}

export const CelestrakGPApi = new API({
    name: "Celestral GP",
    entrypoint: new URL("https://celestrak.org/NORAD/elements/gp.php?FORMAT=TLE"),
    options: {
        ...COMMON_OPTIONS,
        GROUP: { type: "text" },
        SPECIAL: ["GPZ", "GPZ-PLUS", "DECAYING"]
    },
    renamedParams: { name: 'NAME' },
    load: async (res) => Satellite.collectionFrom3LEs(await res.text())
})

export const CelestrakSubGPApi = new API({
    name: "Celestral SubGP",
    entrypoint: new URL("https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FORMAT=TLE"),
    options: {
        ...COMMON_OPTIONS,
        SOURCE: [
            "AST-E",
            "CPF",
            "CSS-E",
            "GLONASS-RE",
            "GPS-A",
            "GPS-E",
            "Intelsat-11P",
            "Intelsat-E",
            "Iridium-E",
            "ISS-E",
            "ISS-TLE",
            "Kuiper-E",
            "METEOSAT-SV",
            "OneWeb-E",
            "Orbcomm-TLE",
            "Planet-E",
            "SES-11P",
            "SES-E",
            "SpaceX-E",
            "SpaceX-SV",
            "Telesat-E",
            "Transporter-SV",
            "Bandwagon-SV"
        ],
        SPECIAL: ["GPZ", "GPZ-PLUS"],
        FILE: { type: "text" },
    },
    renamedParams: { name: 'NAME' },
    load: async (res) => Satellite.collectionFrom3LEs(await res.text())
})