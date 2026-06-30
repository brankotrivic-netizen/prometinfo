// AMSS (Auto-moto savez Srbije) — čakanja na graničnim prelazima Srbije.
// Vir: amss.org.rs/stanje-na-putu/strana/mapa (markerji "Granični prelazi").
// OPOMBA: AMSS pogosto objavi splošno MUP oceno (~30 min) za vse prehode —
// zato je to DODATEN uradni vir, ne nadomesti per-prehod podatka (HAK/MUP).
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync, existsSync } from "node:fs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "lib/amss-waits.ts");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";

const clean = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&scaron;/gi, "š").replace(/&amp;/g, "&").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();

// AMSS ime (deakcentirano, ključ) -> naš crossingId
const MATCH = [
  ["batrovci", "hr-bajakovo"], ["sid", "hr-tovarnik"], ["bezdan", "hr-batina"],
  ["backa palanka", "hr-ilok"], ["bogojevo", "hr-erdut"], ["sremska raca", "ba-raca"],
  ["horgos ii", "rs-horgos"], ["horgos", "rs-horgos"], ["kelebija", "rs-kelebija"],
  ["vatin", "rs-vatin"], ["presevo", "rs-presevo"], ["gostun", "rs-gostun"],
  ["mali zvornik", "ba-karakaj"], ["kotroman", "ba-vardiste"], ["ljubovija", "ba-bratunac"],
  ["trbusnica", "ba-sepak"], ["uvac", "ba-uvac"], ["bajina basta", "ba-skelani"],
  ["badovinci", "ba-popovi"],
];
const deacc = (s) => clean(s).toLowerCase().normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
function mapId(title) {
  const t = deacc(title);
  for (const [k, id] of MATCH) if (t.includes(k)) return id;
  return null;
}
function toMin(seg) {
  if (!seg) return null;
  const t = seg.toLowerCase();
  let h = 0, m = 0;
  const mh = /(\d+)\s*(sat|sata|sati|čas|cas|h)\b/.exec(t); if (mh) h = +mh[1];
  const mm = /(\d+)\s*min/.exec(t); if (mm) m = +mm[1];
  if (!mh && !mm) { const n = /(\d+)/.exec(t); if (n) m = +n[1]; }
  return h * 60 + m;
}
function emptyTs(note) {
  return `// SAMODEJNO ZAJETO: AMSS čakanja na graničnih prelazih (Srbija). ${note || ""}\n` +
    "export interface AmssWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; text: string; ts: string }\n" +
    "export const AMSS_WAITS: AmssWait[] = [];\n";
}

let html = "";
try {
  const r = await fetch("https://www.amss.org.rs/stanje-na-putu/strana/mapa", {
    headers: { "User-Agent": UA, Referer: "https://www.amss.org.rs/", "Accept-Language": "sr,en;q=0.8" },
    signal: AbortSignal.timeout(25000),
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  html = await r.text();
} catch (e) {
  console.warn("OPOZORILO: AMSS ni dosegljiv (" + e.message + "). Obdrzim obstojece.");
  if (!existsSync(OUT)) writeFileSync(OUT, emptyTs("(vir nedosegljiv)"), "utf8");
  process.exit(0);
}

const waits = [];
const seen = new Set();
const blocks = [...html.matchAll(/<div class="single-marker-info[^"]*">\s*<h4[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)<\/div>/g)];
for (const b of blocks) {
  const title = clean(b[1]), body = clean(b[2]);
  if (!/grani[čcč]nim prelaz/i.test(body)) continue;
  const id = mapId(title);
  if (!id || seen.has(id)) continue;
  const izlazSeg = (/Izlaz iz Srbije[^.]*?(\d+\s*(?:min|sat|h|čas|cas)[^.]*)/i.exec(body) || [])[1] || "";
  const ulazSeg = (/Ulaz u Srbiju[^.]*?(\d+\s*(?:min|sat|h|čas|cas)[^.]*)/i.exec(body) || [])[1] || "";
  const izlazMin = toMin(izlazSeg), ulazMin = toMin(ulazSeg);
  if (izlazMin == null && ulazMin == null) continue;
  seen.add(id);
  const nm = title.replace(/^\s*\d*\s*GP\s*/i, "").trim().slice(0, 60);
  waits.push({
    id, name: nm,
    ulazMin, izlazMin,
    ulazTxt: ulazMin != null ? "~" + ulazMin + " min" : "-",
    izlazTxt: izlazMin != null ? "~" + izlazMin + " min" : "-",
    text: body.slice(0, 260),
    ts: new Date().toISOString(),
  });
}

const ts =
  "// SAMODEJNO ZAJETO: AMSS čakanja na graničnih prelazih (Srbija, amss.org.rs).\n" +
  "// ulaz = vstop v Srbijo, izlaz = izstop iz Srbije. Pogosto splošna MUP ocena.\n" +
  "export interface AmssWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; text: string; ts: string }\n" +
  "export const AMSS_WAITS: AmssWait[] = " + JSON.stringify(waits, null, 1) + ";\n";

writeFileSync(OUT, waits.length || !existsSync(OUT) ? ts : ts, "utf8");
console.log(`ZAPISANO lib/amss-waits.ts | prehodov: ${waits.length}`);
waits.forEach((w) => console.log(`  ${w.name} -> ${w.id} | ulaz ${w.ulazTxt} / izlaz ${w.izlazTxt}`));
