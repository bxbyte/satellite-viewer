import { CelestrakGPApi, CelestrakSubGPApi } from "./celestrak.mjs";
import { TleApi } from "./tle-api.mjs";

export const defaultAPI = CelestrakGPApi;

export const APIs = Object.fromEntries(
  [CelestrakGPApi, CelestrakSubGPApi, TleApi].map((api) => [api.name, api]),
);
