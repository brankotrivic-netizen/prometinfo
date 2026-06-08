// AI ocena gnece na mejnih prehodih: za vsak prehod analizira do 2 kameri
// (obe smeri), s Claude Haiku 4.5 (vision). Steje SAMO vozila v koloni proti
// rampi (NE parkiranih), in oznaci smer (vstop v BiH / izstop iz BiH).
// Zapise v lib/ai-congestion.ts. Rabi ANTHROPIC_API_KEY (env/secret).
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { safeWriteTs } from "./_safewrite.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-4-5-20251001";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";
const MAX_PER_CROSSING = 2;

function loadCams(file) {
  try {
    const txt = readFileSync(resolve(ROOT, file), "utf8");
    const m = /=\s*(\[[\s\S]*\])\s*;?\s*$/m.exec(txt);
    if (!m) return [];
    return JSON.parse(m[1]);
  } catch (e) {
    console.warn("Ne morem prebrati", file, e.message);
    return [];
  }
}

const cams = [
  ...loadCams("lib/amsrs-cameras.ts"),
  ...loadCams("lib/bihamk-cameras.ts"),
].filter((c) => c && c.image && c.lat != null && c.lng != null);

// smer iz imena kamere (kjer je navedena; zasilno, ce ni c.dir)
function dirFromName(name) {
  if (/izlaz|izhod|exit|izstop/i.test(name)) return "izstop";
  if (/ulaz|ulazak|entry|vhod|vstop/i.test(name)) return "vstop";
  return null;
}
// ime prehoda brez smernega/kamernega pripona
function crossingName(name) {
  return String(name)
    .replace(/\s*·\s*(vstop|izstop|kam)\b.*$/i, "")
    .replace(/\s*[-–]\s*(izlaz|ulaz)\b.*$/i, "")
    .trim();
}

// grupiraj po prehodu; do MAX_PER_CROSSING kamer na prehod
const groups = new Map();
for (const c of cams) {
  const key = `${(+c.lat).toFixed(2)},${(+c.lng).toFixed(2)}`;
  const crossing = crossingName(c.name);
  if (!groups.has(key)) groups.set(key, { key, crossing, lat: +c.lat, lng: +c.lng, cams: [] });
  const g = groups.get(key);
  if (g.cams.length < MAX_PER_CROSSING) g.cams.push({ name: c.name, image: c.image, dir: c.dir || dirFromName(c.name) });
}

// ploščati seznam nalog (kamera = ena naloga)
const tasks = [];
for (const g of groups.values()) for (const cam of g.cams) tasks.push({ ...g, cam });
console.log(`Prehodov: ${groups.size} | kamer za oceno: ${tasks.length}`);

const PROMPT = `Si prometni analitik. Slika je s cestne kamere na mejnem prehodu (BiH stran).
Štej SAMO vozila, ki čakajo V KOLONI proti mejni rampi/kabinam.
NE štej: parkiranih vozil na parkirišču, tovornjakov ob strani, vozil v carinskem dvorišču, ki ne stojijo v koloni.
Če jasne kolone proti rampi NI, vrni vehicles:0 in level "prosto".
Določi tudi smer glavnega prometnega toka na sliki: "vstop" če vozila peljejo PROTI meji (vstopajo v BiH), "izstop" če peljejo OD meje (izstopajo iz BiH), sicer "neznano".
Odgovori SAMO z JSON (brez razlage):
{"level":"prosto|zmerno|gneca|zastoj","vehicles":<stevilo vozil v koloni, celo stevilo>,"dir":"vstop|izstop|neznano","waitMin":"<priblizno cakanje, npr. 0-5, 10-20, 30+>","note":"<kratka opomba slo, max 8 besed>","readable":<true ce jasno, false ce tema/megla/crna/nedelujoca>}
Lestvica kolone: prosto=0-3, zmerno=4-10, gneca=11-25, zastoj=26+.`;

