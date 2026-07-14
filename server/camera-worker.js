// PrometInfo — Cloudflare Worker za AI analizo kamer (neobvezno).
// Reši dve stvari, ki jih GitHub Pages (statična stran) ne zmore:
//   1) captureCameraScreenshot(url) — poslika stran/iframe/video kamere (Browser Rendering)
//   2) AI vizija — sliko pošlje modelu Claude in vrne STRUKTURIRAN rezultat
//
// POŠTENOST: če slike ni mogoče pridobiti, vrne napako — NE izmišlja rezultata.
//
// Namestitev (kratko):
//   1. npm i -g wrangler && wrangler login
//   2. wrangler secret put ANTHROPIC_API_KEY        (vpiši svoj ključ)
//   3. wrangler deploy   (glej wrangler.toml spodaj v komentarju)
//   4. Naslov workerja (…workers.dev/analyze) prilepi v PrometInfo → Nastavitve → AI endpoint.
//
// wrangler.toml (primer):
//   name = "prometinfo-cam"
//   main = "server/camera-worker.js"
//   compatibility_date = "2024-09-01"
//   browser = { binding = "BROWSER" }          # Browser Rendering (za screenshot strani)
//   [vars]
//   ALLOW_ORIGIN = "https://brankotrivic-netizen.github.io"

const MODEL = "claude-haiku-4-5-20251001"; // poceni/hitro; za več detajla: claude-opus-4-8

function cors(env) {
  return {
    "Access-Control-Allow-Origin": (env && env.ALLOW_ORIGIN) || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
const json = (obj, status, env) =>
  new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json", ...cors(env) } });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(env) });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, env);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, env); }
    const { image, url, cameraName, borderId, direction, route } = body || {};

    // 1) Zagotovi sliko (base64):
    //    a) če jo klient že pošlje, jo uporabi;
    //    b) DIREKTNA slika (jpg/png…) -> Worker jo sam prenese (obide CORS) — deluje na BREZPLAČNEM planu;
    //    c) stran/iframe/video -> Browser Rendering (potreben plačljiv plan, neobvezno).
    let dataUrl = image || null;
    try {
      if (!dataUrl && url) {
        if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url)) dataUrl = await fetchImageAsDataUrl(url);
        else dataUrl = await captureCameraScreenshot(url, env);
      }
    } catch (e) {
      return json({ error: "fetch_failed", errorReason: String(e && e.message || e), cameraVisible: false }, 200, env);
    }
    if (!dataUrl) return json({ error: "no_image", errorReason: "Slike ni bilo mogoče pridobiti.", cameraVisible: false }, 200, env);

    // 2) AI vizija — struktura rezultata je fiksna (glej prompt).
    if (!env.ANTHROPIC_API_KEY) return json({ error: "no_api_key", errorReason: "ANTHROPIC_API_KEY ni nastavljen." }, 200, env);
    try {
      const ai = await analyze(dataUrl, { cameraName, borderId, direction, route }, env);
      return json(ai, 200, env);
    } catch (e) {
      return json({ error: "ai_failed", errorReason: String(e && e.message || e), cameraVisible: true, confidence: 0 }, 200, env);
    }
  },
};

// DIREKTNA slika: Worker jo prenese sam (brez CORS omejitev brskalnika) -> base64.
// Deluje na BREZPLAČNEM Cloudflare planu.
async function fetchImageAsDataUrl(url) {
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (PrometInfo camera fetch)", Referer: new URL(url).origin + "/" },
    signal: AbortSignal.timeout(12000),
  });
  if (!r.ok) throw new Error("slika HTTP " + r.status);
  const ct = (r.headers.get("content-type") || "image/jpeg").split(";")[0];
  if (!/^image\//.test(ct)) throw new Error("odgovor ni slika (" + ct + ")");
  const buf = new Uint8Array(await r.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return "data:" + ct + ";base64," + btoa(bin);
}

// Poslika kamero (stran/iframe/video) prek Cloudflare Browser Rendering (plačljiv plan).
async function captureCameraScreenshot(url, env) {
  if (!env.BROWSER) throw new Error("Browser Rendering (BROWSER binding) ni na voljo.");
  const puppeteer = await import("@cloudflare/puppeteer");
  const browser = await puppeteer.default.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 3000)); // počakaj, da se video/slika naloži
    const buf = await page.screenshot({ type: "jpeg", quality: 70 });
    return "data:image/jpeg;base64," + btoa(String.fromCharCode(...new Uint8Array(buf)));
  } finally { await browser.close(); }
}

// Pošlje sliko Claude in vrne strukturiran JSON.
async function analyze(dataUrl, ctx, env) {
  const m = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl);
  if (!m) throw new Error("neveljaven data URL");
  const [, mediaType, b64] = m;

  const prompt =
    `Analiziraj sliko prometne kamere na mejnem prehodu.\n` +
    `Kamera: ${ctx.cameraName || "?"} · Prehod: ${ctx.borderId || "?"} · Smer: ${ctx.direction || "?"} · Pot: ${ctx.route || "?"}.\n` +
    `Vprašanje: ali so vidni zastoji, osebna vozila ali kamioni? Ali kamera sploh kaže cesto/promet in ali gleda v pravo smer?\n` +
    `Če slika ni jasna ali ne kaže prometa, to pošteno povej (cameraVisible=false ali uncertain). NE ugibaj.\n` +
    `Vrni IZKLJUČNO ta JSON (brez ovoja):\n` +
    `{"cameraVisible":true|false,"relevantForRoute":true|false|"uncertain","directionMatch":true|false|"uncertain",` +
    `"passengerQueue":"clear"|"slow"|"queue"|"uncertain","truckQueue":"clear"|"slow"|"queue"|"uncertain",` +
    `"visibleVehicles":{"passengerCars":"none"|"few"|"many"|"uncertain","trucks":"none"|"few"|"many"|"uncertain"},` +
    `"confidence":0-100,"reason":"kratko slovensko pojasnilo","recommendationImpact":"increase"|"decrease"|"none"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 400,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
        { type: "text", text: prompt },
      ] }],
    }),
  });
  if (!res.ok) throw new Error("Anthropic HTTP " + res.status);
  const j = await res.json();
  const txt = (j.content || []).map((c) => c.text || "").join("");
  const jm = txt.match(/\{[\s\S]*\}/);
  if (!jm) throw new Error("AI ni vrnil JSON");
  return JSON.parse(jm[0]);
}
