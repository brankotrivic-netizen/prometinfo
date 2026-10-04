// Prometni koledar: napoved gnece na mejnih prehodih za 120 dni naprej -> lib/traffic-calendar.ts
// Viri (brezplacni, brez kljuca):
//   - drzavni prazniki: date.nager.at (SI, HR, BA, RS, ME, AT, DE, CH, IT)
//   - solske pocitnice: openholidaysapi.org (DE, AT, CH, IT, SI, HR, RS)
// Logika: diaspora (DE/AT/CH/IT/SI) potuje JUG na zacetku pocitnic/podaljsanih vikendov,
// SEVER ob koncu; prazniki v BiH/RS/HR/MNE (Bozic, Velika noc, Bajram ...) -> JUG pred, SEVER po.
// Kjer letosnje solsko leto se ni objavljeno, se lansko obdobje zamakne za 364 dni (isti dan
// v tednu) in oznaci kot "ocena".
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { safeWriteTs } from "./_safewrite.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "lib/traffic-calendar.ts");
const DAYS = 120;
const DAY = 86400000;

// enkrat na dan je dovolj (okno se premakne za en dan). Starost beremo iz vsebine,
// ker git checkout v CI nastavi mtime na cas checkouta.
try {
  const m = /TRAFFIC_CAL_UPDATED = "([^"]+)"/.exec(readFileSync(OUT, "utf8"));
  if (m && m[1].slice(0, 10) === new Date().toISOString().slice(0, 10) && !process.argv.includes("--force")) {
    console.log("Koledar je ze izracunan danes — preskocim."); process.exit(0);
  }
} catch { /* datoteke ni -> izracunaj */ }

const ORIGIN = { DE: 1.5, AT: 1.2, CH: 1.2, IT: 0.7, SI: 1 };   // od koder potuje diaspora / mi
const DEST = ["BA", "RS", "HR", "ME"];                            // kamor se potuje
const CNAME = { DE: "Nemčija", AT: "Avstrija", CH: "Švica", IT: "Italija", SI: "Slovenija", HR: "Hrvaška", BA: "BiH", RS: "Srbija", ME: "Črna gora" };

const iso = (t) => new Date(t).toISOString().slice(0, 10);
const today0 = Date.parse(iso(Date.now()));
const toT = (s) => Date.parse(s.slice(0, 10));

async function getJSON(url) {
  const r = await fetch(url, { headers: { accept: "application/json", "User-Agent": "PrometInfo/1.0 (osebna app)" }, signal: AbortSignal.timeout(25000) });
  if (!r.ok) throw new Error("HTTP " + r.status + " " + url);
  return r.json();
}

// ---------- 1) drzavni prazniki ----------
const years = [...new Set([0, DAYS].map((o) => new Date(today0 + o * DAY).getUTCFullYear()))];
const holidays = []; // {t, cc, name, global}
let failed = 0;
for (const cc of [...Object.keys(ORIGIN), ...DEST]) {
  for (const y of years) {
    try {
      const a = await getJSON(`https://date.nager.at/api/v3/PublicHolidays/${y}/${cc}`);
      for (const h of a) holidays.push({ t: toT(h.date), cc, name: (DEST.includes(cc) || cc === "SI") ? h.localName : h.name, en: h.name, global: h.global !== false });
    } catch (e) { failed++; console.warn("  praznik", cc, y, e.message); }
  }
}

