import { CelestrakGPApi, CelestrakSubGPApi } from "./sources/celestrak.mjs";
import { TleApi } from "./sources/tle-api.mjs";
import { Satellite } from "../satellite.mjs"

export const defaultAPI = CelestrakGPApi;

export const APIs = Object.fromEntries(
  [CelestrakGPApi, CelestrakSubGPApi, TleApi].map((api) => [api.name, api]),
);

/** Pre-transformed binary satellites ( @see /celestrak-pipe.mjs ) */
export const defaultSatellites = await (async () => {
  const res = await fetch(new URL("../../data/satellites.bin", import.meta.url));
  return Satellite.collectionFromBuffer(await res.arrayBuffer());
})();