// Zajame pisna prometna porocila HAK (stanje na cestah) -> lib/hak-reports.ts
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { safeWriteTs } from "./_safewrite.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clean = (s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

let html = "";
try {
  const r = await fetch("https://www.hak.hr/info/stanje-na-cestama/", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36" },
  });
  html = await r.text();
} catch (e) {
  console.warn("HAK fetch napaka:", e.message);
}

const titleRe = /<h3 style="background-image[^>]*>([\s\S]*?)<\/h3>/gi;
const titles = [];
let m;
while ((m = titleRe.exec(html))) titles.push({ title: clean(m[1]), pos: m.index });

const reports = [];
for (let i = 0; i < titles.length; i++) {
  const start = titles[i].pos;
  const end = i + 1 < titles.length ? titles[i + 1].pos : html.length;
  const seg = html.slice(start, end);
  const ts = (seg.match(/<h4 class="timestamp">[\s\S]*?<strong>([\s\S]*?)<\/strong>/) || [])[1] || "";
  const txtM = seg.match(/stanje-inner-text[^>]*>([\s\S]*?)(?:<\/div>\s*<\/div>\s*<\/div>|$)/);
  let text = txtM ? clean(txtM[1]) : "";
  if (text.length > 700) text = text.slice(0, 700) + "…";
  if (titles[i].title && text) reports.push({ title: titles[i].title, updated: clean(ts), text });
}

const ts2 =
  "// SAMODEJNO ZAJETO: pisna prometna porocila HAK (hak.hr/info/stanje-na-cestama).\n" +
  "export interface HakReport { title: string; updated: string; text: string }\n" +
  "export const HAK_REPORTS: HakReport[] = " + JSON.stringify(reports, null, 1) + ";\n";
safeWriteTs(resolve(ROOT, "lib/hak-reports.ts"), ts2, reports.length, 3, "lib/hak-reports.ts");
reports.forEach((x) => console.log("  - " + x.title + " (" + x.updated + "): " + x.text.slice(0, 70)));
