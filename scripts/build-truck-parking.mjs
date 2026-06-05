// Zajame tovorna parkirišča / počivališča (OSM Overpass) -> lib/truck-parking.ts
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const q = `[out:json][timeout:90];
(
  node["highway"="services"](42,13.3,46.9,23.2);
  way["highway"="services"](42,13.3,46.9,23.2);
  node["amenity"="parking"]["hgv"="yes"](42,13.3,46.9,23.2);
  way["amenity"="parking"]["hgv"="yes"](42,13.3,46.9,23.2);
  node["amenity"="truck_stop"](42,13.3,46.9,23.2);
);
out center 300;`;

const r = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "PrometInfo/0.1 (branko.trivic@gmail.com)" },
  body: "data=" + encodeURIComponent(q),
});
if (!r.ok) { console.error("Overpass HTTP", r.status); process.exit(1); }
const j = await r.json();

const items = [];
const seen = new Set();
for (const e of j.elements) {
  const lat = e.lat ?? e.center?.lat;
  const lng = e.lon ?? e.center?.lon;
  if (lat == null || lng == null) continue;
  const tg = e.tags || {};
  const type = tg.highway === "services" ? "Počivališče" : tg.amenity === "truck_stop" ? "Tovorni stop" : "Tovorno parkirišče";
  const name = (tg.name || tg["name:en"] || type).trim();
  const key = lat.toFixed(3) + "," + lng.toFixed(3);
  if (seen.has(key)) continue;
  seen.add(key);
  items.push({ name, type, lat: +lat.toFixed(5), lng: +lng.toFixed(5) });
}

const ts =
  "// SAMODEJNO ZAJETO: tovorna parkirišča / počivališča (OpenStreetMap / Overpass).\n" +
  "export interface TruckPark { name: string; type: string; lat: number; lng: number }\n" +
  "export const TRUCK_PARKING: TruckPark[] = " + JSON.stringify(items, null, 1) + ";\n";
writeFileSync(resolve(ROOT, "lib/truck-parking.ts"), ts, "utf8");
console.log(`ZAPISANO lib/truck-parking.ts | parkirišč: ${items.length}`);
items.slice(0, 10).forEach((x) => console.log("  - " + x.name + " (" + x.type + ")"));
