const MU = 398600.4418;  
const EARTH_RADIUS = 6371; 
const DEG_TO_RAD = Math.PI / 180;
const MATCH_TLE_PARAMS = /^2\s+\d{5}\s+(?<inclination>.{1,8})\s+(?<raan>.{1,8})\s+(?<eccentricity>\d{1,7})\s+(?<argumentOfPerigee>.{1,8})\s+(?<meanAnomaly>.{1,8})\s+(?<meanMotion>.{1,11})\d{1,5}\d{1}/gm

export const ORBITS_PARAMS = [
    'eccentricity',
    'semiMajorAxis',
    'inclination',
    'raan',
    'argumentOfPerigee',
    'meanAnomaly',
    'meanMotion'
]

/**
 * 
 * @param {string} tle 
 * @returns 
 */
export function *parseTLEs(lines) {
    /** @type {RegExpExecArray} */
    let tle;
    while ((tle = MATCH_TLE_PARAMS.exec(lines)) !== null) {
        yield ({
            ...(Object.fromEntries(Object.entries(tle.groups).map(([k, v]) => [k, parseFloat(v)]))),
            eccentricity: parseFloat("0." + tle.groups.eccentricity),
        })
    }
}

export function TLE2Orbit(tle) {
    const n = (tle.meanMotion * 2 * Math.PI) / 86400;
    return {
        eccentricity: tle.eccentricity,
        semiMajorAxis: Math.cbrt(MU / (n * n)) / EARTH_RADIUS, 
        inclination: tle.inclination * DEG_TO_RAD,
        raan: tle.raan * DEG_TO_RAD,
        argumentOfPerigee: tle.argumentOfPerigee * DEG_TO_RAD,
        meanAnomaly: tle.meanAnomaly * DEG_TO_RAD,
        meanMotion: n
    };
}
