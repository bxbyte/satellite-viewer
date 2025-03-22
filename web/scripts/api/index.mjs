import { CelestrakGPApi, CelestrakSubGPApi } from "./sources/celestrak.mjs";
import { TleApi } from "./sources/tle-api.mjs";

export const defaultAPI = CelestrakGPApi;

export const APIs = Object.fromEntries(
  [CelestrakGPApi, CelestrakSubGPApi, TleApi].map((api) => [api.name, api]),
);

/**
 * 
 * @param {URL} url 
 */
export function matchAPIFromUrl(url) {
  return Object.values(APIs)
    .find(api => 
      api.entrypoint.origin == url.origin
      && api.entrypoint.pathname == url.pathname
    ) 
}