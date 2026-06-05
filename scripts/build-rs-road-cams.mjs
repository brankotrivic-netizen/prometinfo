// Zajame Putevi Srbije cestne kamere (kamere.toll4all.com) + geokodira.
// HLS je referer-zaklenjen (ni vgradnje), a poster JPEG je javen -> prikazemo sliko.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UA_NOMINATIM = "PrometInfo/0.1 (branko.trivic@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cachePath = resolve(ROOT, "scripts/.geocache-rs.json");
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};

function decodeEnt(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}
function geoQuery(name) {
  return name.replace(/\b(ulaz|izlaz|naplatna stanica|ns|petlja|čvor|cvor)\b/gi, " ").replace(/\s+/g, " ").trim() || name;
}
async function geocode(name) {
  const q = geoQuery(name);
  if (cache[q] !== undefined) return cache[q];
  try {
    const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(q + ", Srbija") + "&format=json&limit=1&countrycodes=rs";
    const r = await fetch(url, { headers: { "User-Agent": UA_NOMINATIM } });
    const j = await r.json();
    const res = j[0] ? { lat: +(+j[0].lat).toFixed(5), lng: +(+j[0].lon).toFixed(5) } : null;
    cache[q] = res; writeFileSync(cachePath, JSON.stringify(cache));
    await sleep(1100);
    return res;
  } catch { return null; }
}

(async () => {
  const r = await fetch("https://kamere.toll4all.com/", { headers: { "User-Agent": "Mozilla/5.0", "Accept-Encoding": "identity" } });
  const h = await r.text();
  const tagRe = /<div[^>]*class="cam-item"[^>]*>[\s\S]*?<\/div>/gi;
  const cams = [];
  let t;
  while ((t = tagRe.exec(h))) {
    const blk = t[0];
    const src = (blk.match(/src=["']([^"']+\.m3u8[^"']*)["']/) || [])[1] || null;
    const poster = (blk.match(/poster=["']([^"']+)["']/) || [])[1] || null;
    const name = (blk.match(/<span[^>]*>([\s\S]*?)<\/span>/) || [])[1];
    if (poster && name) cams.push({ name: decodeEnt(name.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim(), poster, stream: src });
  }
  // dedup po poster
  const seen = new Set();
  const uniq = cams.filter((c) => (seen.has(c.poster) ? false : (seen.add(c.poster), true)));
  let geo = 0;
  for (const c of uniq) {
    const co = await geocode(c.name);
    if (co) { c.lat = co.lat; c.lng = co.lng; geo++; } else { c.lat = null; c.lng = null; }
  }
  const ts =
    "// SAMODEJNO ZAJETO: Putevi Srbije cestne/cestninske kamere (kamere.toll4all.com).\n" +
    "// poster = javna JPEG slika kamere (osvezuje se); stream = HLS (referer-zaklenjen, brez vgradnje).\n" +
    "export interface RsRoadCam { name: string; poster: string; stream: string | null; lat: number | null; lng: number | null }\n" +
    "export const RS_ROAD_CAMS: RsRoadCam[] = " + JSON.stringify(uniq, null, 1) + ";\n";
  writeFileSync(resolve(ROOT, "lib/rs-road-cameras.ts"), ts, "utf8");
  console.log(`ZAPISANO lib/rs-road-cameras.ts | kamer: ${uniq.length} | geokodiranih: ${geo}`);
  uniq.slice(0, 8).forEach((c) => console.log("  " + c.name + " " + (c.lat ?? "?") + "," + (c.lng ?? "?")));
})();
