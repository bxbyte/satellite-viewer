import { CelestrakApi } from "./celestrak.mjs"
import { TleApi } from "./tle-api.mjs"

export const defaultAPI = CelestrakApi

export const APIs = Object.fromEntries([
    CelestrakApi,
    TleApi
].map(api => [api.name, api]))
