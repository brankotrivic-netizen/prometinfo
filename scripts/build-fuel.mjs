// Realne cene VSEH goriv (95/98/Diesel) iz AMZS -> lib/fuel-prices.ts
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { safeWriteTs } from "./_safewrite.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const FLAGS = {
  Albanija: "🇦🇱", Andora: "🇦🇩", Avstrija: "🇦🇹", Belgija: "🇧🇪", Belorusija: "🇧🇾", BIH: "🇧🇦",
  Bolgarija: "🇧🇬", "Češka": "🇨🇿", "Črna gora": "🇲🇪", Danska: "🇩🇰", Estonija: "🇪🇪", Finska: "🇫🇮",
  Francija: "🇫🇷", "Grčija": "🇬🇷", "Hrvaška": "🇭🇷", Irska: "🇮🇪", Islandija: "🇮🇸", Italija: "🇮🇹",
  Kosovo: "🇽🇰", Latvija: "🇱🇻", Liechtenstein: "🇱🇮", Litva: "🇱🇹", Luksemburg: "🇱🇺", "Madžarska": "🇭🇺",
  Moldavija: "🇲🇩", "Nemčija": "🇩🇪", Nizozemska: "🇳🇱", "Norveška": "🇳🇴", Poljska: "🇵🇱", Portugalska: "🇵🇹",
  Romunija: "🇷🇴", Rusija: "🇷🇺", "Severna Makedonija": "🇲🇰", "Slovaška": "🇸🇰", Slovenija: "🇸🇮",
  "Španija": "🇪🇸", Srbija: "🇷🇸", "Švedska": "🇸🇪", "Švica": "🇨🇭", "Turčija": "🇹🇷", Ukrajina: "🇺🇦", "V. Britanija": "🇬🇧",
};

let html = "";
try {
  const r = await fetch("https://www.amzs.si/na-poti/cene-goriv-po-evropi", { headers: { "User-Agent": UA } });
  html = await r.text();
} catch (e) {
  console.warn("AMZS fetch napaka:", e.message);
}
const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
  .map((m) => [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => c[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()))
  .filter((r) => r.length >= 5 && /\d+\.\s*\d+\.\s*\d{4}/.test(r[4]));

let updated = "";
const out = rows.map((r) => {
  if (!updated && r[4]) updated = r[4];
  return { country: r[0], flag: FLAGS[r[0]] || "🏳️", p95: r[1] || "", p98: r[2] || "", diesel: r[3] || "", date: r[4] || "" };
});

const ts =
  "// REALNE cene goriv (95/98/Diesel) — vir: AMZS (amzs.si/na-poti/cene-goriv-po-evropi).\n" +
  "export interface FuelRow { country: string; flag: string; p95: string; p98: string; diesel: string; date: string }\n" +
  "export const FUEL_UPDATED = " + JSON.stringify(updated || "") + ";\n" +
  "export const FUEL_PRICES: FuelRow[] = " + JSON.stringify(out, null, 1) + ";\n";
safeWriteTs(resolve(ROOT, "lib/fuel-prices.ts"), ts, out.length, 15, `lib/fuel-prices.ts (vir AMZS, datum ${updated})`);
