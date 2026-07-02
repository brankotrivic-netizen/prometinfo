// Bencinske crpalke (OpenStreetMap/Overpass) za celotno regijo -> lib/fuel-stations.ts
// Prenese se v CI (cron), da aplikacija NE klice Overpass iz brskalnika
// (CORS/blokade/pocasnost). Minimalen zapis: ime, lat, lng (zaokrozeno).
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { safeWriteTs } from "./_safewrite.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "lib/fuel-stations.ts");

// OSM osvezujemo najvec 1x na teden (crpalke se ne spreminjajo pogosto; cron tece vsako uro)
import { statSync } from "node:fs";
try {
  const age = Date.now() - statSync(OUT).mtimeMs;
  if (age < 7 * 24 * 3600 * 1000) { console.log("Crpalke so sveze (<7 dni) — preskocim OSM."); process.exit(0); }
} catch { /* datoteke ni -> prenesi */ }

const Q = '[out:json][timeout:90];node["amenity"="fuel"](41.8,13.3,46.9,23.1);out;';
const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

let els = null;
for (const url of MIRRORS) {
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "PrometInfo/1.0 (osebna app)" },
      body: "data=" + encodeURIComponent(Q),
      signal: AbortSignal.timeout(120000),
    });
    const tx = await r.text();
    const j = JSON.parse(tx);
    if (j.elements && j.elements.length) { els = j.elements; console.log(url, "->", els.length, "crpalk"); break; }
  } catch (e) {
    console.warn(url, "napaka:", e.message ? e.message.slice(0, 80) : e);
  }
}

const out = [];
if (els) {
  for (const e of els) {
    if (e.lat == null || e.lon == null) continue;
    const n = ((e.tags && (e.tags.brand || e.tags.name)) || "").trim().slice(0, 30);
    if (!n) continue; // samo znamcene/imenovane (izloci anonimne tocke)
    out.push({ n, a: Math.round(e.lat * 1e4) / 1e4, o: Math.round(e.lon * 1e4) / 1e4 });
  }
}

const ts =
  "// SAMODEJNO ZAJETO: bencinske crpalke (OpenStreetMap, celotna ex-YU regija).\n" +
  "// n=ime/znamka, a=lat, o=lng. Vir: OSM contributors (ODbL).\n" +
  "export interface FuelSt { n: string; a: number; o: number }\n" +
  "export const FUEL_STATIONS: FuelSt[] = " + JSON.stringify(out) + ";\n";

safeWriteTs(OUT, ts, out.length, 500, "lib/fuel-stations.ts (crpalke OSM)");
console.log("Skupaj znamcenih crpalk:", out.length);
