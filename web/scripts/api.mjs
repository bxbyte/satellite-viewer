const API_BASE = new URL("https://tle.ivanstanojevic.me/api/tle");

/**
 *
 * @param {string} value
 */
function camel2Snake6Case(value) {
  return value.replace(
    /(\w)([A-Z]+)/gm,
    (_, a, b) => `${a}-${b.toLowerCase()}`
  );
}

/**
 *
 * @param {URL} url
 * @param {Record<string, string>} params
 */
function urlParamBuilder(url, params) {
  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.set(camel2Snake6Case(k), v)
  );
  return url;
}

/**
 * @typedef {{ satelliteId: number, name: string, date: string, line1: string, line2: string }} SatelliteInfo
 */

export async function search({ search = "", page = 1, pageSize = 100 } = {}) {
  const url = urlParamBuilder(new URL(API_BASE), {
      search,
      page,
      pageSize,
    }),
    res = await fetch(url);

  /** @type {{ totalItems: number, member: SatelliteInfo[] }} */
  const data = await res.json();
  return data;
}

/**
 *
 * @param {number} id
 * @returns {SatelliteInfo}
 */
export async function getSatellite(id) {
  const res = await fetch(new URL(`${id}`, API_BASE));
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
