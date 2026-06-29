// Zive cakalne dobe na mejnih prehodih (HAK / MUP RH) -> lib/hak-waits.ts
// Vir: tabela "Cekanje na granicnim prijelazima" na www.hak.hr/info/stanje-na-cestama
// (objavljeni so le prehodi, ki TRENUTNO imajo cakanje). Osebna vozila: Ulaz / Izlaz.
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync, existsSync } from "node:fs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "lib/hak-waits.ts");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";

// HAK ime prehoda (osnovno, brez "GP" in oklepaja) -> nas crossingId (lib/crossings.ts)
const NAME2ID = {
  "jasenovac": "ba-gradina", "donja gradina": "ba-gradina",
  "stara gradiska": "ba-gradiska", "gornji varos": "ba-gradiska",
  "bajakovo": "hr-bajakovo", "batina": "hr-batina", "erdut": "hr-erdut",
  "ilok": "hr-ilok", "tovarnik": "hr-tovarnik",
  "gunja": "ba-brcko", "zupanja": "ba-orasje", "slavonski samac": "ba-samac",
  "svilaj": "ba-svilaj", "slavonski brod": "ba-brod",
  "hrvatska kostajnica": "ba-kostajnica", "maljevac": "ba-velika-kladusa",
  "licko petrovo selo": "ba-izacic", "kamensko": "ba-kamensko",
  "nova sela": "ba-bijaca", "metkovic": "ba-doljani", "klek": "ba-neum-i",
};

const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const deacc = (s) => strip(s).toLowerCase().normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "");

function toMin(txt) {
  const t = deacc(txt);
  if (!t || t === "-" || /nema|bez podat/.test(t)) return null;
  let h = 0, m = 0;
  const mh = /(\d+)\s*h/.exec(t); if (mh) h = +mh[1];
  const mm = /(\d+)\s*min/.exec(t); if (mm) m = +mm[1];
  if (!mh && !mm) { const n = /(\d+)/.exec(t); if (n) m = +n[1]; }
  return h * 60 + m;
}
function level(min) {
  if (min == null) return "unknown";
  if (min <= 0) return "none";
  if (min <= 30) return "low";
  if (min <= 60) return "moderate";
  if (min <= 120) return "high";
  return "severe";
}
// "28.6.2026. 23:57:07" -> ISO z +02:00 (CEST); za izracun starosti
function toISO(ts) {
  const m = /(\d{1,2})\.(\d{1,2})\.(\d{4})\.?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(String(ts || ""));
  if (!m) return "";
  const [, d, mo, y, h, mi, s] = m;
  const p = (n) => String(n).padStart(2, "0");
  return `${y}-${p(mo)}-${p(d)}T${p(h)}:${p(mi)}:${p(s || "00")}+02:00`;
}
function mapId(hakName) {
  const base = deacc(hakName).replace(/\bgp\b/g, "").replace(/\(.*?\)/g, "").trim();
  const paren = (/\((.*?)\)/.exec(strip(hakName)) || [])[1];
  for (const key of [base, deacc(paren || "")]) {
    if (key && NAME2ID[key]) return NAME2ID[key];
  }
  // delno ujemanje (kljucna beseda)
  for (const k of Object.keys(NAME2ID)) if (base.includes(k) || k.includes(base)) return NAME2ID[k];
  return null;
}

let html = "";
try {
  const r = await fetch("https://www.hak.hr/info/stanje-na-cestama", { headers: { "User-Agent": UA, "Accept-Language": "hr" }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  html = await r.text();
} catch (e) {
  console.warn("OPOZORILO: HAK strani ni bilo mogoce dobiti (" + e.message + "). Obdrzim obstojece.");
  if (!existsSync(OUT)) writeFileSync(OUT, emptyTs(), "utf8");
  process.exit(0);
}

// vse vrstice tabele cakanj: gpime + 4x gpUnos (Ulaz auto, Ulaz tovor, Izlaz auto, Izlaz tovor)
const rowRe = /<td class="gpime">([\s\S]*?)<\/td>\s*((?:<td class="gpUnos"[^>]*>[\s\S]*?<\/td>\s*){4})/g;
const waits = [];
let m;
while ((m = rowRe.exec(html))) {
  const name = strip(m[1]);
  const cells = [...m[2].matchAll(/<td class="gpUnos"[^>]*>([\s\S]*?)<\/td>/g)].map((c) => {
    const tip = (/<span[^>]*>([\s\S]*?)<\/span>/.exec(c[1]) || [])[1] || "";
    const val = strip(c[1].replace(/<span[\s\S]*?<\/span>/g, ""));
    return { val, ts: strip(tip).replace(/^T:\s*/i, "") };
  });
  if (!cells.length) continue;
  const ulazTxt = cells[0].val, izlazTxt = cells[2] ? cells[2].val : "-";
  const ulazMin = toMin(ulazTxt), izlazMin = toMin(izlazTxt);
  if (ulazMin == null && izlazMin == null) continue; // brez podatka -> preskoci
  const id = mapId(name);
  const worst = Math.max(ulazMin == null ? -1 : ulazMin, izlazMin == null ? -1 : izlazMin);
  const ts = cells[0].ts || (cells[2] && cells[2].ts) || "";
  waits.push({
    id: id || "", name, ulazMin, izlazMin, ulazTxt, izlazTxt,
    level: level(worst < 0 ? null : worst),
    waitMinutes: worst < 0 ? null : worst,
    ts, tsISO: toISO(ts),
  });
}

function emptyTs() {
  return "// SAMODEJNO ZAJETO: zive cakalne dobe HAK/MUP. Trenutno brez objavljenih cakanj.\n" +
    "export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }\n" +
    "export const HAK_WAITS: HakWait[] = [];\n";
}
const ts =
  "// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).\n" +
  "// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).\n" +
  "export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }\n" +
  "export const HAK_WAITS: HakWait[] = " + JSON.stringify(waits, null, 1) + ";\n";

// stran smo uspesno dobili -> vedno zapisi (prazno je veljavno stanje "ni zastojev")
writeFileSync(OUT, waits.length ? ts : emptyTs(), "utf8");
console.log(`ZAPISANO lib/hak-waits.ts | prehodov s cakanjem: ${waits.length}`);
waits.forEach((w) => console.log(`  ${w.name} -> ${w.id || "(NEZNAN ID)"} | vstop ${w.ulazTxt} / izstop ${w.izlazTxt}`));
