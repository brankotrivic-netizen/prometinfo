// AI ocena gnece na mejnih prehodih (Claude Haiku 4.5 vision).
// Viri kamer: AMS-RS + BIHAMK (BiH stran) in HAK (HR stran, npr. Gornji Varos).
// Steje SAMO vozila v koloni proti rampi (NE parkiranih). Smer = v katero
// drzavo kolona vstopa (npr. "vstop v BiH" / "vstop v Hrvasko").
// Zapise lib/ai-congestion.ts. Rabi ANTHROPIC_API_KEY (env/secret).
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { safeWriteTs } from "./_safewrite.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-4-5-20251001";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";
const MAX_BA = 2;        // do 2 kameri BiH strani na prehod
const MAX_OTHER_CAMS = 3; // do 3 HAK kamere na prehod (vsaka do 2 sliki = obe smeri)

const CNAME = { BA: "BiH", HR: "Hrvaško", RS: "Srbijo", SI: "Slovenijo", ME: "Črno goro", MK: "S. Makedonijo", AT: "Avstrijo", HU: "Madžarsko", RO: "Romunijo", BG: "Bolgarijo", AL: "Albanijo", GR: "Grčijo", XK: "Kosovo" };

function readArr(file) {
  try { const t = readFileSync(resolve(ROOT, file), "utf8"); const m = /=\s*(\[[\s\S]*\])\s*;?\s*$/m.exec(t); return m ? JSON.parse(m[1]) : []; }
  catch (e) { console.warn("Ne morem brati", file, e.message); return []; }
}
function readObj(file) {
  try { const t = readFileSync(resolve(ROOT, file), "utf8"); const m = /=\s*(\{[\s\S]*\})\s*;?\s*$/m.exec(t); return m ? JSON.parse(m[1]) : {}; }
  catch (e) { console.warn("Ne morem brati", file, e.message); return {}; }
}

// --- prehodi: country/neighbor/coords iz crossings.ts ---
const crossings = [];
{
  const t = readFileSync(resolve(ROOT, "lib/crossings.ts"), "utf8");
  const re = /"([a-z]{2}-[a-z0-9-]+)":\s*\{\s*country:\s*"([A-Z]{2})",\s*neighbor:\s*"([A-Z]{2})",\s*lat:\s*([\d.]+),\s*lng:\s*([\d.]+)\s*\}/g;
  let m;
  while ((m = re.exec(t))) crossings.push({ id: m[1], country: m[2], neighbor: m[3], lat: +m[4], lng: +m[5] });
}
function crossingAt(lat, lng) {
  let best = null, bd = 0.06;
  for (const c of crossings) {
    const d = Math.abs(c.lat - lat) + Math.abs(c.lng - lng);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

// --- kamere BiH strani (AMS-RS + BIHAMK), smer iz imena ---
const baCams = [];
for (const c of [...readArr("lib/amsrs-cameras.ts"), ...readArr("lib/bihamk-cameras.ts")]) {
  if (!c || !c.image || c.lat == null || c.lng == null) continue;
  let dir = c.dir || null;
  if (!dir) { if (/izlaz|izhod/i.test(c.name)) dir = "izstop"; else if (/ulaz|ulazak/i.test(c.name)) dir = "vstop"; }
  baCams.push({ image: c.image, name: c.name, lat: +c.lat, lng: +c.lng, side: "BA", baDir: dir });
}

// --- HAK kamere (HR strani; smer doloci AI) ---
const hakCamsRaw = [];
{
  const t = readFileSync(resolve(ROOT, "lib/hak-cameras.ts"), "utf8");
  const imgs = readObj("lib/hak-cam-images.ts");
  for (const o of [...t.matchAll(/\{[^{}]*\}/g)].map((m) => m[0])) {
    const cid = /crossingId:\s*"([^"]+)"/.exec(o); if (!cid) continue;
    const k = /k:\s*(\d+)/.exec(o); if (!k) continue;
    const arr = imgs[k[1]]; if (!arr || !arr.length) continue;
    const nm = /name:\s*"([^"]+)"/.exec(o); const lat = /lat:\s*([\d.]+)/.exec(o); const lng = /lng:\s*([\d.]+)/.exec(o);
    const base = nm ? nm[1] : "HAK";
    arr.slice(0, 2).forEach((img, ix) => {
      hakCamsRaw.push({ image: img, name: arr.length > 1 ? `${base} · kam ${ix + 1}` : base, lat: lat ? +lat[1] : null, lng: lng ? +lng[1] : null, side: "HAK", k: k[1], crossingId: cid[1] });
    });
  }
}

