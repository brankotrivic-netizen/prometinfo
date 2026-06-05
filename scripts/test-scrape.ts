// Hiter test scraperjev brez zagona Next.js: `npm run scrape`
import { scrapeAll } from "../lib/scrapers";

async function main() {
  const results = await scrapeAll();
  for (const r of results) {
    console.log(`\n=== ${r.source} (${r.country}) ok=${r.ok} ${r.error ?? ""} ===`);
    console.log(`prehodov: ${r.reports.length}`);
    for (const rep of r.reports.slice(0, 50)) {
      const min = rep.waitMinutes == null ? "?" : `${rep.waitMinutes}min`;
      console.log(`  [${rep.level.padEnd(8)}] ${rep.crossing.padEnd(24)} ${min.padStart(6)}  | ${rep.rawStatus.slice(0, 70)}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
