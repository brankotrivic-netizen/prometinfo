// Osvezi seznam slovenskih kamer iz NAP (b2b.nap.si) -> lib/si-road-cameras.ts
// Poverilnice prek okoljskih spremenljivk (NE shranjuj gesla v kodo):
//   NAP_USER=... NAP_PASS=... node scripts/refresh-si-cams.mjs
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const user = process.env.NAP_USER, pass = process.env.NAP_PASS;
if (!user || !pass) {
  console.warn("OPOZORILO: NAP_USER/NAP_PASS nista nastavljena — preskocim (obdrzim obstojece SI kamere).");
  process.exit(0);
}

const auth = "Basic " + Buffer.from(user + ":" + pass).toString("base64");
let j;
try {
  const r = await fetch("https://b2b.nap.si/data/b2b.cameras.geojson", {
    headers: { Authorization: auth, "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(60000),
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  j = JSON.parse((await r.text()).replace(/^﻿/, ""));
} catch (e) {
  console.warn("OPOZORILO: NAP klic ni uspel (" + e.message + ") — obdrzim obstojece SI kamere.");
  process.exit(0);
}

const groups = [];
for (const f of j.features) {
  const g = f.properties.group || {};
  const items = f.properties.items || [];
  const c = f.geometry && f.geometry.coordinates;
  if (!c) continue;
  const region = (items[0]?.region || "").trim() || "Slovenija";
  const cams = items.filter((i) => i.image).map((i) => ({ name: (i.title_slo || i.name || "").trim(), image: i.image }));
  if (!cams.length) continue;
  groups.push({ title: (g.title_slo || g.name || "").trim(), region, lat: +(+c[1]).toFixed(5), lng: +(+c[0]).toFixed(5), cams });
}
const ts =
  "// SAMODEJNO ZAJETO: uradne slovenske kamere (NAP / DARS, b2b.nap.si).\n" +
  "// Koordinate iz GeoJSON; image = javna DARS JPEG slika (osvezuje se).\n" +
  "export interface SiCam { name: string; image: string }\n" +
  "export interface SiCamGroup { title: string; region: string; lat: number; lng: number; cams: SiCam[] }\n" +
  "export const SI_CAMS: SiCamGroup[] = " + JSON.stringify(groups) + ";\n";
// zascita pred izpraznitvijo: zapisi le, ce je nabor smiseln
if (groups.length < 50) {
  console.warn(`OPOZORILO: le ${groups.length} lokacij (prag 50) — obdrzim obstojece.`);
  process.exit(0);
}
writeFileSync(resolve(ROOT, "lib/si-road-cameras.ts"), ts, "utf8");
console.log(`Osveženo: ${groups.length} lokacij, ${groups.reduce((s, g) => s + g.cams.length, 0)} kamer.`);
