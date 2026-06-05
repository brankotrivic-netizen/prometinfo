// Ponovno zajame HAK cestne kamere (pravilno windows-1250) + geokodira lokacije
// prek OSM/Nominatim. Zapise obogaten lib/hak-road-cameras.ts (z lat/lng).
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UA_BROWSER = "Mozilla/5.0";
const UA_NOMINATIM = "PrometInfo/0.1 (branko.trivic@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const GROUPS = [
  [1, "A1 Zagreb–Split–Dubrovnik"], [13, "A2 Zagreb–Macelj"], [7, "A3 Bregana–Zagreb–Lipovac"],
  [12, "A4 Zagreb–Goričan"], [11, "A5 Beli Manastir–Osijek"], [10, "A6 Rijeka–Zagreb"],
  [9, "A7 Rupa–Rijeka–Križišće"], [6, "A8 Kanfanar–Matulji"], [8, "A10 Ploče–BiH"],
  [15, "A11 Zagreb–Sisak"], [14, "Državne ceste"],
];

const cachePath = resolve(ROOT, "scripts/.geocache.json");
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};

// Ocisti ime za geokodiranje (odstrani smer, stevilke, oznake objektov).
function geoQuery(name) {
  let s = name
    .replace(/\(.*?\)/g, " ")
    .replace(/\b(sjever|jug|istok|zapad|ulaz|izlaz|čvor|cvor|tunel|vijadukt|most|naplata|odmorište|odmoriste|PUO|petlja|km)\b/gi, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s || name;
}

async function geocode(name) {
  const q = geoQuery(name);
  if (cache[q] !== undefined) return cache[q];
  try {
    const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(q + ", Hrvatska") + "&format=json&limit=1&countrycodes=hr";
    const r = await fetch(url, { headers: { "User-Agent": UA_NOMINATIM } });
    const j = await r.json();
    const res = j[0] ? { lat: +(+j[0].lat).toFixed(5), lng: +(+j[0].lon).toFixed(5) } : null;
    cache[q] = res;
    writeFileSync(cachePath, JSON.stringify(cache));
    await sleep(1100); // Nominatim: max 1 req/s
    return res;
  } catch (e) {
    return null;
  }
}

(async () => {
  const groups = [];
  let total = 0, geocoded = 0;
  for (const [g, name] of GROUPS) {
    const r = await fetch("https://m.hak.hr/kamera.asp?g=" + g, { headers: { "User-Agent": UA_BROWSER, "Accept-Encoding": "identity" } });
    const buf = Buffer.from(await r.arrayBuffer());
    const txt = new TextDecoder("windows-1250").decode(buf);
    const raw = [...txt.matchAll(/kamera\.asp\?g=\d+&k=(\d+)["'][^>]*>([^<]+)</gi)].map((m) => ({ k: +m[1], name: m[2].replace(/\s+/g, " ").trim() })).filter((c) => c.name);
    const seen = new Set();
    const cams = raw.filter((c) => (seen.has(c.k) ? false : (seen.add(c.k), true)));
    for (const c of cams) {
      const co = await geocode(c.name);
      if (co) { c.lat = co.lat; c.lng = co.lng; geocoded++; }
      else { c.lat = null; c.lng = null; }
      total++;
    }
    groups.push({ g, name, cams });
    console.log(`g=${g} ${name}: ${cams.length} kamer`);
  }
  const ts =
    "// SAMODEJNO ZAJETO s HAK (m.hak.hr, windows-1250) + geokodirano (OSM/Nominatim).\n" +
    "// Globoka povezava: https://m.hak.hr/kamera.asp?g=<g>&k=<k>. Koordinate PRIBLIZNE.\n" +
    "export interface RoadCam { k: number; name: string; lat: number | null; lng: number | null }\n" +
    "export interface RoadGroup { g: number; name: string; cams: RoadCam[] }\n" +
    "export const hakRoadLink = (g: number, k: number) => `https://m.hak.hr/kamera.asp?g=${g}&k=${k}`;\n" +
    "export const HAK_ROADS: RoadGroup[] = " + JSON.stringify(groups, null, 1) + ";\n";
  writeFileSync(resolve(ROOT, "lib/hak-road-cameras.ts"), ts, "utf8");
  console.log(`\nZAPISANO lib/hak-road-cameras.ts | kamer: ${total} | geokodiranih: ${geocoded}`);
})();
