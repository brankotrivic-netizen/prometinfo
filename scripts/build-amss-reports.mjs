// Zajame AMSS prometne dogodke (Srbija) iz mape -> lib/amss-reports.ts
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { safeWriteTs } from "./_safewrite.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clean = (s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&scaron;/gi, "š").replace(/&amp;/g, "&").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();

let html = "";
try {
  const r = await fetch("https://www.amss.org.rs/stanje-na-putu/strana/mapa", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Referer: "https://www.amss.org.rs/",
      "Accept-Language": "sr,en;q=0.8",
    },
  });
  html = await r.text();
} catch (e) {
  console.warn("AMSS fetch napaka:", e.message);
}

const items = [];
const seen = new Set();
// vsak marker: title + infowindow content (<h4>..</h4><p>..</p>)
const re = /content:\s*`([\s\S]*?)`/g;
let m;
while ((m = re.exec(html))) {
  const block = m[1];
  const title = clean((block.match(/<h4[^>]*>([\s\S]*?)<\/h4>/) || [])[1] || "");
  let text = clean(block.replace(/<h4[\s\S]*?<\/h4>/, ""));
  if (text.length > 500) text = text.slice(0, 500) + "…";
  if (!title || title.length < 3) continue;
  const key = title.slice(0, 40);
  if (seen.has(key)) continue;
  seen.add(key);
  items.push({ title, text: text || title });
}

const ts =
  "// SAMODEJNO ZAJETO: AMSS prometni dogodki/stanje (Srbija, amss.org.rs/stanje-na-putu).\n" +
  "export interface AmssReport { title: string; text: string }\n" +
  "export const AMSS_REPORTS: AmssReport[] = " + JSON.stringify(items.slice(0, 60), null, 1) + ";\n";
safeWriteTs(resolve(ROOT, "lib/amss-reports.ts"), ts, items.length, 5, "lib/amss-reports.ts");
items.slice(0, 8).forEach((x) => console.log("  - " + x.title.slice(0, 60) + " :: " + x.text.slice(0, 60)));
