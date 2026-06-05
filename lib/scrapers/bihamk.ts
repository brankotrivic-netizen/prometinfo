import * as cheerio from "cheerio";
import type { SourceResult, WaitReport } from "../types";
import { parseWaitText } from "../parse";
import { metaForId } from "../crossings";

const SOURCE = "BIHAMK";
const COUNTRY = "BA" as const;
const URL = "https://bihamk.ba/spi/stanje-na-cesti-u-bih/granicni-prijelazi";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/č|ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Scrapa BIHAMK stran z mejnimi prehodi.
 * Struktura: <article> -> <h3>GP Ime</h3> + <div class="text-[10px]...">status</div>
 * Status je pogosto opisni ("Zadrzavanja putnickih vozila nisu duza od 30 minuta").
 */
export async function scrapeBihamk(): Promise<SourceResult> {
  const fetchedAt = new Date().toISOString();
  try {
    const res = await fetch(URL, {
      headers: { "User-Agent": UA, "Accept-Language": "bs,hr,sr;q=0.8" },
      // ne cache-amo na fetch nivoju; cache je v lib/cache.ts
      cache: "no-store",
      // varovalka: ce vir obvisi, ne blokiramo upodabljanja v nedogled
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { source: SOURCE, country: COUNTRY, ok: false, error: `HTTP ${res.status}`, fetchedAt, reports: [] };
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const reports: WaitReport[] = [];

    $("article").each((_, el) => {
      const $el = $(el);
      const rawName = $el.find("h3").first().text().replace(/\s+/g, " ").trim();
      if (!/^GP\b/i.test(rawName)) return;

      const crossing = rawName.replace(/^GP\s+/i, "").trim();
      if (!crossing) return;

      // status: ves tekst v article minus naslov
      let status = $el.text().replace(/\s+/g, " ").trim();
      status = status.replace(rawName, "").trim();
      if (!status) status = "Ni podatka o cakanju.";

      const parsed = parseWaitText(status);
      const id = `ba-${slug(crossing)}`;
      const meta = metaForId(id);

      reports.push({
        id,
        crossing,
        country: COUNTRY,
        neighbor: meta?.neighbor ?? null,
        lat: meta?.lat ?? null,
        lng: meta?.lng ?? null,
        cameras: meta?.cameras ?? [],
        vehicle: "car", // BIHAMK ta stran porocao o putnickim (osebnih) vozilih
        direction: "both",
        waitMinutes: parsed.minutes,
        level: parsed.level,
        rawStatus: status,
        source: SOURCE,
        sourceUrl: URL,
        fetchedAt,
      });
    });

    // odstrani morebitne duplikate po id
    const seen = new Set<string>();
    const unique = reports.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));

    return { source: SOURCE, country: COUNTRY, ok: true, fetchedAt, reports: unique };
  } catch (err) {
    return {
      source: SOURCE,
      country: COUNTRY,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      fetchedAt,
      reports: [],
    };
  }
}
