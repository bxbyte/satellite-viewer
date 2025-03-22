import { notNull } from "./utils.mjs"

const MU = 398600.4418,
	EARTH_RADIUS = 6371,
	DEG_TO_RAD = Math.PI / 180

const MATCH_2LE_L2 =
		/2\s+\d{5}\s+(?<inclination>.{1,8})\s+(?<raan>.{1,8})\s+(?<eccentricity>\d{1,7})\s+(?<argumentOfPerigee>.{1,8})\s+(?<meanAnomaly>.{1,8})\s+(?<meanMotion>.{1,11}).{1,5}\d{1}/gm,
	MATCH_3LE = new RegExp(String.raw`(?<name>^.*$)(?:\s+1.*\s+${MATCH_2LE_L2.source})`, "gm")

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

	static #from2LEStringObject(obj) {
		const satellite = new Satellite()
		obj.eccentricity = "0." + obj.eccentricity
		SATELLITES_PARAMS.forEach((k) => (satellite[k] = parseFloat(obj[k])))

		// Normalize
		const n = (satellite.meanMotion * 2 * Math.PI) / 86400
		satellite.eccentricity = satellite.eccentricity
		satellite.semiMajorAxis = Math.cbrt(MU / (n * n)) / EARTH_RADIUS
		satellite.inclination = satellite.inclination * DEG_TO_RAD
		satellite.raan = satellite.raan * DEG_TO_RAD
		satellite.argumentOfPerigee = satellite.argumentOfPerigee * DEG_TO_RAD
		satellite.meanAnomaly = satellite.meanAnomaly * DEG_TO_RAD
		satellite.meanMotion = n

		return satellite
	}

	/**
	 *
	 * @param {string} tle
	 * @returns {Satellite}
	 */
	static from2LE(tle) {
		return Satellite.#from2LEStringObject(notNull(new RegExp(MATCH_2LE_L2).exec(tle).groups, "No TLE found"))
	}

	/**
	 *
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
	 *
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

/** Pre-transformed binary satellites ( @see /celestrak-pipe.mjs ) */
export const defaultSatellites = await (async () => {
	const res = await fetch(new URL("../data/satellites.bin", import.meta.url))
	return Satellite.collectionFromBuffer(await res.arrayBuffer())
})()
