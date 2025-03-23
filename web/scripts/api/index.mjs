import { CelestrakGPApi, CelestrakSubGPApi } from "./sources/celestrak.mjs"
import { TleApi } from "./sources/tle-api.mjs"

export const defaultAPI = CelestrakGPApi

export const APIs = Object.fromEntries([CelestrakGPApi, CelestrakSubGPApi, TleApi].map((api) => [api.name, api]))

/**
 * Get a known API based on a url entrypoint
 * @param {URL} url
 */
export function matchAPIFromUrl(url) {
	return Object.values(APIs).find(
		(api) => api.entrypoint.origin == url.origin && api.entrypoint.pathname == url.pathname
	)
}
