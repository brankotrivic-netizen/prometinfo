// AI ocena gnece na mejnih prehodih: vzame eno sliko na prehod (direktne JPEG
// kamere AMS-RS + BIHAMK), jo poslje Claude Haiku 4.5 (vision) in zapise oceno
// (prosto/zmerno/gneca/zastoj + priblizno cakanje) v lib/ai-congestion.ts.
//
// Zazene se v cron osvezitvi (npm run refresh). Rabi ANTHROPIC_API_KEY (env/secret).
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { safeWriteTs } from "./_safewrite.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-4-5-20251001";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36";

// --- preberi kamere iz .ts datotek (cista JSON polja) ---
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

// --- grupiraj po prehodu (zaokrozene koordinate); ena slika na prehod ---
const groups = new Map();
for (const c of cams) {
  const key = `${(+c.lat).toFixed(2)},${(+c.lng).toFixed(2)}`;
  if (!groups.has(key)) {
    const name = String(c.name).replace(/\s*·\s*kam.*$/i, "").trim();
    groups.set(key, { key, name, lat: +c.lat, lng: +c.lng, image: c.image });
  }
}
const list = [...groups.values()];
console.log(`Prehodov za oceno: ${list.length}`);

const PROMPT = `Si prometni analitik. Na sliki je mejni prehod (cestna kamera). Oceni gnečo vozil v koloni proti rampi.
Odgovori SAMO z JSON (brez ovojnice, brez razlage):
{"level":"prosto|zmerno|gneca|zastoj","vehicles":<priblizno stevilo vidnih vozil v koloni, celo stevilo ali null>,"waitMin":"<priblizen cas cakanja v minutah, npr. 0-5, 10-20, 30+>","note":"<kratka opomba v slovenscini, max 8 besed>","readable":<true ce slika jasna, false ce tema/megla/crna/nedelujoca>}
Lestvica: prosto=0-3 vozil, zmerno=4-10, gneca=11-25, zastoj=26+.`;

async function analyze(item) {
  // 1) prenesi sliko (brez Referer -> satwork ne vraca 410)
  let b64, mt = "image/jpeg";
  try {
    const r = await fetch(item.image, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error("slika HTTP " + r.status);
    mt = r.headers.get("content-type") || mt;
    if (!/image\//.test(mt)) mt = "image/jpeg";
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) throw new Error("slika premajhna (" + buf.length + "B)");
    b64 = buf.toString("base64");
  } catch (e) {
    console.warn(`  ${item.name}: slika napaka — ${e.message}`);
    return null;
  }
  // 2) vprasaj Claude
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      signal: AbortSignal.timeout(40000),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 250,
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
    if (!m) throw new Error("ni JSON v odgovoru");
    const o = JSON.parse(m[0]);
    const lvl = ["prosto", "zmerno", "gneca", "zastoj"].includes(o.level) ? o.level : "neznano";
    return {
      key: item.key, name: item.name, lat: item.lat, lng: item.lng, image: item.image,
      level: lvl,
      vehicles: Number.isFinite(o.vehicles) ? o.vehicles : null,
      waitMin: typeof o.waitMin === "string" ? o.waitMin.slice(0, 12) : "",
      note: typeof o.note === "string" ? o.note.slice(0, 60) : "",
      readable: o.readable !== false,
      ts: new Date().toISOString(),
    };
  } catch (e) {
    console.warn(`  ${item.name}: AI napaka — ${e.message}`);
    return null;
  }
}

// --- zazeni z majhno paralelo (3 hkrati) ---
const results = [];
const POOL = 3;
let i = 0;
async function worker() {
  while (i < list.length) {
    const item = list[i++];
    const res = await analyze(item);
    if (res) {
      results.push(res);
      console.log(`  ✓ ${res.name}: ${res.level}${res.vehicles != null ? " · " + res.vehicles + " voz." : ""} · ${res.waitMin || "?"} min${res.readable ? "" : " (slabo vidno)"}`);
    }
  }
}

if (!KEY) {
  console.warn("OPOZORILO: ANTHROPIC_API_KEY ni nastavljen — preskocim AI oceno (obdrzim obstojece).");
} else {
  await Promise.all(Array.from({ length: POOL }, worker));
  results.sort((a, b) => a.name.localeCompare(b.name));
}

const ts =
  "// SAMODEJNO ZAJETO: AI ocena gnece na mejnih prehodih (Claude Haiku 4.5 vision, analiza zivih slik kamer).\n" +
  "// OPOMBA: ocena je PRIBLIZEK iz ene slike — ni uradni podatek.\n" +
  "export interface AiCongestion { key: string; name: string; lat: number; lng: number; image: string; level: string; vehicles: number | null; waitMin: string; note: string; readable: boolean; ts: string }\n" +
  "export const AI_CONGESTION: AiCongestion[] = " + JSON.stringify(results, null, 1) + ";\n";

// prag: ce dobimo vsaj 3 ocene (ali datoteke se ni), zapisemo; sicer obdrzimo obstojece
safeWriteTs(resolve(ROOT, "lib/ai-congestion.ts"), ts, results.length, 3, "lib/ai-congestion.ts (AI gneca)");
console.log(`Ocenjenih prehodov: ${results.length}/${list.length}`);
