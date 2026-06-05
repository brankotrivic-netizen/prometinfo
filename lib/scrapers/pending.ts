import type { Country, SourceResult } from "../types";

/**
 * Zacasni "placeholder" vir za drzave, kjer scraper se ni implementiran.
 * Prikaze se nevtralno kot "v pripravi", NE kot napaka, in nikoli ne
 * izmislja podatkov.
 */
export function pendingSource(opts: {
  source: string;
  country: Country;
  note: string;
}): () => Promise<SourceResult> {
  return async () => ({
    source: opts.source,
    country: opts.country,
    ok: false,
    pending: true,
    note: opts.note,
    fetchedAt: new Date().toISOString(),
    reports: [],
  });
}
