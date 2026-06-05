// Zajame BIHAMK kamere (BiH) -> lib/bihamk-cameras.ts (slika + koordinate)
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const clean = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// Priblizne koordinate po imenu datoteke (GP = mejni prehodi, ostalo notranje).
const COORDS = {
  SKENDERIJA: [43.857, 18.413], ORASJE: [45.03, 18.69], MAKLJEN: [43.97, 17.62],
  KAMENSKO: [43.65, 16.86], CRVENIGRM: [43.20, 17.65], BROD2: [45.143, 17.993],
  BROD1: [45.139, 17.988], SEPAK: [44.55, 19.18], DOLJANI: [43.02, 17.55],
  PRISIKA: [43.45, 17.28], STUP: [43.835, 18.345], BRIJESCE: [43.855, 18.335],
  BIJACA: [43.17, 17.49], IZACIC: [44.85, 15.78], SIPOREX: [44.54, 18.68],
};

const r = await fetch("https://bihamk.ba/spi/kamere", { headers: { "User-Agent": UA, "Accept-Language": "bs,hr,sr;q=0.8" } });
const html = await r.text();
const arts = [...html.matchAll(/<article[\s\S]*?<\/article>/gi)].map((x) => x[0]);
const cams = [];
for (const a of arts) {
  const img = (a.match(/src=["'](https:\/\/video-nadzor[^"'?]+)/) || [])[1];
  if (!img) continue;
  let name = (a.match(/(?:alt|title)=["']([^"']{3,60})["']/) || [])[1] || "";
  if (!name) name = clean((a.match(/<h[1-5][^>]*>([\s\S]*?)<\/h[1-5]>/) || [])[1] || "");
  const key = img.split("/").pop().replace(/\.jpg.*$/i, "");
  const c = COORDS[key];
  cams.push({ name: clean(name) || key, image: img, lat: c ? c[0] : null, lng: c ? c[1] : null });
}

const ts =
  "// SAMODEJNO ZAJETO: BIHAMK kamere (BiH, video-nadzor.bihamk.ba). Javne JPEG slike (osvezujejo se).\n" +
  "export interface BihCam { name: string; image: string; lat: number | null; lng: number | null }\n" +
  "export const BIHAMK_CAMS: BihCam[] = " + JSON.stringify(cams, null, 1) + ";\n";
writeFileSync(resolve(ROOT, "lib/bihamk-cameras.ts"), ts, "utf8");
console.log(`ZAPISANO lib/bihamk-cameras.ts | kamer: ${cams.length} | s koordinatami: ${cams.filter((c) => c.lat != null).length}`);
cams.forEach((c) => console.log("  - " + c.name + (c.lat ? "" : " (BREZ KOORD)")));
