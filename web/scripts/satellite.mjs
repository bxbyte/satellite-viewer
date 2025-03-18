import { notNull } from "./utils.mjs";

const MU = 398600.4418;
const EARTH_RADIUS = 6371;
const DEG_TO_RAD = Math.PI / 180;
const MATCH_TLE_PARAMS =
  /^2\s+\d{5}\s+(?<inclination>.{1,8})\s+(?<raan>.{1,8})\s+(?<eccentricity>\d{1,7})\s+(?<argumentOfPerigee>.{1,8})\s+(?<meanAnomaly>.{1,8})\s+(?<meanMotion>.{1,11})\d{1,5}\d{1}/gm;

export const SATELLITES_PARAMS = [
  "eccentricity",
  "semiMajorAxis",
  "inclination",
  "raan",
  "argumentOfPerigee",
  "meanAnomaly",
  "meanMotion",
];

export class Satellite {
  eccentricity = 0;
  semiMajorAxis = 0;
  inclination = 0;
  raan = 0;
  argumentOfPerigee = 0;
  meanAnomaly = 0;
  meanMotion = 0;

  /**
   *
   * @param {Record<SATELLITES_PARAMS, string>} obj
   * @returns
   */
  static #fromTLEStringObject(obj) {
    const satellite = new Satellite();
    obj.eccentricity = "0." + obj.eccentricity;
    SATELLITES_PARAMS.forEach((k) => (satellite[k] = parseFloat(obj[k])));

    // Normalize
    const n = (satellite.meanMotion * 2 * Math.PI) / 86400;
    satellite.eccentricity = satellite.eccentricity;
    satellite.semiMajorAxis = Math.cbrt(MU / (n * n)) / EARTH_RADIUS;
    satellite.inclination = satellite.inclination * DEG_TO_RAD;
    satellite.raan = satellite.raan * DEG_TO_RAD;
    satellite.argumentOfPerigee = satellite.argumentOfPerigee * DEG_TO_RAD;
    satellite.meanAnomaly = satellite.meanAnomaly * DEG_TO_RAD;
    satellite.meanMotion = n;

    return satellite;
  }

  /**
   *
   * @param {string} tle
   * @returns {Satellite}
   */
  static fromTLE(tle) {
    return Satellite.#fromTLEStringObject(
      notNull(new RegExp(MATCH_TLE_PARAMS).exec(tle).groups, "No TLE found")
    );
  }

  /**
   *
   * @param {string} tles
   * @returns {Satellite[]}
   */
  static collectionFromTLEs(tles) {
    return [...tles.matchAll(MATCH_TLE_PARAMS)].map((o) =>
      Satellite.#fromTLEStringObject(o.groups)
    );
  }

  /**
   *
   * @param {ArrayBuffer} satellitesBuffer
   * @returns {Satellite[]}
   */
  static async collectionFromBuffer(satellitesBuffer) {
    
    const floatParams = new Float32Array(satellitesBuffer),
      /** @type {Satellite[]} */
      satellites = new Array(floatParams.length / SATELLITES_PARAMS.length);

    let i = 0, // Index in satellites buffer
      j = 0; // Index in satellites array (j = i / SATELLITES_PARAMS.length)
    for (; i < floatParams.length; i += SATELLITES_PARAMS.length) {
      const satellite = (satellites[j++] = new Satellite());
      SATELLITES_PARAMS.map(
        (k, offset) => (satellite[k] = floatParams[i + offset])
      );
    }
    return satellites;
  }
}
