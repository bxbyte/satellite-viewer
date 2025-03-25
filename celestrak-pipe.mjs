/**
 * This scripts is run at every deploy to update the default satellites displayed based on data from celestrak.org
 * in order to respect their rate limit and improve load time.
 *
 * @see /.github/workflows/deploy.yml
 */

import { writeFileSync } from "fs"

import { Satellite, SATELLITES_PARAMS } from "./web/scripts/satellite.mjs"
import { load } from "./web/scripts/utils.mjs"

/** API entrypoint */
const entrypoint = new URL("https://celestrak.org/NORAD/elements/gp.php")
entrypoint.searchParams.set("FORMAT", "2LE")
entrypoint.searchParams.set("SPECIAL", "GPZ-PLUS")
entrypoint.searchParams.set("GROUP", "ACTIVE")

const satellites = Satellite.collectionFrom3LEs(await load(entrypoint)),
	satellitesBuffer = new Float32Array(satellites.flatMap((satellite) => SATELLITES_PARAMS.map((k) => satellite[k])))

// Write buffer
writeFileSync("./web/data/satellites.bin", satellitesBuffer)
