// Headless (Playwright) zajem MK kamer z roads.org.mk: klikne markerje,
// pobere HLS toke, imena (REST), geokodira -> lib/amsm-cameras.ts
import { chromium } from "playwright";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cachePath = resolve(ROOT, "scripts/.geocache-mk.json");
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};

// REST naslovi (en) za lepsa imena
let restTitles = [];
try { restTitles = JSON.parse(readFileSync(resolve(ROOT, "scripts/.mkcam.json"), "utf8")).filter((c) => c.lang === "en").map((c) => ({ slug: c.slug, title: c.title.rendered })); } catch {}
const pretty = (slug) => {
  const m = restTitles.find((r) => r.slug.includes(slug));
  if (m) return m.title.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#8220;|&#8221;/g, '"').replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

async function geocode(name) {
  const q = name.replace(/toll plaza|border crossing|pika|naplatna|"|„|”/gi, "").replace(/\s+/g, " ").trim();
  if (cache[q] !== undefined) return cache[q];
  try {
    const r = await fetch("https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(q + ", Severna Makedonija") + "&format=json&limit=1&countrycodes=mk", { headers: { "User-Agent": "PrometInfo/0.1 (branko.trivic@gmail.com)" } });
    const j = await r.json();
    const res = j[0] ? { lat: +(+j[0].lat).toFixed(5), lng: +(+j[0].lon).toFixed(5) } : null;
    cache[q] = res; writeFileSync(cachePath, JSON.stringify(cache)); await sleep(1100);
    return res;
  } catch { return null; }
}

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36" });
await p.goto("https://roads.org.mk/patna-mreza/video-kameri/", { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
await p.waitForSelector(".leaflet-marker-icon", { timeout: 35000 }).catch(() => {});
await p.waitForTimeout(3500);
const markers = await p.$$(".leaflet-marker-icon");
console.log("markerjev:", markers.length);

const found = new Map(); // slug -> stream
for (let i = 0; i < markers.length; i++) {
  try {
    await markers[i].click();
    await p.waitForTimeout(1500);
    const srcs = await p.evaluate(() => [...document.querySelectorAll(".leaflet-popup-content iframe")].map((f) => f.src));
    for (const s of srcs) {
      const mm = s.match(/src=(https:\/\/[^"'&]+\.m3u8)/i);
      if (mm) { const slug = (mm[1].match(/stream\/([a-z0-9_-]+?)(?:_\d+)?\.m3u8/i) || [])[1]; if (slug && !found.has(slug)) found.set(slug, mm[1]); }
    }
    await p.keyboard.press("Escape").catch(() => {});
  } catch {}
}
await b.close();
console.log("najdenih tokov:", found.size);

const cams = [];
for (const [slug, stream] of found) {
  const name = pretty(slug);
  const co = await geocode(name);
  cams.push({ name, stream, lat: co ? co.lat : null, lng: co ? co.lng : null });
}
const ts =
  "// SAMODEJNO ZAJETO (headless): AMSM/roads.org.mk kamere (S. Makedonija) — ZIVI HLS toki.\n" +
  "export interface AmsmCam { name: string; stream: string; lat: number | null; lng: number | null }\n" +
  "export const AMSM_CAMS: AmsmCam[] = " + JSON.stringify(cams, null, 1) + ";\n";
writeFileSync(resolve(ROOT, "lib/amsm-cameras.ts"), ts, "utf8");
console.log(`ZAPISANO lib/amsm-cameras.ts | kamer: ${cams.length} | geokodiranih: ${cams.filter((c) => c.lat != null).length}`);
cams.forEach((c) => console.log("  - " + c.name + (c.lat ? "" : " (brez koord)")));
