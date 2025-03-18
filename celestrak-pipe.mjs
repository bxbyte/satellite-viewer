/**
 * This scripts is run at every deploy (every 3h on the github runner)
 * to update the default satellites binaries based on data from celestrak.org
 * in order to respect their rate limit.
 *
 * @see /.github/workflows/deploy.yml
 */

import { writeFileSync } from "fs";

import { load } from "./web/scripts/utils.mjs";
import { Satellite } from "./web/scripts/satellite.mjs";

const API_CALL = new URL("https://celestrak.org/NORAD/elements/gp.php");
API_CALL.searchParams.set("FORMAT", "2LE");
API_CALL.searchParams.set("SPECIAL", "GPZ-PLUS");
API_CALL.searchParams.set("GROUP", "ACTIVE");

const TLEs = await load(API_CALL),
  satellites = Satellite.collectionFromTLEs(TLEs),
  satellitesBuffer = new Float32Array(
    satellites.flatMap((satellite) => Object.values(satellite))
  );

// Write buffer
writeFileSync("./web/data/satellites.bin", satellitesBuffer);
