// DEMO (brez stroska): pokaze, da parser izlusci cakanje iz realnih FB objav.
// Besedila so resnicne objave strani GP Maljevac (vir: javni FB rezultati).
import { parseWaitText, levelFromMinutes } from "../lib/parse";

const SAMPLE_POSTS = [
  "Granični prijelaz Maljevac Čekanje oko 1 sat",
  "Granični prijelaz Maljevac najmanje 2 sata čekanja",
  "Na Graničnom prijelazu Maljevac trenutno se čeka oko 60 minuta na ulaz u Republiku Hrvatsku",
  "Na GP Maljevac trenutno nema gužvi! Granični prijelaz je prazan",
  "GP Maljevac trenutno se čeka cca 60 minuta na izlaz",
  "Gužva na Gradiški, kolona oko 3 sata za teretna vozila",
  "Horgoš ulaz u Srbiju čeka se 45 min",
];

console.log("FB objava -> izluscen podatek (parser):\n");
for (const text of SAMPLE_POSTS) {
  const p = parseWaitText(text);
  const min = p.minutes == null ? "?" : `${p.minutes} min`;
  console.log(`[${p.level.padEnd(8)}] ${min.padStart(7)}  <-  "${text}"`);
}
console.log("\nOpomba: v skupinah (sumno besedilo) isto naredi Claude API za robustnejsi izvlecek prehoda+smeri+cakanja.");
