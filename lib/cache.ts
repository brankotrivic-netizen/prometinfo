import type { SourceResult } from "./types";
import { scrapeAll } from "./scrapers";

/**
 * Preprost in-memory cache za MVP. Scraperji se ne smejo klicati ob vsakem
 * zahtevku (viri bi nas lahko blokirali), zato rezultate hranimo TTL sekund.
 *
 * Kasneje zamenjamo z Vercel KV / Postgres + cron worker (glej README).
 */

const TTL_MS = 5 * 60 * 1000; // 5 minut

interface CacheEntry {
  data: SourceResult[];
  at: number;
}

let entry: CacheEntry | null = null;
let inflight: Promise<SourceResult[]> | null = null;

export interface BordersPayload {
  reports: SourceResult[];
  cachedAt: string;
  ageSeconds: number;
  stale: boolean;
}

export async function getBorders(force = false): Promise<BordersPayload> {
  const now = Date.now();
  const fresh = entry && now - entry.at < TTL_MS;

  if (!force && fresh && entry) {
    return toPayload(entry, now, false);
  }

  // Zdruzi vzporedne zahtevke v en sam zajem.
  if (!inflight) {
    inflight = scrapeAll().finally(() => {
      inflight = null;
    });
    inflight.then((data) => {
      entry = { data, at: Date.now() };
    }).catch(() => {
      /* napake na nivoju vira se ze belezijo v SourceResult */
    });
  }

  try {
    const data = await inflight;
    const e = { data, at: Date.now() };
    return toPayload(e, Date.now(), false);
  } catch {
    // Ce zajem propade in imamo star cache, vrnemo starega kot stale.
    if (entry) return toPayload(entry, now, true);
    throw new Error("Zajem prometnih podatkov ni uspel in cache je prazen.");
  }
}

function toPayload(e: CacheEntry, now: number, stale: boolean): BordersPayload {
  return {
    reports: e.data,
    cachedAt: new Date(e.at).toISOString(),
    ageSeconds: Math.round((now - e.at) / 1000),
    stale,
  };
}
