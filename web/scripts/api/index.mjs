import { CelestrakGPApi, CelestrakSubGPApi } from "./sources/celestrak.mjs";
import { TleApi } from "./sources/tle-api.mjs";

export const defaultAPI = CelestrakGPApi;

export const APIs = Object.fromEntries(
  [CelestrakGPApi, CelestrakSubGPApi, TleApi].map((api) => [api.name, api]),
);