// promet.si / NAP.si (DARS) — slovenski prometni dogodki in dela na cesti.
// Vir: DATEX II SituationPublication (b2b.nap.si). Basic Auth (NAP_USER/NAP_PASS).
// Teče strežniško v CI (cron) — brez CORS. Zapiše lib/promet-si.ts.
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync, existsSync } from "node:fs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "lib/promet-si.ts");
const USER = process.env.NAP_USER, PASS = process.env.NAP_PASS;

const dec = (s) => String(s || "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, " ").trim();

function emptyTs(note) {
  return `// SAMODEJNO ZAJETO: promet.si / NAP (DARS) — slovenski prometni dogodki/dela. ${note || ""}\n` +
    "export interface PrometSiEvent { id: string; type: string; desc: string; loc: string; lat: number | null; lng: number | null; start: string; end: string; ts: string }\n" +
    "export const PROMET_SI_UPDATED = \"\";\n" +
    "export const PROMET_SI: PrometSiEvent[] = [];\n";
}

if (!USER || !PASS) {
  console.warn("OPOZORILO: NAP_USER/NAP_PASS nista nastavljena — preskocim promet.si (obdrzim obstojece).");
  if (!existsSync(OUT)) writeFileSync(OUT, emptyTs("(brez poverilnic)"), "utf8");
  process.exit(0);
}

let xml = "";
try {
  const auth = "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64");
  const r = await fetch("https://b2b.nap.si/data/b2b.roadworks", { headers: { Authorization: auth }, signal: AbortSignal.timeout(25000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  xml = await r.text();
} catch (e) {
  console.warn("OPOZORILO: NAP ni dosegljiv (" + e.message + "). Obdrzim obstojece.");
  if (!existsSync(OUT)) writeFileSync(OUT, emptyTs("(vir nedosegljiv)"), "utf8");
  process.exit(0);
}

const now = Date.now();
const events = [];
const sits = xml.match(/<situation\b[\s\S]*?<\/situation>/g) || [];
for (const sit of sits) {
  // komentarji po vrsti (description / locationDescriptor / other)
  const cm = {};
  let m;
  const re = /<generalPublicComment>([\s\S]*?)<\/generalPublicComment>/g;
  while ((m = re.exec(sit))) {
    const blk = m[1];
    const v = /<value lang="sl">([\s\S]*?)<\/value>/.exec(blk);
    const t = /<commentType>([\s\S]*?)<\/commentType>/.exec(blk);
    if (v && t) cm[dec(t[1])] = dec(v[1]);
  }
  const desc = cm.description || cm.other || "";
  if (!desc) continue;
  const loc = cm.locationDescriptor || "";
  const type = (/situationRecord[^>]*xsi:type="([^"]+)"/.exec(sit) || [])[1] || "Event";
  const lat = parseFloat((/<latitude>([\d.\-]+)<\/latitude>/.exec(sit) || [])[1]);
  const lng = parseFloat((/<longitude>([\d.\-]+)<\/longitude>/.exec(sit) || [])[1]);
  const start = (/<overallStartTime>([^<]+)<\/overallStartTime>/.exec(sit) || [])[1] || "";
  const end = (/<overallEndTime>([^<]+)<\/overallEndTime>/.exec(sit) || [])[1] || "";
  const ver = (/<situationRecordVersionTime>([^<]+)<\/situationRecordVersionTime>/.exec(sit) || [])[1] || "";
  // samo trenutno veljavni (brez konca ali konec v prihodnosti)
  if (end && Date.parse(end) < now) continue;
  const id = (/<situation id="([^"]+)"/.exec(sit) || [])[1] || String(events.length);
  events.push({
    id, type, desc, loc,
    lat: Number.isFinite(lat) ? +lat.toFixed(5) : null,
    lng: Number.isFinite(lng) ? +lng.toFixed(5) : null,
    start, end, ts: ver,
  });
}

// najnovejsi prvi
events.sort((a, b) => (Date.parse(b.ts) || 0) - (Date.parse(a.ts) || 0));

const ts =
  "// SAMODEJNO ZAJETO: promet.si / NAP (DARS) — slovenski prometni dogodki/dela (DATEX II).\n" +
  "// Prikazani le trenutno veljavni. Vir: b2b.nap.si (DARS). desc = uradni slovenski opis.\n" +
  "export interface PrometSiEvent { id: string; type: string; desc: string; loc: string; lat: number | null; lng: number | null; start: string; end: string; ts: string }\n" +
  `export const PROMET_SI_UPDATED = ${JSON.stringify(new Date().toISOString())};\n` +
  "export const PROMET_SI: PrometSiEvent[] = " + JSON.stringify(events, null, 1) + ";\n";

// uspesno prebrano -> zapisi (tudi ce je malo dogodkov)
writeFileSync(OUT, events.length || !existsSync(OUT) ? ts : ts, "utf8");
console.log(`ZAPISANO lib/promet-si.ts | veljavnih dogodkov: ${events.length} / situacij: ${sits.length}`);
events.slice(0, 6).forEach((e) => console.log(`  [${e.type}] ${e.desc.slice(0, 90)}`));