// ---------- 2) solske pocitnice ----------
const SCHOOL_CC = ["DE", "AT", "CH", "IT", "SI", "HR", "RS"];
const school = []; // {s, e, cc, kind, subs[], projected}
function kindOf(n) {
  n = (n || "").toLowerCase();
  if (/summer|sommer|estiv/.test(n)) return "poletne";
  if (/christmas|weihnacht|natal|new year|winter break/.test(n)) return "božične";
  if (/easter|oster|pasqu|spring/.test(n)) return "velikonočne";
  if (/autumn|herbst|fall|autunn/.test(n)) return "jesenske";
  if (/whit|pfingst/.test(n)) return "binkoštne";
  if (/winter|semester|ski|sport|carneval|fasching/.test(n)) return "zimske";
  return "šolske";
}
const from = iso(today0 - 400 * DAY), to = iso(today0 + (DAYS + 30) * DAY);
for (const cc of SCHOOL_CC) {
  try {
    const a = await getJSON(`https://openholidaysapi.org/SchoolHolidays?countryIsoCode=${cc}&languageIsoCode=EN&validFrom=${from}&validTo=${to}`);
    const rows = a.map((p) => ({
      s: toT(p.startDate), e: toT(p.endDate), cc,
      kind: kindOf(((p.name || [])[0] || {}).text),
      subs: p.nationwide ? [] : (p.subdivisions || []).map((x) => x.shortName || x.code).filter(Boolean),
      projected: false,
    }));
    // manjkajoce leto: lansko obdobje +364 dni (isti dan v tednu), ce v tistem oknu ni pravega podatka
    const projected = [];
    for (const r of rows) {
      if (r.s >= today0) continue;
      const ps = r.s + 364 * DAY, pe = r.e + 364 * DAY;
      if (pe < today0 || ps > today0 + (DAYS + 30) * DAY) continue;
      const exists = rows.some((x) => x.kind === r.kind && Math.abs(x.s - ps) < 45 * DAY && x.subs.join() === r.subs.join());
      if (!exists) projected.push({ ...r, s: ps, e: pe, projected: true });
    }
    school.push(...rows, ...projected);
  } catch (e) { failed++; console.warn("  pocitnice", cc, e.message); }
}

// ---------- 3) tockovanje po dnevih ----------
const days = [];
for (let i = 0; i < DAYS; i++) days.push({ t: today0 + i * DAY, s: 0, n: 0, rs: new Set(), rn: new Set() });
const at = (t) => { const i = Math.round((t - today0) / DAY); return i >= 0 && i < DAYS ? days[i] : null; };
const add = (t, dir, pts, why) => { const d = at(t); if (!d) return; d[dir] += pts; (dir === "s" ? d.rs : d.rn).add(why); };

// a) dnevi v tednu: petek/sobota jug, nedelja sever
for (const d of days) {
  const wd = new Date(d.t).getUTCDay();
  if (wd === 5) add(d.t, "s", 0.6, "petek");
  if (wd === 6) add(d.t, "s", 0.5, "sobota");
  if (wd === 0) add(d.t, "n", 0.8, "nedelja (povratki)");
}

// b) solske pocitnice: zacetek -> jug, konec -> sever (zdruzeno po drzavi+vrsti+dnevu)
const groups = new Map();
for (const p of school) {
  if (p.e - p.s < 2 * DAY) continue; // 1-2 dnevni prosti dnevi ne premaknejo diaspore
  const w0 = ORIGIN[p.cc] || 0.4; // HR/RS: manjsa teza (domace pocitnice)
  const big = p.kind === "poletne" ? 2 : p.kind === "božične" ? 1.5 : 1;
  const share = p.subs.length === 0 ? 1 : Math.min(1, 0.35 + p.subs.length * 0.12);
  for (const [t, dir] of [[p.s, "s"], [p.s - DAY, "s"], [p.e, "n"], [p.e - DAY, "n"]]) {
    const key = `${p.cc}|${p.kind}|${dir}|${t}`;
    const g = groups.get(key) || { t, dir, cc: p.cc, kind: p.kind, subs: new Set(), w: 0, projected: true };
    g.w = Math.max(g.w, w0 * big * share);
    p.subs.forEach((x) => g.subs.add(x));
    g.projected = g.projected && p.projected;
    groups.set(key, g);
  }
}
for (const g of groups.values()) {
  const subs = [...g.subs].slice(0, 4).join(", ") + (g.subs.size > 4 ? " …" : "");
  const label = `${g.dir === "s" ? "začetek" : "konec"} ${g.kind} počitnic: ${CNAME[g.cc]}${subs ? " (" + subs + ")" : ""}${g.projected ? " — ocena po lanskem letu" : ""}`;
  add(g.t, g.dir, g.w, label);
}