// --- grupiraj po prehodu, omeji kamere na stran ---
const groups = new Map();
function addToGroup(cam) {
  const cr = crossingAt(cam.lat, cam.lng);
  if (!cr) return;
  if (!groups.has(cr.id)) groups.set(cr.id, { cr, ba: [], other: [], otherKs: new Set() });
  const g = groups.get(cr.id);
  if (cam.side === "BA") { if (g.ba.length < MAX_BA) g.ba.push(cam); }
  else { if (g.otherKs.has(cam.k) || g.otherKs.size < MAX_OTHER_CAMS) { g.otherKs.add(cam.k); g.other.push(cam); } }
}
baCams.forEach(addToGroup);
hakCamsRaw.forEach(addToGroup);

const tasks = [];
for (const g of groups.values()) for (const cam of [...g.ba, ...g.other]) tasks.push({ cr: g.cr, cam });
console.log(`Prehodov: ${groups.size} | kamer za oceno: ${tasks.length}`);

function basePrompt(cr) {
  const X = CNAME[cr.country] || cr.country, Y = CNAME[cr.neighbor] || cr.neighbor;
  return `Si prometni analitik. Slika je s cestne kamere na mejnem prehodu med ${X} in ${Y}.
Predstavljaj si REFERENČNO ČRTO čez cesto pri mejni rampi/kabinah. Oceni, KAKO DALEČ NAZAJ od rampe sega KOLONA stoječih/čakajočih vozil na dovozni cesti.
Upoštevaj LE vozila v koloni proti rampi — NE parkiranih, NE vozil na parkirišču ali ob strani.
"extent" (dolžina kolone):
  - "brez" = ni kolone, cesta prosta (morda posamezno vozilo pri rampi)
  - "kratka" = kratka kolona tik pri rampi (vozila do ~četrtine vidne ceste)
  - "srednja" = kolona sega do ~polovice vidne dovozne ceste
  - "dolga" = kolona čez skoraj cel viden del ceste ali do roba slike
"level" izhaja iz extent: brez=prosto, kratka=zmerno, srednja=gneca, dolga=zastoj.
Preštej tudi "lanes" = koliko VZPOREDNIH KOLON (pasov) stoječih/čakajočih vozil je v koloni (0 če prazno).
Določi, v katero državo kolona VSTOPA (čaka na kontrolo): "${cr.country}" (=${X}) ali "${cr.neighbor}" (=${Y}); če ni jasno, "neznano".
POMEMBNO: če so na sliki oznake smeri (puščice z imeni držav, npr. "▲ BiH ▲", "▼ HR ▼"), jih UPOŠTEVAJ — kolona pelje proti označeni državi tiste strani ceste.
Odgovori SAMO z JSON: {"level":"prosto|zmerno|gneca|zastoj","extent":"brez|kratka|srednja|dolga","lanes":<int>,"enter":"${cr.country}|${cr.neighbor}|neznano","note":"<kratka opomba slo, max 8 besed>","readable":<true|false>}`;
}

