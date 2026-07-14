// Beleži čakalne dobe skozi čas -> lib/wait-history.ts (za napoved "običajno ob tem času").
// Ob vsakem cron zagonu doda posnetek trenutnih čakanj (HAK + AMSS + BIHAMK).
// Zapis je majhen: {i:id, p:osebna min, k:tovorna min, t:epoch ms}. Hrani 60 dni.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "lib/wait-history.ts");
const MAXAGE = 60 * 24 * 3600 * 1000; // 60 dni
const MAXN = 8000;

function loadArr(rel, name) {
  const p = resolve(ROOT, rel);
  if (!existsSync(p)) return [];
  try {
    const t = readFileSync(p, "utf8");
    const m = new RegExp(name + "\\s*=\\s*(\\[[\\s\\S]*\\]);\\s*$", "m").exec(t);
    return m ? JSON.parse(m[1]) : [];
  } catch (e) { console.warn("  bran " + rel + " ni uspel:", e.message); return []; }
}

const now = Date.now();
const snap = new Map(); // id -> {p, k}

// HAK: waitMinutes (osebna, najhujša smer) + truck
for (const w of loadArr("lib/hak-waits.ts", "HAK_WAITS")) {
  if (!w.id) continue;
  const p = w.waitMinutes != null ? w.waitMinutes : (w.ulazMin != null || w.izlazMin != null ? Math.max(w.ulazMin || 0, w.izlazMin || 0) : null);
  const k = (w.truckUlazMin != null || w.truckIzlazMin != null) ? Math.max(w.truckUlazMin || 0, w.truckIzlazMin || 0) : null;
  if (p != null || k != null) snap.set(w.id, { p, k });
}
// AMSS
for (const w of loadArr("lib/amss-waits.ts", "AMSS_WAITS")) {
  if (!w.id || snap.has(w.id)) continue;
  const p = (w.ulazMin != null || w.izlazMin != null) ? Math.max(w.ulazMin || 0, w.izlazMin || 0) : null;
  const k = (w.truckUlazMin != null || w.truckIzlazMin != null) ? Math.max(w.truckUlazMin || 0, w.truckIzlazMin || 0) : null;
  if (p != null || k != null) snap.set(w.id, { p, k });
}
// BIHAMK (če ima strukturo z minutami)
for (const w of loadArr("lib/bihamk-waits.ts", "BIHAMK_WAITS")) {
  if (!w.id || snap.has(w.id)) continue;
  const p = w.waitMinutes != null ? w.waitMinutes : null;
  if (p != null) snap.set(w.id, { p, k: null });
}

let hist = loadArr("lib/wait-history.ts", "WAIT_HISTORY");
// dodaj trenutni posnetek
for (const [id, v] of snap) hist.push({ i: id, p: v.p, k: v.k, t: now });
// obrezi po starosti in številu
hist = hist.filter((e) => now - e.t < MAXAGE);
if (hist.length > MAXN) hist = hist.slice(hist.length - MAXN);

const ts =
  "// SAMODEJNO ZAJETO: zgodovina čakalnih dob (za napoved 'običajno ob tem času').\n" +
  "// i=crossingId, p=osebna vozila (min), k=tovorna (min), t=epoch ms. Hrani 60 dni.\n" +
  "export interface WaitHist { i: string; p: number | null; k: number | null; t: number }\n" +
  "export const WAIT_HISTORY: WaitHist[] = " + JSON.stringify(hist) + ";\n";
writeFileSync(OUT, ts, "utf8");
console.log(`ZAPISANO lib/wait-history.ts | posnetek +${snap.size} prehodov | skupaj ${hist.length} meritev`);
