import { notNull } from "./utils.mjs"

const 
	DEG_TO_RAD = Math.PI / 180,
	DAY_SECONDS = 86400,
	/** Earth standard gravitational parameter (https://en.wikipedia.org/wiki/Standard_gravitational_parameter) */
	EARTH_MU = 3.986_004_418 * 1e14,
	/** Average earth radius in kilometers (https://en.wikipedia.org/wiki/Earth_radius) */
	EARTH_RADIUS = 6_371

const 
	/** Regexp to match some second line parameters of 2LE */	
	MATCH_2LE_L2 = /2\s+\d{5}\s+(?<inclination>.{1,8})\s+(?<raan>.{1,8})\s+(?<eccentricity>\d{1,7})\s+(?<argumentOfPerigee>.{1,8})\s+(?<meanAnomaly>.{1,8})\s+(?<meanMotion>.{1,11}).{1,5}\d{1}/gm,
	/** Regexp to match name and 2nd line of 3LE */
	MATCH_3LE = new RegExp(String.raw`(?<name>^.*$)(?:\s+1.*\s+${MATCH_2LE_L2.source})`, "gm")

/** 2LE parameters used to compute ECI coordinates */
export const SATELLITES_PARAMS = [
	"eccentricity",
	"semiMajorAxis",
	"inclination",
	"raan",
	"argumentOfPerigee",
	"meanAnomaly",
	"meanMotion",
]

export class Satellite {
	name = ""
	eccentricity = 0
	semiMajorAxis = 0
	inclination = 0
	raan = 0
	argumentOfPerigee = 0
	meanAnomaly = 0
	meanMotion = 0

	/**
	 * Create satellite from 2LE matched params
	 * @param {Record<typeof SATELLITES_PARAMS, string>} params 
	 */
	static #from2LEStringObject(params) {
		const satellite = new Satellite()
		params.eccentricity = "0." + params.eccentricity
		SATELLITES_PARAMS.forEach((k) => (satellite[k] = parseFloat(params[k])))

		// Normalize
		const n = satellite.meanMotion / DAY_SECONDS
		satellite.eccentricity = satellite.eccentricity
		satellite.semiMajorAxis = Math.cbrt(EARTH_MU / (n * n)) / EARTH_RADIUS
		satellite.inclination = satellite.inclination * DEG_TO_RAD
		satellite.raan = satellite.raan * DEG_TO_RAD
		satellite.argumentOfPerigee = satellite.argumentOfPerigee * DEG_TO_RAD
		satellite.meanAnomaly = satellite.meanAnomaly * DEG_TO_RAD
		satellite.meanMotion = n

		return satellite
	}

	/**
	 * Create satellite from 2LE text
	 * @param {string} tle
	 * @returns {Satellite}
	 */
	static from2LE(tle) {
		return Satellite.#from2LEStringObject(notNull(new RegExp(MATCH_2LE_L2).exec(tle).groups, "No TLE found"))
	}

	/**
	 * Create satellites from multiple 3LE
	 * @param {string} tles
	 */
	static collectionFrom3LEs(tles) {
		return [...tles.matchAll(MATCH_3LE)].map(({ groups: { name, ...params } }) => {
			const satellite = Satellite.#from2LEStringObject(params)
			satellite.name = name.trim()
			return satellite
		})
	}

	/**
	 * Create satellites from binary buffer
	 * @param {ArrayBuffer} satellitesBuffer
	 * @returns {Satellite[]}
	 */
	static async collectionFromBuffer(satellitesBuffer) {
		const floatParams = new Float32Array(satellitesBuffer),
			/** @type {Satellite[]} */
			satellites = new Array(floatParams.length / SATELLITES_PARAMS.length)

		let i = 0, // Index in satellites buffer
			j = 0 // Index in satellites array (j = i / SATELLITES_PARAMS.length)
		for (; i < floatParams.length; i += SATELLITES_PARAMS.length) {
			const satellite = (satellites[j++] = new Satellite())
			SATELLITES_PARAMS.map((k, offset) => (satellite[k] = floatParams[i + offset]))
		}
		return satellites
	}
}

/** Pre-transformed default satellites (see /celestrak-pipe.mjs) */
export const defaultSatellites = await (async () => {
	const res = await fetch(new URL("../data/satellites.bin", import.meta.url))
	return Satellite.collectionFromBuffer(await res.arrayBuffer())
})()
