import { Satellite } from "../../satellite.mjs"
import { API } from "../api.mjs"

const fields = [
	{
		label: "Search by name",
		field: {
			name: "NAME",
			type: "text",
			placeholder: "e.g ISS",
		},
	},
	{
		label: "Catalog Number",
		field: {
			name: "CATNR",
			type: "text",
			pattern: "\\d{1,9}",
			placeholder: "XXXXXXXXX",
		},
	},
	{
		label: "International Designator",
		field: {
			name: "INTDES",
			type: "text",
			pattern: "\\d{4}-\\w{3}",
			placeholder: "yyyy-nnn",
		},
	},
	{
		label: "Special data set",
		field: {
			name: "SPECIAL",
			label: "E.g. GEO Protected Zone",
			values: [
				{ value: "GPZ", label: "GEO Protected Zone" },
				{ value: "GPZ-PLUS", label: "GEO Protected Zone +" },
				{ value: "DECAYING", label: "Potential Decays" },
			],
		},
	},
]

const defaultParams = {
	FORMAT: "TLE",
}

const load = async (res) => Satellite.collectionFrom3LEs(await res.text())

export const CelestrakGPApi = new API({
	name: "Celestral GP",
	entrypoint: new URL("https://celestrak.org/NORAD/elements/gp.php"),
	defaultParams,
	load,
	defaultField: "NAME",
	fields: [
		...fields,
		{
			label: "Group",
			field: {
				name: "GROUP",
				type: "text",
			},
		},
	],
	defaultOption: "NAME",
})

export const CelestrakSubGPApi = new API({
	name: "Celestral SubGP",
	entrypoint: new URL("https://celestrak.org/NORAD/elements/supplemental/sup-gp.php"),
	defaultParams,
	load,
	defaultField: "NAME",
	fields: [
		...fields,
		{
			label: "Source",
			field: {
				name: "SOURCE",
				values: [
					{ value: "AST-E", label: "AST SpaceMobile Ephemeris" },
					{ value: "CPF", label: "Consolidated Laser Ranging Predictions" },
					{ value: "CSS-E", label: "CSS Ephemeris" },
					{ value: "GLONASS-RE", label: "GLONASS Rapid Ephemeris" },
					{ value: "GPS-A", label: "GPS Almanac" },
					{ value: "GPS-E", label: "GPS Ephemeris" },
					{ value: "Intelsat-11P", label: "Intelsat 11-Parameter Data" },
					{ value: "Intelsat-E", label: "Intelsat Ephemeris" },
					{ value: "Iridium-E", label: "Iridium Ephemeris" },
					{ value: "ISS-E", label: "ISS Ephemeris" },
					{ value: "ISS-TLE", label: "ISS TLE [legacy data]" },
					{ value: "Kuiper-E", label: "Kuiper Ephemeris" },
					{ value: "METEOSAT-SV", label: "METEOSAT State Vector" },
					{ value: "OneWeb-E", label: "OneWeb Ephemeris" },
					{ value: "Orbcomm-TLE", label: "Orbcomm-Provided SupTLE" },
					{ value: "Planet-E", label: "Planet Ephemeris" },
					{ value: "SES-11P", label: "SES 11-Parameter Data" },
					{ value: "SES-E", label: "SES Ephemeris" },
					{ value: "SpaceX-E", label: "SpaceX Ephemeris" },
					{ value: "SpaceX-SV", label: "SpaceX State Vectors" },
					{ value: "Telesat-E", label: "Telesat Ephemeris" },
					{ value: "Transporter-SV", label: "Transporter State Vectors" },
					{ value: "Bandwagon-SV", label: "Bandwagon State Vectors" },
				],
			},
		},
		{
			label: "File",
			field: {
				name: "FILE",
				type: "text",
			},
		},
	],
})