// c) prazniki v izvornih drzavah -> podaljsani vikendi
for (const h of holidays) {
  if (!(h.cc in ORIGIN)) continue;
  const w = ORIGIN[h.cc] * (h.global ? 1 : 0.4);
  const wd = new Date(h.t).getUTCDay();
  if (wd === 0 || wd === 6) continue; // praznik na vikend: ni podaljsanja
  const lbl = `praznik ${CNAME[h.cc]}: ${h.name}`;
  if (wd === 1) { add(h.t - 3 * DAY, "s", w, lbl); add(h.t, "n", w, lbl); }            // pon -> pet jug, pon sever
  else if (wd === 5) { add(h.t - DAY, "s", w, lbl); add(h.t + 2 * DAY, "n", w, lbl); } // pet -> cet jug, ned sever
  else if (wd === 4) { add(h.t - DAY, "s", w, lbl + " (most)"); add(h.t + 3 * DAY, "n", w, lbl + " (most)"); }
  else if (wd === 2) { add(h.t - 4 * DAY, "s", w * 0.7, lbl + " (most)"); add(h.t, "n", w * 0.7, lbl + " (most)"); }
  else { add(h.t - DAY, "s", w * 0.6, lbl); add(h.t, "n", w * 0.6, lbl); }
}

// d) veliki prazniki v ciljnih drzavah: obiski doma (jug pred, sever po)
// Bajrami niso v Nager.Date za BiH -> rocno (islamski koledar, datum +-1 dan)
const BAJRAM = [
  ["2026-03-20", "Ramazanski bajram"], ["2026-05-27", "Kurban bajram"],
  ["2027-03-10", "Ramazanski bajram"], ["2027-05-16", "Kurban bajram"],
  ["2028-02-27", "Ramazanski bajram"], ["2028-05-05", "Kurban bajram"],
];
for (const [d, n] of BAJRAM) holidays.push({ t: toT(d), cc: "BA", name: n + " (±1 dan)", en: "eid", global: true });

const MAJOR = /christmas|easter|eid|bajram|new year|assumption|all saints|uskrs|božić|vaskrs|velika gospa/i;
const seenDest = new Map(); // vecdnevni prazniki (Nova godina 1.+2.) stejejo enkrat
for (const h of holidays.sort((a, b) => a.t - b.t)) {
  if (!DEST.includes(h.cc) || !MAJOR.test(h.en + " " + h.name)) continue;
  const key = h.cc + "|" + h.name.replace(/\s*\(.*$/, "");
  if (seenDest.has(key) && h.t - seenDest.get(key) <= 3 * DAY) continue;
  seenDest.set(key, h.t);
  const lbl = `${h.name} (${CNAME[h.cc]}) — obiski doma`;
  add(h.t - 2 * DAY, "s", 1, lbl); add(h.t - DAY, "s", 1.2, lbl);
  add(h.t + DAY, "n", 1, lbl); add(h.t + 2 * DAY, "n", 0.8, lbl);
}

// ---------- 4) stopnje ----------
const lvl = (x) => (x >= 3.5 ? 3 : x >= 2 ? 2 : x >= 1 ? 1 : 0);
const out = days.map((d) => ({
  d: iso(d.t),
  s: lvl(d.s), n: lvl(d.n),
  rs: [...d.rs].filter((x) => !(d.rs.size > 1 && /^(petek|sobota)$/.test(x))).slice(0, 5),
  rn: [...d.rn].filter((x) => !(d.rn.size > 1 && /^nedelja/.test(x))).slice(0, 5),
}));
const hot = out.filter((x) => x.s >= 2 || x.n >= 2).length;

const ts =
  "// SAMODEJNO ZAJETO: prometni koledar (napoved gnece na mejah) za " + DAYS + " dni.\n" +
  "// s = smer JUG (tja, proti Balkanu), n = SEVER (nazaj). Stopnje 0 normalno, 1 povecano, 2 gneca, 3 velika gneca.\n" +
  "// Viri: date.nager.at (prazniki), openholidaysapi.org (solske pocitnice).\n" +
  "export interface CalDay { d: string; s: number; n: number; rs: string[]; rn: string[] }\n" +
  "export const TRAFFIC_CAL_UPDATED = " + JSON.stringify(new Date().toISOString()) + ";\n" +
  "export const TRAFFIC_CAL: CalDay[] = " + JSON.stringify(out) + ";\n";

safeWriteTs(OUT, ts, holidays.length + school.length, 50, "lib/traffic-calendar.ts (prometni koledar)");
console.log(`Prazniki: ${holidays.length} · pocitnice: ${school.length} (ocen: ${school.filter((x) => x.projected).length}) · dni z gneco: ${hot}/${DAYS} · napak virov: ${failed}`);
if (failed) process.exitCode = 0; // delni podatki so OK; varovalo safeWriteTs scuva pred praznim zapisom
