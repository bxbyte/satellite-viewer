const MU = 398600.4418;  
const EARTH_RADIUS = 6371; 
const DEG_TO_RAD = Math.PI / 180;
const MATCH_TLE_PARAMS = /^2\s+\d{5}\s+(?<inclination>.{1,8})\s+(?<raan>.{1,8})\s+(?<eccentricity>\d{1,7})\s+(?<argumentOfPerigee>.{1,8})\s+(?<meanAnomaly>.{1,8})\s+(?<meanMotion>.{1,11})\d{1,5}\d{1}/

/**
 * 
 * @param {string} tle 
 * @returns 
 */
function parseTLE(tle) {
    /** @type {string} */
    const line = tle.split("\n").map(line => line.trim())[2]
    const params = MATCH_TLE_PARAMS.exec(line).groups
    
    return {
        ...(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, parseFloat(v)]))),
        eccentricity: parseFloat("0." + params.eccentricity),
    }
}

export function computeOrbit(tleLines) {
    const tle = parseTLE(tleLines),
        n = (tle.meanMotion * 2 * Math.PI) / 86400,
        a = Math.cbrt(MU / (n * n))
    
    return {
        eccentricity: tle.eccentricity,
        semiMajorAxis: a / EARTH_RADIUS, 
        inclination: tle.inclination * DEG_TO_RAD,
        raan: tle.raan * DEG_TO_RAD,
        argumentOfPerigee: tle.argumentOfPerigee * DEG_TO_RAD,
        meanAnomaly: tle.meanAnomaly * DEG_TO_RAD,
        meanMotion: n
    };
}