async function analyze(t) {
  const { cr, cam } = t;
  let b64, mt = "image/jpeg";
  try {
    const r = await fetch(cam.image, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error("slika HTTP " + r.status);
    mt = r.headers.get("content-type") || mt; if (!/image\//.test(mt)) mt = "image/jpeg";
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) throw new Error("slika premajhna");
    b64 = buf.toString("base64");
  } catch (e) { console.warn(`  ${cam.name}: slika napaka — ${e.message}`); return null; }

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      signal: AbortSignal.timeout(40000),
      body: JSON.stringify({ model: MODEL, max_tokens: 250, messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mt, data: b64 } },
        { type: "text", text: basePrompt(cr) },
      ] }] }),
    });
    const j = await resp.json();
    if (!resp.ok) throw new Error("API " + resp.status + " " + (j?.error?.message || ""));
    const text = (j.content || []).map((c) => c.text || "").join("");
    const mm = /\{[\s\S]*\}/.exec(text); if (!mm) throw new Error("ni JSON");
    const o = JSON.parse(mm[0]);
    const EXT = ["brez", "kratka", "srednja", "dolga"];
    const extent = EXT.includes(o.extent) ? o.extent : "brez";
    // level izpeljemo iz extent (zanesljiveje kot da ga AI poda posebej)
    const EXT2LVL = { brez: "prosto", kratka: "zmerno", srednja: "gneca", dolga: "zastoj" };
    let lvl = EXT2LVL[extent];
    if (!lvl) lvl = ["prosto", "zmerno", "gneca", "zastoj"].includes(o.level) ? o.level : "neznano";

    // doloci v katero drzavo vstopa
    let enter = null;
    if (cam.side === "BA" && cam.baDir) enter = cam.baDir === "vstop" ? cr.country : cr.neighbor; // ulaz=v BA, izlaz=v sosednjo
    if (!enter) enter = [cr.country, cr.neighbor].includes(o.enter) ? o.enter : null;
    // Gornji Varos (HAK, HR stran) -> obe kameri kazeta kolono PROTI Hrvaski
    if (/gornji varo/i.test(cam.name)) enter = cr.neighbor; // ba-gradiska: neighbor = HR
    const dirLabel = enter ? `vstop v ${CNAME[enter] || enter}` : "smer neznana";

    return {
      crId: cr.id, crossing: cam.name, side: cam.side, lat: cam.lat, lng: cam.lng, image: cam.image,
      enter: enter || "neznano", dirLabel, level: lvl, extent,
      lanes: Number.isFinite(o.lanes) ? o.lanes : null,
      note: typeof o.note === "string" ? o.note.slice(0, 60) : "",
      readable: o.readable !== false,
      ts: new Date().toISOString(),
    };
  } catch (e) { console.warn(`  ${cam.name}: AI napaka — ${e.message}`); return null; }
}

const results = [];
let i = 0;
async function worker() {
  while (i < tasks.length) {
    const t = tasks[i++];
    const res = await analyze(t);
    if (res) { results.push(res); console.log(`  ✓ ${res.crossing} [${res.dirLabel}]: ${res.level} · kolona: ${res.extent}${res.lanes != null ? " · " + res.lanes + " pas" : ""}${res.readable ? "" : " (slabo vidno)"}`); }
  }
}

if (!KEY) {
  console.warn("OPOZORILO: ANTHROPIC_API_KEY ni nastavljen — preskocim (obdrzim obstojece).");
} else {
  await Promise.all(Array.from({ length: 3 }, worker));
  results.sort((a, b) => a.crId.localeCompare(b.crId));
}

const ts =
  "// SAMODEJNO ZAJETO: AI ocena gnece na mejnih prehodih (Claude Haiku 4.5 vision).\n" +
  "// Viri: AMS-RS + BIHAMK (BiH stran) in HAK (HR stran). Steje le kolono proti rampi (ne parkiranih).\n" +
  "// 'enter' = koda drzave, v katero kolona vstopa. OPOMBA: priblizek iz slike, ni uradni podatek.\n" +
  "export interface AiCongestion { crId: string; crossing: string; side: string; lat: number; lng: number; image: string; enter: string; dirLabel: string; level: string; extent: string; lanes: number | null; note: string; readable: boolean; ts: string }\n" +
  "export const AI_CONGESTION: AiCongestion[] = " + JSON.stringify(results, null, 1) + ";\n";

safeWriteTs(resolve(ROOT, "lib/ai-congestion.ts"), ts, results.length, 3, "lib/ai-congestion.ts (AI gneca)");
console.log(`Ocen: ${results.length}/${tasks.length}`);
