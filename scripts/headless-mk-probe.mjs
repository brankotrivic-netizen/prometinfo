import { chromium } from "playwright";
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36" });
const feeds = new Set();
p.on("response", (r) => { const u = r.url(); if (/\.(m3u8|jpg|jpeg|mp4)(\?|$)/i.test(u) && /cam|kamer|stream|live|nadzor|elektra|jpdp|video/i.test(u)) feeds.add(u.split("?")[0]); });
await p.goto("https://roads.org.mk/patna-mreza/video-kameri/", { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
await p.waitForTimeout(3000);
const markers = await p.$$(".leaflet-marker-icon");
console.log("markerjev:", markers.length);
if (markers.length) {
  await markers[0].click().catch(() => {});
  await p.waitForTimeout(3500);
  const popup = await p.evaluate(() => {
    const el = document.querySelector(".leaflet-popup-content") || document.querySelector(".leaflet-popup");
    if (!el) return null;
    const imgs = [...el.querySelectorAll("img")].map((i) => i.src);
    const ifr = [...el.querySelectorAll("iframe")].map((i) => i.src);
    const vid = [...el.querySelectorAll("video,source")].map((v) => v.src);
    const links = [...el.querySelectorAll("a")].map((a) => a.href);
    return { html: el.innerHTML.slice(0, 500), imgs, ifr, vid, links, text: el.textContent.replace(/\s+/g, " ").trim().slice(0, 120) };
  });
  console.log("POPUP:", JSON.stringify(popup, null, 1));
  console.log("FEEDS (network):", [...feeds].slice(0, 10));
}
await b.close();
