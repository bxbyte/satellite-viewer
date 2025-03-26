import { notNull } from "./utils.mjs"

const 
	CURRENT_CENTURY = Math.floor(new Date().getFullYear() / 100),
	DEG_TO_RAD = Math.PI / 180,
	DAY_SECONDS = 86_400,
	/** Earth standard gravitational parameter (https://en.wikipedia.org/wiki/Standard_gravitational_parameter) */
	EARTH_MU = 398_600.4418,
	/** Average earth radius in kilometers (https://en.wikipedia.org/wiki/Earth_radius) */
	EARTH_RADIUS = 6_371

const /** Regexp to match some second line parameters of 2LE */
	MATCH_2LE_L2 =
	/2\s+\d{5}\s+(?<inclination>.{1,8})\s+(?<raan>.{1,8})\s+(?<eccentricity>\d{1,7})\s+(?<argumentOfPerigee>.{1,8})\s+(?<meanAnomaly>.{1,8})\s+(?<meanMotion>.{1,11}).{1,5}\d{1}/gm,
	/** Regexp to match some 1st line parameters of 2LE */
	MATCH_2LE_L1 = /1\s.{16}(?<year>\d{2})(?<day>.{12}).*\d{1}/gm,
	/** Regexp to match a 2LE */
	MATCH_2LE = new RegExp(String.raw`\s*${MATCH_2LE_L1.source}\s*${MATCH_2LE_L2.source}`, "gm"),
	/** Regexp to match a 3LE (name + 2LE) */
	MATCH_3LE = new RegExp(String.raw`(?<name>^.*$)${MATCH_2LE.source}`, "gm")

/** Orbitals elements from the 2LE */
export const ORBITS_ELEMENTS = [
	"eccentricity",
	"semiMajorAxis",
	"inclination",
	"raan",
	"argumentOfPerigee",
	"meanAnomaly",
	"meanMotion",
]

/** Satellites parameters used to compute ECI coordinates */
export const SATELLITES_PARAMS = [
	...ORBITS_ELEMENTS,
	"timeOffset"
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
	timeOffset = 0

	/**
	 * Create satellite from 2LE matched params
	 * @param {Record<typeof SATELLITES_PARAMS, string> & { year: string, day: string }} params
	 */
	static #from2LEStringObject({year, day, ...orbitElements}) {
		const satellite = new Satellite()

		// Calculate precise date when orbitals elements where calculated 
		const calcDate = new Date(`${CURRENT_CENTURY}${year}`) // Convert 2 digits year to year
		calcDate.setTime(calcDate.getTime()
			+ Math.floor((parseFloat(day) - 1) * DAY_SECONDS * 1e3) // Convert decimal day to millisecond 
		)

		// Calc offset from now in seconds
		satellite.timeOffset = (Date.now() - calcDate.getTime()) / 1e3

		// Reformat eccentricity to float string as it's only the decimal part
		orbitElements.eccentricity = "." + orbitElements.eccentricity

		// Convert and set orbitals elements from string to float
		ORBITS_ELEMENTS.forEach((k) => (satellite[k] = parseFloat(orbitElements[k])))

		// Convert revolution per day to radiant per seconds
		// Source: https://space.stackexchange.com/a/18291
		const meanMotion = (satellite.meanMotion * 2 * Math.PI) / DAY_SECONDS
		satellite.meanMotion = meanMotion

		// Retrieve the semi major axis normalized (based on the same source as before)
		satellite.semiMajorAxis = Math.cbrt(EARTH_MU / meanMotion ** 2) / EARTH_RADIUS

		// Convert degrees to radiants
		satellite.inclination = satellite.inclination * DEG_TO_RAD
		satellite.raan = satellite.raan * DEG_TO_RAD
		satellite.argumentOfPerigee = satellite.argumentOfPerigee * DEG_TO_RAD
		satellite.meanAnomaly = satellite.meanAnomaly * DEG_TO_RAD

		return satellite
	}

	/**
	 * Create satellite from 2LE text
	 * @param {string} tle
	 * @returns {Satellite}
	 */
	static from2LE(tle) {
		return Satellite.#from2LEStringObject(notNull(new RegExp(MATCH_2LE).exec(tle).groups, "No TLE found"))
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