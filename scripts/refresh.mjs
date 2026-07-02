// Odporna osvežitev: požene vse zajemalce podatkov, posamezna napaka NE ustavi
// celote, na koncu VEDNO zgradi stran (npm run dist).
import { spawnSync } from "node:child_process";

const isWin = process.platform === "win32";
const run = (cmd, args) => spawnSync(cmd, args, { stdio: "inherit", shell: isWin });

const steps = [
  ["promet.si / NAP dogodki (SI)", "node", ["scripts/build-promet-si.mjs"]],
  ["AMZS cene goriv", "node", ["scripts/build-fuel.mjs"]],
  ["HAK poročila (HR)", "node", ["scripts/build-hak-reports.mjs"]],
  ["AMSS poročila (RS)", "node", ["scripts/build-amss-reports.mjs"]],
  ["AMSS čakanja na meji (RS)", "node", ["scripts/build-amss-waits.mjs"]],
  ["BIHAMK poročila (BiH)", "node", ["scripts/build-bihamk-reports.mjs"]],
  ["HAK/MUP čakalne dobe (HR)", "node", ["scripts/build-hak-waits.mjs"]],
  ["Črpalke OSM (1x/teden)", "node", ["scripts/build-fuel-stations.mjs"]],
];

let failed = 0;
for (const [name, cmd, args] of steps) {
  console.log(`\n=== ${name} ===`);
  const r = run(cmd, args);
  if (r.status !== 0) {
    failed++;
    console.warn(`OPOZORILO: "${name}" ni uspelo (status ${r.status}) — nadaljujem z naslednjim.`);
  }
}

console.log(`\n=== Gradnja strani (dist) ===`);
const d = run("npm", ["run", "dist"]);
if (d.status !== 0) {
  console.error("NAPAKA: gradnja strani ni uspela.");
  process.exit(d.status || 1);
}
console.log(`\nKONČANO. Zajemalcev z napako: ${failed}/${steps.length} (podatki teh virov ostanejo nespremenjeni).`);
process.exit(0);