async function analyze(t) {
  let b64, mt = "image/jpeg";
  try {
    const r = await fetch(t.cam.image, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error("slika HTTP " + r.status);
    mt = r.headers.get("content-type") || mt;
    if (!/image\//.test(mt)) mt = "image/jpeg";
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) throw new Error("slika premajhna (" + buf.length + "B)");
    b64 = buf.toString("base64");
  } catch (e) {
    console.warn(`  ${t.cam.name}: slika napaka — ${e.message}`);
    return null;
  }
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      signal: AbortSignal.timeout(40000),
      body: JSON.stringify({
        model: MODEL, max_tokens: 250,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: mt, data: b64 } },
          { type: "text", text: PROMPT },
        ] }],
      }),
    });
    const j = await resp.json();
    if (!resp.ok) throw new Error("API " + resp.status + " " + (j?.error?.message || ""));
    const text = (j.content || []).map((c) => c.text || "").join("");
    const m = /\{[\s\S]*\}/.exec(text);
    if (!m) throw new Error("ni JSON");
    const o = JSON.parse(m[0]);
    const lvl = ["prosto", "zmerno", "gneca", "zastoj"].includes(o.level) ? o.level : "neznano";
    const dir = t.cam.dir || (["vstop", "izstop"].includes(o.dir) ? o.dir : "neznano");
    const dirLabel = dir === "vstop" ? "vstop v BiH" : dir === "izstop" ? "izstop iz BiH" : "smer neznana";
    return {
      key: t.key, crossing: t.crossing, camName: t.cam.name, lat: t.lat, lng: t.lng, image: t.cam.image,
      dir, dirLabel, level: lvl,
      vehicles: Number.isFinite(o.vehicles) ? o.vehicles : null,
      waitMin: typeof o.waitMin === "string" ? o.waitMin.slice(0, 12) : "",
      note: typeof o.note === "string" ? o.note.slice(0, 60) : "",
      readable: o.readable !== false,
      ts: new Date().toISOString(),
    };
  } catch (e) {
    console.warn(`  ${t.cam.name}: AI napaka — ${e.message}`);
    return null;
  }
}

const results = [];
const POOL = 3;
let i = 0;
async function worker() {
  while (i < tasks.length) {
    const t = tasks[i++];
    const res = await analyze(t);
    if (res) {
      results.push(res);
      console.log(`  ✓ ${res.crossing} [${res.dirLabel}]: ${res.level}${res.vehicles != null ? " · " + res.vehicles + " voz." : ""} · ${res.waitMin || "?"} min${res.readable ? "" : " (slabo vidno)"}`);
    }
  }
}

if (!KEY) {
  console.warn("OPOZORILO: ANTHROPIC_API_KEY ni nastavljen — preskocim AI oceno (obdrzim obstojece).");
} else {
  await Promise.all(Array.from({ length: POOL }, worker));
  results.sort((a, b) => a.crossing.localeCompare(b.crossing) || a.dir.localeCompare(b.dir));
}

const ts =
  "// SAMODEJNO ZAJETO: AI ocena gnece na mejnih prehodih (Claude Haiku 4.5 vision).\n" +
  "// Steje le vozila v koloni proti rampi (NE parkiranih); locuje smer (vstop v BiH / izstop iz BiH).\n" +
  "// OPOMBA: ocena je PRIBLIZEK iz slike — ni uradni podatek.\n" +
  "export interface AiCongestion { key: string; crossing: string; camName: string; lat: number; lng: number; image: string; dir: string; dirLabel: string; level: string; vehicles: number | null; waitMin: string; note: string; readable: boolean; ts: string }\n" +
  "export const AI_CONGESTION: AiCongestion[] = " + JSON.stringify(results, null, 1) + ";\n";

safeWriteTs(resolve(ROOT, "lib/ai-congestion.ts"), ts, results.length, 3, "lib/ai-congestion.ts (AI gneca)");
console.log(`Ocen: ${results.length}/${tasks.length}`);
