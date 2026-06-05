import type { SourceResult } from "../types";
import { scrapeBihamk } from "./bihamk";
import { pendingSource } from "./pending";

/**
 * Register vseh scraperjev. Vsak vrne SourceResult (z ok/error/pending),
 * tako da en padel vir ne podre celotnega odgovora.
 *
 * Roadmap virov:
 *  - [x] BA: BIHAMK
 *  - [ ] HR: HAK (zive cakalne dobe so na kamerni strani; MUP iframe = le statistika)
 *  - [ ] RS: AMSS (blokira bote -> potreben worker / headless)
 *  - [ ] ME: AMSCG
 *  - [ ] MK: AMSM
 */
const SCRAPERS: Array<() => Promise<SourceResult>> = [
  scrapeBihamk,
  pendingSource({ source: "HAK", country: "HR", note: "Vir v pripravi (zive cakalne dobe terjajo razclembo HAK kamerne strani)." }),
  pendingSource({ source: "AMSS", country: "RS", note: "Vir v pripravi (AMSS blokira avtomatiziran dostop; potreben loceni worker)." }),
  pendingSource({ source: "AMSCG", country: "ME", note: "Vir v pripravi." }),
  pendingSource({ source: "AMSM", country: "MK", note: "Vir v pripravi." }),
];

export async function scrapeAll(): Promise<SourceResult[]> {
  const results = await Promise.allSettled(SCRAPERS.map((fn) => fn()));
  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          source: "unknown",
          country: "BA" as const,
          ok: false,
          error: r.reason instanceof Error ? r.reason.message : String(r.reason),
          fetchedAt: new Date().toISOString(),
          reports: [],
        }
  );
}

export { scrapeBihamk };
