// Razisci JS-renderirano stran s Playwright: izpise slike/video/iframe/kamere.
// Zagon: node scripts/headless-explore.mjs <URL>
import { chromium } from "playwright";

const url = process.argv[2];
if (!url) { console.error("Podaj URL"); process.exit(1); }

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  viewport: { width: 1366, height: 900 },
});
const page = await ctx.newPage();

// zberi tudi omrezne zahtevke (slike/tokovi)
const netMedia = new Set();
page.on("response", (r) => {
  const u = r.url();
  if (/\.(jpg|jpeg|png|m3u8|ts|mp4)(\?|$)/i.test(u) && !/sprite|icon|logo|favicon|\.css/i.test(u)) netMedia.add(u.split("?")[0]);
});

try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
} catch (e) { console.log("goto opozorilo:", e.message); }
await page.waitForTimeout(4000);

const dom = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll("img")].map((i) => ({ src: i.currentSrc || i.src, alt: i.alt || i.title || "" })).filter((i) => i.src && !i.src.startsWith("data:"));
  const vids = [...document.querySelectorAll("video,source")].map((v) => v.src || v.getAttribute("src")).filter(Boolean);
  const ifr = [...document.querySelectorAll("iframe")].map((f) => f.src).filter(Boolean);
  const canvases = document.querySelectorAll("canvas").length;
  return { imgs, vids, ifr, canvases };
});

console.log("=== NETWORK media (" + netMedia.size + ") ===");
[...netMedia].slice(0, 40).forEach((u) => console.log("  " + u));
console.log("\n=== <img> (" + dom.imgs.length + ") ===");
dom.imgs.slice(0, 40).forEach((i) => console.log("  " + i.src.slice(0, 100) + "  :: " + i.alt.slice(0, 40)));
console.log("\n=== <video/source> ===", dom.vids.slice(0, 20));
console.log("=== <iframe> ===", dom.ifr.slice(0, 10));
console.log("=== canvas:", dom.canvases);

await browser.close();
