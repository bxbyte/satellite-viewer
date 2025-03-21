import { Satellite } from "../satellite.mjs"
import { API } from "./api.mjs"

const options = {
    NAME: {
        label: "Search by name",
        default: true,
        attrs: { type: "text", placeholder: "e.g ISS" }
    },
    CATNR: {   
        label: "Catalog Number",
        attrs: { type: "text", pattern: "\\d{1,9}", placeholder: "XXXXXXXXX"}
    },
    INTDES: {   
        label: "International Designator",
        attrs: { type: "text", pattern: "\\d{4}-\\w{3}", placeholder: "yyyy-nnn"}
    },
    SPECIAL: {
        label: "Special data set",
        values: {
            GPZ: 'GEO Protected Zone',
            'GPZ-PLUS': 'GEO Protected Zone +',
            DECAYING: 'Potential Decays',
        }
    }
}

const defaultParams = {
    FORMAT: 'TLE'   
}

const load = async (res) => Satellite.collectionFrom3LEs(await res.text())

export const CelestrakGPApi = new API({
    name: "Celestral GP",
    entrypoint: new URL("https://celestrak.org/NORAD/elements/gp.php"),
    defaultParams,
    load,
    options: {
        ...options,
        GROUP: {
            label: "Group",
            attrs: { type: "text", placeholder: "" },
        },
    },
    defaultOption: "NAME"
})

export const CelestrakSubGPApi = new API({
    name: "Celestral SubGP",
    entrypoint: new URL("https://celestrak.org/NORAD/elements/supplemental/sup-gp.php"),
    defaultParams,
    load,
    options: {
        ...options,
        SOURCE: {
            label: "Source",
            values: {
                'AST-E': 'AST SpaceMobile Ephemeris',
                'CPF': 'Consolidated Laser Ranging Predictions',
                'CSS-E': 'CSS Ephemeris',
                'GLONASS-RE': 'GLONASS Rapid Ephemeris',
                'GPS-A': 'GPS Almanac',
                'GPS-E': 'GPS Ephemeris',
                'Intelsat-11P': 'Intelsat 11-Parameter Data',
                'Intelsat-E': 'Intelsat Ephemeris',
                'Iridium-E': 'Iridium Ephemeris',
                'ISS-E': 'ISS Ephemeris',
                'ISS-TLE': 'ISS TLE [legacy data]',
                'Kuiper-E': 'Kuiper Ephemeris',
                'METEOSAT-SV': 'METEOSAT State Vector',
                'OneWeb-E': 'OneWeb Ephemeris',
                'Orbcomm-TLE': 'Orbcomm-Provided SupTLE',
                'Planet-E': 'Planet Ephemeris',
                'SES-11P': 'SES 11-Parameter Data',
                'SES-E': 'SES Ephemeris',
                'SpaceX-E': 'SpaceX Ephemeris',
                'SpaceX-SV': 'SpaceX State Vectors',
                'Telesat-E': 'Telesat Ephemeris',
                'Transporter-SV': 'Transporter State Vectors',
                'Bandwagon-SV': 'Bandwagon State Vectors'
            }
        },
        FILE: {
            label: "File",
            attrs: { type: "text" },
        },
    }
})