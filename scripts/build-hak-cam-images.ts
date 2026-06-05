// Za vsako HAK kamero (mejne + cestne) zajame ID(je) slike (cam.asp?id=N),
// da jih lahko prikazemo kot SLIKO v aplikaciji (brez zunanje povezave).
// Zapise lib/hak-cam-images.ts: { [k]: ["https://m.hak.hr/cam.asp?id=N", ...] }
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { HAK_ROADS } from "../lib/hak-road-cameras";
import { HAK_CAMERAS } from "../lib/hak-cameras";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Zberi unikatne (g,k) — border kamere so g=2.
const pairs = new Map<number, number>(); // k -> g
for (const c of HAK_CAMERAS) if (!pairs.has(c.k)) pairs.set(c.k, 2);
for (const g of HAK_ROADS) for (const c of g.cams) if (!pairs.has(c.k)) pairs.set(c.k, g.g);

const out: Record<number, string[]> = {};
let done = 0, withImg = 0;
const entries = [...pairs.entries()];

(async () => {
  for (const [k, g] of entries) {
    try {
      const r = await fetch(`https://m.hak.hr/kamera.asp?g=${g}&k=${k}`, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept-Encoding": "identity" },
      });
      const h = await r.text();
      const ids = [...new Set([...h.matchAll(/cam\.asp\?id=(\d+)/gi)].map((m) => +m[1]))];
      if (ids.length) { out[k] = ids.map((id) => `https://m.hak.hr/cam.asp?id=${id}`); withImg++; }
    } catch { /* preskoci */ }
    done++;
    if (done % 30 === 0) console.log(`  ${done}/${entries.length}…`);
    await sleep(120);
  }
  const ts =
    "// SAMODEJNO ZAJETO: HAK slike kamer (cam.asp?id=). Javne JPEG slike (osvezujejo se).\n" +
    "export const HAK_CAM_IMAGES: Record<number, string[]> = " + JSON.stringify(out) + ";\n";
  writeFileSync(resolve(ROOT, "lib/hak-cam-images.ts"), ts, "utf8");
  console.log(`ZAPISANO lib/hak-cam-images.ts | kamer: ${entries.length} | s sliko: ${withImg}`);
})();
