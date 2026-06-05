// Zajame AMS-RS kamere mejnih prehodov (Republika Srpska / BiH) -> lib/amsrs-cameras.ts
// Slika kamere: https://gp.satwork.net/AMSRS_<id>_GP_CA0x/slika.jpg (javna, osvezuje se).
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { safeWriteTs } from "./_safewrite.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// slug -> [ime, lat, lng]  (koordinate iz registra prehodov)
const GP = {
  "gradiska": ["GP Gradiška", 45.14, 17.25],
  "gradina-gradina-donja": ["GP Gradina (Donja Gradina)", 45.27, 16.93],
  "raca": ["GP Rača", 44.90, 19.32],
  "zupci": ["GP Zupci", 42.68, 18.40],
  "brod": ["GP Brod", 45.14, 17.99],
  "sepak": ["GP Šepak", 44.55, 19.18],
  "karakaj": ["GP Karakaj", 44.40, 19.13],
  "kozarska-dubica": ["GP Kozarska Dubica", 45.18, 16.81],
  "novi-grad": ["GP Novi Grad", 45.05, 16.38],
  "kostajnica": ["GP Kostajnica", 45.22, 16.55],
  "klobuk": ["GP Klobuk", 42.92, 18.45],
  "hum": ["GP Hum", 43.34, 18.84],
  "svilaj": ["GP Svilaj", 45.10, 18.18],
  "samac": ["GP Šamac", 45.06, 18.46],
  "pavlovica-most": ["GP Pavlovića most", 44.73, 19.31],
  "visegrad": ["GP Višegrad", 43.78, 19.40],
};

const cams = [];
for (const [slug, [name, lat, lng]] of Object.entries(GP)) {
  try {
    const r = await fetch("https://ams-rs.com/granicni-prelaz-" + slug + "/", { headers: { "User-Agent": UA, "Accept-Language": "sr,bs,hr;q=0.8" } });
    const html = await r.text();
    const imgs = [...new Set([...html.matchAll(/src=["'](https:\/\/gp\.satwork\.net\/[A-Za-z0-9_]+\/slika\.jpg)/gi)].map((m) => m[1]))];
    if (!imgs.length) { console.log(slug, "0 kamer"); continue; }
    imgs.forEach((img, i) => {
      cams.push({ name: imgs.length > 1 ? `${name} · kam ${i + 1}` : name, image: img, lat, lng });
    });
    console.log(`${slug}: ${imgs.length}`);
  } catch (e) {
    console.log(slug, "napaka:", e.message);
  }
}

const ts =
  "// SAMODEJNO ZAJETO: AMS-RS kamere mejnih prehodov (Republika Srpska / BiH, gp.satwork.net). Javne JPEG slike (osvezujejo se).\n" +
  "export interface AmsrsCam { name: string; image: string; lat: number; lng: number }\n" +
  "export const AMSRS_CAMS: AmsrsCam[] = " + JSON.stringify(cams, null, 1) + ";\n";
safeWriteTs(resolve(ROOT, "lib/amsrs-cameras.ts"), ts, cams.length, 10, "lib/amsrs-cameras.ts (AMS-RS GP)");
console.log(`Skupaj kamer: ${cams.length} | prehodov: ${Object.keys(GP).length}`);
