// Realne cene dizla iz AMZS (cene-goriv-po-evropi) -> lib/diesel-prices.ts
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const COUNTRIES = [
  { country: "SI", name: "Slovenija", flag: "🇸🇮", amzs: "Slovenija" },
  { country: "HR", name: "Hrvaška", flag: "🇭🇷", amzs: "Hrvaška" },
  { country: "BA", name: "Bosna in Hercegovina", flag: "🇧🇦", amzs: "BIH" },
  { country: "RS", name: "Srbija", flag: "🇷🇸", amzs: "Srbija" },
  { country: "ME", name: "Črna gora", flag: "🇲🇪", amzs: "Črna gora" },
  { country: "MK", name: "Severna Makedonija", flag: "🇲🇰", amzs: "Severna Makedonija" },
];
const num = (s) => parseFloat(String(s).replace(/\s/g, "").replace(",", "."));

const r = await fetch("https://www.amzs.si/na-poti/cene-goriv-po-evropi", { headers: { "User-Agent": UA } });
const html = await r.text();
const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
  .map((m) => [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => c[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()))
  .filter((r) => r.length >= 4);

let updated = "";
const out = [];
for (const c of COUNTRIES) {
  const row = rows.find((r) => r[0] === c.amzs);
  if (!row) { console.log(c.name, "NI VRSTICE"); continue; }
  const cell = row[3]; // Diesel
  const date = row[4] || "";
  const paren = cell.match(/\(([\d.,]+)\s*EUR\)/i); // npr. 3,180 BAM (1,63 EUR)
  let eur, local;
  if (paren) { eur = num(paren[1]); local = cell.split("(")[0].trim(); }
  else { const m = cell.match(/([\d.,]+)\s*EUR/i); eur = m ? num(m[1]) : null; local = ""; }
  if (eur == null) { console.log(c.name, "NI CENE:", cell); continue; }
  if (date && !updated) updated = date;
  out.push({ country: c.country, name: c.name, flag: c.flag, eur: +eur.toFixed(3), local, date });
  console.log(`${c.name}: ${eur.toFixed(3)} €/L ${local ? "(" + local + ")" : ""} · ${date}`);
}

const ts =
  "// REALNE cene dizla (vir: AMZS - amzs.si/na-poti/cene-goriv-po-evropi). V EUR.\n" +
  "export interface DieselPrice { country: string; name: string; flag: string; eur: number; local: string; date: string }\n" +
  "export const DIESEL_UPDATED = " + JSON.stringify(updated || new Date().toISOString().slice(0, 10)) + ";\n" +
  "export const DIESEL_PRICES: DieselPrice[] = " + JSON.stringify(out, null, 1) + ";\n";
writeFileSync(resolve(ROOT, "lib/diesel-prices.ts"), ts, "utf8");
console.log(`\nZAPISANO lib/diesel-prices.ts | držav: ${out.length} | vir: AMZS | datum: ${updated}`);
