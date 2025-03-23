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
				label: "Select a group",
				values: [
					{ value: "last-30-days", label: "Last 30 Days' Launches" },
					{ value: "stations", label: "Space Stations", },
					{ value: "visual", label: "100 (or so) Brightest", },
					{ value: "active", label: "Active Satellites" },
					{ value: "analyst", label: "Analyst Satellites" },
					{ value: "cosmos-1408-debris", label: "Russian ASAT Test Debris (COSMOS 1408)" },
					{ value: "fengyun-1c-debris", label: "Chinese ASAT Test Debris (FENGYUN 1C)" },
					{ value: "iridium-33-debris", label: "IRIDIUM 33 Debris" },
					{ value: "cosmos-2251-debris", label: "COSMOS 2251 Debris" },
					{ value: "weather", label: "Weather" },
					{ value: "noaa", label: "NOAA" },
					{ value: "goes", label: "GOES" },
					{ value: "resource", label: "Earth Resources" },
					{ value: "sarsat", label: "Search & Rescue (SARSAT)" },
					{ value: "dmc", label: "Disaster Monitoring" },
					{ value: "tdrss", label: "Tracking and Data Relay Satellite System (TDRSS)" },
					{ value: "argos", label: "ARGOS Data Collection System" },
					{ value: "planet", label: "Planet" },
					{ value: "spire", label: "Spire" },
					{ value: "geo", label: "Active Geosynchronous" },
					{ value: "intelsat", label: "Intelsat" },
					{ value: "ses", label: "SES" },
					{ value: "eutelsat", label: "Eutelsat" },
					{ value: "iridium", label: "Iridium" },
					{ value: "iridium-NEXT", label: "Iridium NEXT" },
					{ value: "starlink", label: "Starlink" },
					{ value: "oneweb", label: "OneWeb" },
					{ value: "orbcomm", label: "Orbcomm" },
					{ value: "globalstar", label: "Globalstar" },
					{ value: "swarm", label: "Swarm" },
					{ value: "amateur", label: "Amateur Radio" },
					{ value: "satnogs", label: "SatNOGS" },
					{ value: "x-comm", label: "Experimental Comm" },
					{ value: "other-comm", label: "Other Comm" },
					{ value: "gorizont", label: "Gorizont" },
					{ value: "raduga", label: "Raduga" },
					{ value: "molniya", label: "Molniya" },
					{ value: "gnss", label: "GNSS" },
					{ value: "gps-ops", label: "GPS Operational" },
					{ value: "glo-ops", label: "GLONASS Operational" },
					{ value: "galileo", label: "Galileo" },
					{ value: "beidou", label: "Beidou" },
					{ value: "sbas", label: "Satellite-Based Augmentation System (WAAS/EGNOS/MSAS)" },
					{ value: "nnss", label: "Navy Navigation Satellite System (NNSS)" },
					{ value: "musson", label: "Russian LEO Navigation" },
					{ value: "science", label: "Space & Earth Science" },
					{ value: "geodetic", label: "Geodetic" },
					{ value: "engineering", label: "Engineering" },
					{ value: "education", label: "Education" },
					{ value: "military", label: "Miscellaneous Military" },
					{ value: "radar", label: "Radar Calibration" },
					{ value: "cubesat", label: "CubeSats" },
					{ value: "other", label: "Other Satellites" },
				],
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
				label: "Select a source",
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
				label: "Select a file",
				values: [
					{ value: "starlink", label: "Starlink" },
					{ value: "oneweb", label: "OneWeb" },
					{ value: "planet", label: "Planet" },
					{ value: "iridium", label: "Iridium" },
					{ value: "gps", label: "GPS Operational" },
					{ value: "glonass", label: "GLONASS Operational" },
					{ value: "intelsat", label: "Intelsat" },
					{ value: "ses", label: "SES" },
					{ value: "telesat", label: "Telesat" },
					{ value: "iss", label: "ISS" },
					{ value: "css", label: "CSS" },
					{ value: "cpf", label: "CPF" },
					{ value: "kuiper", label: "Kuiper" },
					{ value: "ast", label: "AST Space Mobile" }
				]
			},
		},
	],
})
