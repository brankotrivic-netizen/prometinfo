// Zajame BIHAMK stanje na cestah (BiH) -> lib/bihamk-reports.ts
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { safeWriteTs } from "./_safewrite.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const clean = (s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

const PAGES = [
  ["Autoceste", "autoceste"],
  ["Magistralne ceste", "magistralne-ceste"],
  ["Regionalne ceste", "regionalne-ceste"],
];

const groups = [];
for (const [label, slug] of PAGES) {
  try {
    const r = await fetch("https://bihamk.ba/spi/stanje-na-cesti-u-bih/" + slug, { headers: { "User-Agent": UA, "Accept-Language": "bs,hr,sr;q=0.8" } });
    const h = await r.text();
    const items = [];
    const re = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    let m;
    while ((m = re.exec(h))) {
      const blk = m[1];
      const title = clean((blk.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1] || "");
      let text = clean(blk).replace(title, "").trim();
      if (text.length > 400) text = text.slice(0, 400) + "…";
      if (title && text) items.push({ title, text });
    }
    if (items.length) groups.push({ label, items });
    console.log(`${label}: ${items.length}`);
  } catch (e) { console.log(slug, "err", e.message); }
}

const ts =
  "// SAMODEJNO ZAJETO: BIHAMK stanje na cestah (BiH, bihamk.ba/spi).\n" +
  "export interface BihReportGroup { label: string; items: { title: string; text: string }[] }\n" +
  "export const BIHAMK_REPORTS: BihReportGroup[] = " + JSON.stringify(groups, null, 1) + ";\n";
const bihTotal = groups.reduce((s, g) => s + g.items.length, 0);
safeWriteTs(resolve(ROOT, "lib/bihamk-reports.ts"), ts, bihTotal, 3, `lib/bihamk-reports.ts (skupin ${groups.length})`);
