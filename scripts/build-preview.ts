// Samostojen HTML osnutek (brez streznika): zdruzi zive BiH podatke (BIHAMK)
// z registrom vseh prehodov + gumbi za uradno kamero. Zagon: npm run preview
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { scrapeAll } from "../lib/scrapers";
import { allCrossings } from "../lib/crossings";
import { standaloneHakCameras, hakLink } from "../lib/hak-cameras";
import { amssStreamsForCrossing, type StreamLink } from "../lib/amss-cameras";
import { HAK_ROADS, hakRoadLink } from "../lib/hak-road-cameras";
import { HAK_CAMERAS, hakLink } from "../lib/hak-cameras";
import { HAK_CAM_IMAGES } from "../lib/hak-cam-images";
import { HAK_WAITS } from "../lib/hak-waits";
import { ROUTE_PRESETS } from "../lib/routes";
import { DIESEL_PRICES, DIESEL_UPDATED } from "../lib/diesel-prices";
import { SOCIAL_KEYWORDS, SOCIAL_PAGES, SOCIAL_QUERIES } from "../lib/social";
import { FUEL_STATIONS } from "../lib/fuel-stations";
import { PROMET_SI, PROMET_SI_UPDATED } from "../lib/promet-si";
import { AMSS_WAITS } from "../lib/amss-waits";
import { RS_ROAD_CAMS } from "../lib/rs-road-cameras";
import { SI_CAMS } from "../lib/si-road-cameras";
import { BIHAMK_CAMS } from "../lib/bihamk-cameras";
import { AMSRS_CAMS } from "../lib/amsrs-cameras";
import { AMSM_CAMS } from "../lib/amsm-cameras";
import { COUNTRY_BORDERS } from "../lib/country-borders";
import { HAK_REPORTS } from "../lib/hak-reports";
import { AMSS_REPORTS } from "../lib/amss-reports";
import { BIHAMK_REPORTS } from "../lib/bihamk-reports";
import { TRUCK_PARKING } from "../lib/truck-parking";
import { FUEL_PRICES, FUEL_UPDATED } from "../lib/fuel-prices";
import { levelFromMinutes } from "../lib/parse";
import { COUNTRY_NAMES, type Country, type WaitLevel, type CameraLink } from "../lib/types";

const FLAG: Record<Country, string> = {
  HR: "🇭🇷", RS: "🇷🇸", ME: "🇲🇪", SI: "🇸🇮", MK: "🇲🇰", BA: "🇧🇦", XK: "🇽🇰",
  HU: "🇭🇺", AT: "🇦🇹", IT: "🇮🇹", AL: "🇦🇱", BG: "🇧🇬", RO: "🇷🇴", GR: "🇬🇷",
};
const LEVEL_LABEL: Record<WaitLevel, string> = { none: "Brez", low: "Kratko", moderate: "Zmerno", high: "Daljše", severe: "Dolgo", unknown: "Ni podatka" };
const NAME_FIX: Record<string, string> = { "rs-presevo": "Preševo", "rs-horgos": "Horgoš", "me-bozaj": "Božaj", "si-gruskovje": "Gruškovje", "ba-velika-kladusa": "Velika Kladuša" };

function nameFromId(id: string): string {
  if (NAME_FIX[id]) return NAME_FIX[id];
  return id.replace(/^[a-z]{2}-/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function waitText(min: number | null): string {
  if (min == null) return "ni podatka";
  if (min <= 0) return "brez zadrževanja";
  if (min < 60) return `~${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `~${h} h ${m} min` : `~${h} h`;
}

interface Item {
  id: string; name: string; country: Country; neighbor: Country;
  lat: number | null; lng: number | null; cameras: CameraLink[]; streams: StreamLink[];
  level: WaitLevel; waitMinutes: number | null; rawStatus: string; hasLive: boolean;
}

async function main() {
  const sources = await scrapeAll();
  const live = sources.filter((s) => s.ok).flatMap((s) => s.reports);
  const liveById = new Map(live.map((r) => [r.id, r]));

  // Zdruzi: zivi zapisi + registrski prehodi brez zivih podatkov.
  const items: Item[] = [];
  for (const r of live) {
    items.push({
      id: r.id, name: r.crossing, country: r.country, neighbor: (r.neighbor ?? r.country) as Country,
      lat: r.lat, lng: r.lng, cameras: r.cameras, streams: amssStreamsForCrossing(r.id),
      level: r.level, waitMinutes: r.waitMinutes, rawStatus: r.rawStatus, hasLive: true,
    });
  }
  for (const c of allCrossings()) {
    if (liveById.has(c.id)) continue;
    items.push({
      id: c.id, name: nameFromId(c.id), country: c.country, neighbor: c.neighbor,
      lat: c.lat, lng: c.lng, cameras: c.cameras, streams: amssStreamsForCrossing(c.id),
      level: "unknown", waitMinutes: null, rawStatus: "Čakanje: ni podatka — preveri kamero / uradni vir.", hasLive: false,
    });
  }
  // Samostojne HAK kamere (brez ujemajocega prehoda) kot lastne tocke.
  for (const c of standaloneHakCameras()) {
    items.push({
      id: `hakcam-${c.k}`, name: c.name, country: "HR", neighbor: c.neighbor,
      lat: c.lat, lng: c.lng, cameras: [{ source: c.name, url: hakLink(c.k) }], streams: [],
      level: "unknown", waitMinutes: null, rawStatus: "Kamera HAK (živa slika na uradni strani).", hasLive: false,
    });
  }

  // Žive čakalne dobe HAK/MUP (RH stran) — prepiši/dopolni prehod, kjer je objavljeno.
  const hakWaitById = new Map(HAK_WAITS.filter((w) => w.id).map((w) => [w.id, w]));
  for (const it of items) {
    const w = hakWaitById.get(it.id);
    if (!w) continue;
    it.level = w.level as WaitLevel;
    it.waitMinutes = w.waitMinutes;
    const parts: string[] = [];
    if (w.ulazMin != null) parts.push(`vstop v HR ${w.ulazTxt}`);
    if (w.izlazMin != null) parts.push(`izstop iz HR ${w.izlazTxt}`);
    const ageMin = w.tsISO ? Math.round((Date.now() - Date.parse(w.tsISO)) / 60000) : null;
    const stale = ageMin != null && ageMin > 120 ? " · ⚠ star podatek" : "";
    it.rawStatus = `🇭🇷 HAK/MUP: ${parts.join(", ")}${w.ts ? ` · ${w.ts}` : ""}${stale}`;
    // shrani za smer + zanesljivost (kasnejše faze)
    (it as unknown as { hak: unknown }).hak = {
      ulazMin: w.ulazMin, izlazMin: w.izlazMin, ulazTxt: w.ulazTxt, izlazTxt: w.izlazTxt,
      truckUlazMin: (w as { truckUlazMin?: number | null }).truckUlazMin ?? null,
      truckIzlazMin: (w as { truckIzlazMin?: number | null }).truckIzlazMin ?? null,
      truckUlazTxt: (w as { truckUlazTxt?: string }).truckUlazTxt ?? "-",
      truckIzlazTxt: (w as { truckIzlazTxt?: string }).truckIzlazTxt ?? "-",
      tsISO: w.tsISO,
    };
  }

  // AMSS (Srbija) — DODATEN uradni vir; čakanje uporabi le, če ni HAK/BIHAMK.
  const amssById = new Map(AMSS_WAITS.filter((w) => w.id).map((w) => [w.id, w]));
  const levelFromMin = (m: number | null): WaitLevel => m == null ? "unknown" : m <= 0 ? "none" : m <= 30 ? "low" : m <= 60 ? "moderate" : m <= 120 ? "high" : "severe";
  for (const it of items) {
    const w = amssById.get(it.id);
    if (!w) continue;
    (it as unknown as { amss: unknown }).amss = {
      ulazMin: w.ulazMin, izlazMin: w.izlazMin, ulazTxt: w.ulazTxt, izlazTxt: w.izlazTxt,
      truckUlazMin: (w as { truckUlazMin?: number | null }).truckUlazMin ?? null,
      truckIzlazMin: (w as { truckIzlazMin?: number | null }).truckIzlazMin ?? null,
      truckUlazTxt: (w as { truckUlazTxt?: string }).truckUlazTxt ?? "-",
      truckIzlazTxt: (w as { truckIzlazTxt?: string }).truckIzlazTxt ?? "-",
      ts: w.ts,
    };
    if (!it.hasLive && !(it as unknown as { hak?: unknown }).hak) {
      const worst = Math.max(w.ulazMin ?? -1, w.izlazMin ?? -1);
      if (worst >= 0) { it.waitMinutes = worst; it.level = levelFromMin(worst); }
      const p: string[] = [];
      if (w.ulazMin != null) p.push(`vstop v Srbijo ${w.ulazTxt}`);
      if (w.izlazMin != null) p.push(`izstop iz Srbije ${w.izlazTxt}`);
      it.rawStatus = `🇷🇸 AMSS: ${p.join(", ")}`;
    }
  }

  // Novi most Gradiška: HR stran se imenuje Gornji Varoš — pokaži oboje v poti/karticah.
  for (const it of items) if (it.id === "ba-gradiska") it.name = "Gornji Varoš–Gradiška (novi most)";

  const counts: Record<WaitLevel, number> = { none: 0, low: 0, moderate: 0, high: 0, severe: 0, unknown: 0 };
  for (const it of items) counts[it.level]++;

  const points = items.filter((it) => it.lat != null && it.lng != null);

  // Direktne žive slike (AMS-RS + BIHAMK) pripni prehodu po ujemajočih koordinatah,
  // da se ob kliku na prehod slika pokaže kar v oblačku (brez odpiranja spletne strani).
  const directCams = [
    ...AMSRS_CAMS.map((c) => ({ name: c.name, image: c.image, lat: c.lat, lng: c.lng })),
    ...BIHAMK_CAMS.filter((c) => c.lat != null && c.lng != null).map((c) => ({ name: c.name, image: c.image, lat: c.lat as number, lng: c.lng as number })),
  ];
  for (const p of points) {
    const coordImgs = directCams
      .filter((d) => Math.abs(d.lat - (p.lat as number)) < 0.03 && Math.abs(d.lng - (p.lng as number)) < 0.03)
      .map((d) => ({ name: d.name, url: d.image }));
    // HR stran (HAK): iz povezave kamere izlušči k=<id> -> direktne slike HAK_CAM_IMAGES.
    // 1. krog: po ena slika VSAKE kamere (da je vsaka zastopana); 2. krog: dodatne slike.
    const first: { name: string; url: string }[] = [...coordImgs];
    const rest: { name: string; url: string }[] = [];
    for (const cam of p.cameras || []) {
      const mk = /[?&]k=(\d+)/.exec(cam.url || "");
      if (!mk) continue;
      const imgs = HAK_CAM_IMAGES[Number(mk[1])];
      if (!imgs || !imgs.length) continue;
      first.push({ name: cam.source, url: imgs[0] });
      imgs.slice(1, 2).forEach((u) => rest.push({ name: cam.source + " · kam 2", url: u }));
    }
    const merged: { name: string; url: string }[] = [];
    const seen = new Set<string>();
    for (const im of [...first, ...rest]) {
      if (seen.has(im.url)) continue;
      seen.add(im.url);
      merged.push(im);
    }
    (p as unknown as { images: { name: string; url: string }[] }).images = merged.slice(0, 10);
  }

  // Podatki o zivih tokovih (za vgrajeni HLS predvajalnik).
  const streamsData = Object.fromEntries(
    items.filter((i) => i.streams.length).map((i) => [i.id, { title: `${i.name} — AMSS v živo`, streams: i.streams }])
  );

  // Grupiraj po mejnem paru (urejen par drzav).
  const groups = new Map<string, { a: Country; b: Country; list: Item[] }>();
  for (const it of items) {
    const [a, b] = [it.country, it.neighbor].sort() as [Country, Country];
    const key = `${a}-${b}`;
    if (!groups.has(key)) groups.set(key, { a, b, list: [] });
    groups.get(key)!.list.push(it);
  }
  const groupArr = [...groups.values()].sort((x, y) => y.list.length - x.list.length);

  const esc = (s: string) => String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;");
  // Žive sličice kamer prehoda (za priljubljene kamere kar v zavihku Mejni prehodi).
  const cardCams = (imgs?: { name: string; url: string }[]) =>
    imgs && imgs.length
      ? `<div class="camgrid cardcams">${imgs.map((im) => `<a class="camshot" href="${im.url}" target="_blank" rel="noopener noreferrer" title="${esc(im.name)}"><img class="snap" data-base="${im.url}" src="${im.url}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(im.name)}"><span>${esc(im.name)}</span></a>`).join("")}</div>`
      : "";

  const camBtn = (cams: CameraLink[], streams: StreamLink[], id: string) => {
    const live = streams.length ? `<button class="cam live" onclick="openStream('${id}')">▶ AMSS v živo</button>` : "";
    const links = cams.map((c) => `<a class="cam" href="${c.url}" target="_blank" rel="noopener noreferrer">📷 ${c.source} ↗</a>`).join("");
    return live || links ? `<div class="cams">${live}${links}</div>` : "";
  };

  const sections = groupArr.map((g) => `
    <section class="country-group" data-countries="${g.a} ${g.b}">
      <h2>${FLAG[g.a]} ${COUNTRY_NAMES[g.a]} ↔ ${FLAG[g.b]} ${COUNTRY_NAMES[g.b]} <span class="cnt">${g.list.length}</span></h2>
      <div class="grid">
        ${[...g.list].sort((a, b) => (b.waitMinutes ?? -1) - (a.waitMinutes ?? -1)).map((it) => `
          <article class="card lvl-${it.level}">
            <div class="name">${it.name}<button class="cfav" data-cid="${it.id}" title="Dodaj med priljubljene prehode">☆</button></div>
            <div class="wait"><span class="badge b-${it.level}">${LEVEL_LABEL[it.level]}</span>${it.level === "unknown" || it.waitMinutes == null ? "" : `<span>Čakanje: ${waitText(it.waitMinutes)}</span>`}</div>
            <div class="raw">${it.rawStatus}</div>
            ${cardCams((it as unknown as { images?: { name: string; url: string }[] }).images)}
            ${camBtn(it.cameras, it.streams, it.id)}
          </article>`).join("")}
      </div>
    </section>`).join("");

  // Prometne kamere po cestah (HAK avtoceste) — zlozljivo po avtocesti.
  const roadTotal = HAK_ROADS.reduce((s, g) => s + g.cams.length, 0);

  // HAK mejni prehodi (granicni prijelazi) — vedno odprta mreza slicic
  const hakBorderCams = HAK_CAMERAS.filter((c) => HAK_CAM_IMAGES[c.k] && HAK_CAM_IMAGES[c.k].length);
  const hakBorderHtml = `
    <section class="country-group" data-countries="HR">
      <h2>🇭🇷 HAK — mejni prehodi <span class="cnt">${hakBorderCams.reduce((s, c) => s + HAK_CAM_IMAGES[c.k].length, 0)}</span> <span class="src">· vir: HAK (žive slike)</span></h2>
      <div class="camgrid">
        ${hakBorderCams.map((c) => { const arr = HAK_CAM_IMAGES[c.k]; const link = hakLink(c.k); const fl = FLAG[c.neighbor] || ""; return arr.map((img, i) => { const label = arr.length > 1 ? `${c.name} · kam ${i + 1}` : c.name; return `<a class="camshot" href="${link}" target="_blank" rel="noopener noreferrer" title="${esc(label)}"><img class="snap" data-base="${img}" src="${img}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(label)}"><span>${esc(label)} ${fl}</span></a>`; }).join(""); }).join("")}
      </div>
    </section>`;

  const roadsHtml = `
    <section class="country-group" data-countries="HR">
      <h2>🇭🇷 Prometne kamere po cestah <span class="cnt">${roadTotal}</span> <span class="src">· vir: HAK (žive slike)</span></h2>
      ${HAK_ROADS.map((gr) => `
        <details class="roadgroup">
          <summary>${esc(gr.name)} <span class="cnt">${gr.cams.length}</span></summary>
          <div class="camgrid">
            ${gr.cams.map((c) => { const img = HAK_CAM_IMAGES[c.k] && HAK_CAM_IMAGES[c.k][0]; const link = hakRoadLink(gr.g, c.k); return img
              ? `<a class="camshot" href="${link}" target="_blank" rel="noopener noreferrer" title="${esc(c.name)}"><img class="snap" data-base="${img}" src="${img}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(c.name)}"><span>${esc(c.name)}</span></a>`
              : `<a class="camshot nolink" href="${link}" target="_blank" rel="noopener noreferrer"><span>📷 ${esc(c.name)} ↗</span></a>`; }).join("")}
          </div>
        </details>`).join("")}
    </section>`;

  // Cestne kamere s koordinatami -> tocke na zemljevidu.
  const roadPoints = HAK_ROADS.flatMap((g) =>
    g.cams.filter((c) => c.lat != null && c.lng != null).map((c) => ({
      name: c.name, road: g.name, lat: c.lat as number, lng: c.lng as number,
      url: hakRoadLink(g.g, c.k), image: (HAK_CAM_IMAGES[c.k] && HAK_CAM_IMAGES[c.k][0]) || null,
    }))
  );

  const rsRoadPoints = RS_ROAD_CAMS.filter((c) => c.lat != null && c.lng != null);
  const rsRoadHtml = `
    <section class="country-group" data-countries="RS">
      <h2>🇷🇸 Cestne kamere <span class="cnt">${RS_ROAD_CAMS.length}</span> <span class="src">· vir: Putevi Srbije (žive slike)</span></h2>
      <div class="camgrid">
        ${RS_ROAD_CAMS.map((c) => `<a class="camshot" href="${c.poster}" target="_blank" rel="noopener noreferrer" title="${c.name}"><img class="snap" data-base="${c.poster}" src="${c.poster}" loading="lazy" referrerpolicy="no-referrer" alt="${c.name}"><span>${c.name}</span></a>`).join("")}
      </div>
    </section>`;

  // Slovenske kamere (NAP/DARS) — po regijah, zive slike.
  const siTotalCams = SI_CAMS.reduce((s, g) => s + g.cams.length, 0);
  const siByRegion: Record<string, typeof SI_CAMS> = {};
  for (const g of SI_CAMS) (siByRegion[g.region] ??= []).push(g);
  const siCamHtml = `
    <section class="country-group" data-countries="SI">
      <h2>🇸🇮 Cestne kamere <span class="cnt">${siTotalCams}</span> <span class="src">· vir: NAP/DARS (žive slike)</span></h2>
      ${Object.entries(siByRegion).map(([region, gs]) => `
        <details class="roadgroup">
          <summary>${esc(region)} <span class="cnt">${gs.reduce((s, g) => s + g.cams.length, 0)}</span></summary>
          <div class="camgrid">
            ${gs.flatMap((g) => g.cams).map((c) => `<a class="camshot" href="${c.image}" target="_blank" rel="noopener noreferrer" title="${esc(c.name)}"><img class="snap" data-base="${c.image}" src="${c.image}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(c.name)}"><span>${esc(c.name)}</span></a>`).join("")}
          </div>
        </details>`).join("")}
    </section>`;
  const siPoints = SI_CAMS.map((g) => ({ title: g.title, lat: g.lat, lng: g.lng, image: g.cams[0].image }));

  // AMSM kamere (S. Makedonija) — povezave (slike/koord ni)
  const amsmCamHtml = `
    <section class="country-group" data-countries="MK">
      <h2>🇲🇰 Kamere <span class="cnt">${AMSM_CAMS.length}</span> <span class="src">· vir: AMSM / roads.org.mk</span></h2>
      <div class="camgrid">
        ${AMSM_CAMS.map((c) => `<a class="camshot nolink" href="${c.url}" target="_blank" rel="noopener noreferrer"><span>📷 ${esc(c.name)} ↗</span></a>`).join("")}
      </div>
    </section>`;

  // BIHAMK kamere (BiH) — zive slike
  const bihCamPoints = BIHAMK_CAMS.filter((c) => c.lat != null && c.lng != null);
  const bihCamHtml = `
    <section class="country-group" data-countries="BA">
      <h2>🇧🇦 Kamere <span class="cnt">${BIHAMK_CAMS.length}</span> <span class="src">· vir: BIHAMK (žive slike)</span></h2>
      <div class="camgrid">
        ${BIHAMK_CAMS.map((c) => `<a class="camshot" href="${c.image}" target="_blank" rel="noopener noreferrer" title="${esc(c.name)}"><img class="snap" data-base="${c.image}" src="${c.image}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(c.name)}"><span>${esc(c.name)}</span></a>`).join("")}
      </div>
    </section>`;

  // AMS-RS kamere mejnih prehodov (Republika Srpska / BiH) — zive slike
  const amsrsCamPoints = AMSRS_CAMS.filter((c) => c.lat != null && c.lng != null);
  const amsrsCamHtml = `
    <section class="country-group" data-countries="BA">
      <h2>🇧🇦 Kamere mejnih prehodov <span class="cnt">${AMSRS_CAMS.length}</span> <span class="src">· vir: AMS-RS (žive slike)</span></h2>
      <div class="camgrid">
        ${AMSRS_CAMS.map((c) => `<a class="camshot" href="${c.image}" target="_blank" rel="noopener noreferrer" title="${esc(c.name)}"><img class="snap" data-base="${c.image}" src="${c.image}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(c.name)}"><span>${esc(c.name)}</span></a>`).join("")}
      </div>
    </section>`;

  // Pisna prometna porocila (HAK + AMSS + BIHAMK)
  const reportCard = (title: string, text: string, time?: string) =>
    `<article class="report"><div class="report-head"><b>${esc(title)}</b>${time ? `<span class="report-time">${esc(time)}</span>` : ""}</div><div class="report-text">${esc(text)}</div></article>`;
  const bihTotal = BIHAMK_REPORTS.reduce((s, g) => s + g.items.length, 0);
  const siType: Record<string, string> = { MaintenanceWorks: "🚧 Dela na cesti", RoadOrCarriagewayOrLaneManagement: "🚦 Ureditev prometa", Accident: "💥 Nesreča", AbnormalTraffic: "🐌 Zastoj", PoorEnvironmentConditions: "🌧️ Vreme", GeneralObstruction: "⚠️ Ovira" };
  const siTime = (s: string) => { try { return new Date(s).toLocaleString("sl-SI", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };
  const reportsHtml = `
    <section class="country-group">
      <h2>📰 Prometna poročila <span class="src">· uradni viri</span></h2>
      <details open class="roadgroup"><summary>🇸🇮 Slovenija — promet.si / DARS <span class="cnt">${PROMET_SI.length}</span></summary>
        <p class="meta">Vir: promet.si / NAP (DARS) · osveženo ${PROMET_SI_UPDATED ? siTime(PROMET_SI_UPDATED) : "—"} · <a href="https://www.promet.si/sl/promet" target="_blank" rel="noopener noreferrer">odpri promet.si ↗</a></p>
        <div class="reports">${PROMET_SI.slice(0, 150).map((e) => reportCard(siType[e.type] || "ℹ️ Dogodek", e.desc, siTime(e.start))).join("") || '<p class="meta">Trenutno ni objavljenih dogodkov ali vir ni dosegljiv.</p>'}</div>
      </details>
      <details class="roadgroup"><summary>🇭🇷 Hrvaška — HAK <span class="cnt">${HAK_REPORTS.length}</span></summary>
        <div class="reports">${HAK_REPORTS.map((r) => reportCard(r.title, r.text, r.updated)).join("")}</div>
      </details>
      <details class="roadgroup"><summary>🇷🇸 Srbija — AMSS <span class="cnt">${AMSS_REPORTS.length}</span></summary>
        <div class="reports">${AMSS_REPORTS.map((r) => reportCard(r.title, r.text)).join("")}</div>
      </details>
      <details class="roadgroup"><summary>🇧🇦 Bosna in Hercegovina — BIHAMK <span class="cnt">${bihTotal}</span></summary>
        ${BIHAMK_REPORTS.map((g) => `<h3 class="neighbor-title">${esc(g.label)} <span class="cnt">${g.items.length}</span></h3><div class="reports">${g.items.map((it) => reportCard(it.title, it.text)).join("")}</div>`).join("")}
      </details>
    </section>`;

  // 🚛 Tovornjaki: dizel + omejitve + parkirisca
  const truckKw = /teretn|tovorn|kamion|\btona\b|\btone\b|tonn|ograni[čc]enj|zabran|nosivost|te[žz]ih/i;
  const truckReports = [
    ...HAK_REPORTS.filter((r) => truckKw.test(r.title + " " + r.text)).map((r) => ({ src: "HAK 🇭🇷", title: r.title, text: r.text, updated: r.updated })),
    ...AMSS_REPORTS.filter((r) => truckKw.test(r.title + " " + r.text)).map((r) => ({ src: "AMSS 🇷🇸", title: r.title, text: r.text, updated: "" })),
  ];
  const exYu = ["Slovenija", "Hrvaška", "BIH", "Srbija", "Črna gora", "Severna Makedonija", "Kosovo"];
  const fuelSorted = [...FUEL_PRICES].sort((a, b) => {
    const ia = exYu.indexOf(a.country), ib = exYu.indexOf(b.country);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1; if (ib >= 0) return 1;
    return a.country.localeCompare(b.country, "sl");
  });
  const fuelHtml = `
    <section class="country-group">
      <h2>⛽ Cene goriv po Evropi <span class="src">· vir: AMZS · ${esc(FUEL_UPDATED)}</span></h2>
      <div class="fuelwrap">
        <table class="fueltable">
          <thead><tr><th>Država</th><th>95</th><th>98</th><th>Diesel</th><th>Sprememba</th></tr></thead>
          <tbody>
            ${fuelSorted.map((f) => `<tr class="${exYu.indexOf(f.country) >= 0 ? "fx" : ""}"><td class="fc">${f.flag} ${esc(f.country)}</td><td>${esc(f.p95) || "–"}</td><td>${esc(f.p98) || "–"}</td><td>${esc(f.diesel) || "–"}</td><td class="fd">${esc(f.date)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="meta" style="margin-top:8px">Realne cene (nacionalna valuta + EUR) · vir: <a href="https://www.amzs.si/na-poti/cene-goriv-po-evropi" target="_blank" rel="noopener noreferrer">AMZS</a> · osveženo ${esc(FUEL_UPDATED)}. 🇪🇺 ex-YU države na vrhu.</p>
    </section>`;
  const truckHtml = `
    <section class="country-group">
      <h2>🚛 Za kamionarje</h2>
      <h3 class="neighbor-title">🚧 Omejitve / zabrane za tovornjake <span class="cnt">${truckReports.length}</span></h3>
      <div class="reports">
        ${truckReports.map((r) => `<article class="report"><div class="report-head"><b>${esc(r.title)}</b><span class="report-time">${r.src}${r.updated ? " · " + esc(r.updated) : ""}</span></div><div class="report-text">${esc(r.text)}</div></article>`).join("") || '<p class="meta">Trenutno ni posebnih omejitev v virih.</p>'}
      </div>
      <h3 class="neighbor-title" style="margin-top:22px">🅿️ Tovorna parkirišča / počivališča <span class="cnt">${TRUCK_PARKING.length}</span></h3>
      <p class="meta">Prikažeš jih na zavihku 🗺️ Zemljevid — odkljukaj „🅿️ parkirišča" (vidna ob približanju). Cene goriva so v zavihku ⛽ Gorivo.</p>
    </section>`;

  const chipCountries = ["BA", "HR", "RS", "ME", "MK", "SI"] as Country[];
  const camCount: Record<string, number> = { HR: roadTotal, RS: RS_ROAD_CAMS.length, SI: siTotalCams, BA: BIHAMK_CAMS.length + AMSRS_CAMS.length, MK: AMSM_CAMS.length };
  const totalCams = roadTotal + RS_ROAD_CAMS.length + siTotalCams + BIHAMK_CAMS.length + AMSRS_CAMS.length + AMSM_CAMS.length;
  const chips =
    `<button class="chip active" onclick="filterCountry('all',this)">🗺️ Vse <em>${items.length + totalCams}</em></button>` +
    chipCountries.map((c) => {
      const n = items.filter((i) => i.country === c || i.neighbor === c).length + (camCount[c] || 0);
      return `<button class="chip" onclick="filterCountry('${c}',this)">${FLAG[c]} ${COUNTRY_NAMES[c]} <em>${n}</em></button>`;
    }).join("");
  // Velike ploscice drzav (mobilno-prijazen izbirnik)
  const tile = (c: Country, flag: string, name: string) => {
    const cr = items.filter((i) => i.country === c || i.neighbor === c).length;
    const cam = camCount[c] || 0;
    return `<button class="ctile" onclick="filterCountry('${c}',this)"><span class="cflag">${flag}</span><span class="cname">${name}</span><span class="cstat">🚧 ${cr} · 📷 ${cam}</span></button>`;
  };
  const tiles =
    `<button class="ctile active" onclick="filterCountry('all',this)"><span class="cflag">🗺️</span><span class="cname">Cela regija</span><span class="cstat">bivša Jugoslavija</span></button>` +
    chipCountries.map((c) => tile(c, FLAG[c], COUNTRY_NAMES[c])).join("");

  const html = `<!doctype html><html lang="sl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PrometInfo — osnutek</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%9A%A6%3C/text%3E%3C/svg%3E"/>
<style>
:root{--bg:#eef2f7;--panel:#ffffff;--panel-2:#f1f5f9;--border:#dbe2ea;--text:#16202b;--muted:#5f6c7b;--none:#16a37a;--low:#3fa34d;--moderate:#d99a00;--high:#e07a1f;--severe:#dc2f3a;--unknown:#94a3b8;--accent:#2563eb}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:ui-sans-serif,system-ui,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:980px;margin:0 auto;padding:24px 16px 64px}
.top{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:12px}
h1{font-size:22px;margin:0;letter-spacing:-.02em}h1 span{color:var(--accent)}
.subtitle{color:var(--muted);font-size:13px;margin:2px 0 18px}.meta{color:var(--muted);font-size:12px}
.stats{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 16px}
.stat{flex:1 1 90px;background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:10px 12px}
.stat b{display:block;font-size:22px;line-height:1.1}.stat span{font-size:11px;color:var(--muted)}
.stat.ok b{color:var(--low)}.stat.warn b{color:var(--high)}.stat.bad b{color:var(--severe)}.stat.muted b{color:var(--unknown)}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.chip{display:inline-flex;align-items:center;gap:6px;font-size:13px;padding:7px 12px;border-radius:999px;border:1px solid var(--border);background:var(--panel);color:var(--text);cursor:pointer;font-family:inherit}
.chip:hover{border-color:var(--accent)}
.chip.active{border-color:var(--accent);background:var(--accent);color:#fff}
.chip em{font-style:normal;font-size:11px;background:var(--panel-2);padding:1px 7px;border-radius:999px;color:var(--muted)}
.chip.active em{background:rgba(255,255,255,.25);color:#fff;font-weight:700}
#map{height:640px;border-radius:14px;border:1px solid var(--border);margin-bottom:4px;background:var(--panel-2)}
.locbtn a{font-size:16px;width:30px;height:30px;line-height:30px;text-align:center;display:block;background:#fff;text-decoration:none}
.youpin{font-size:22px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}
.fuelpin{font-size:13px;width:22px;height:22px;line-height:20px;text-align:center;background:#fff;border:1.5px solid #16a34a;border-radius:50%;box-shadow:0 1px 3px rgba(16,32,43,.4)}
.routebar{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:0 0 8px;background:var(--panel);border:1px solid var(--border);border-radius:11px;padding:8px 10px}
.routebar input{flex:1 1 150px;min-width:120px;padding:9px 11px;border:1px solid var(--border);border-radius:8px;font:inherit;background:var(--bg);color:var(--text)}
.routebar button{padding:9px 13px;border:none;border-radius:8px;background:var(--accent);color:#fff;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap}
.routebar #routeClear{background:var(--panel-2);color:var(--text);border:1px solid var(--border)}
.rarrow{color:var(--muted);font-weight:700}
.routeinfo{font-size:13px;flex-basis:100%;color:var(--text)}
.quickroutes{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:6px}
.qroute{padding:9px 12px;border:1px solid var(--border);border-radius:999px;background:var(--panel);color:var(--text);font:inherit;font-size:13px;font-weight:600;cursor:pointer}
.qroute:hover{border-color:var(--accent);background:var(--panel-2)}
#routeResult h2{margin:2px 0 10px}
.rcard{background:var(--panel);border:1px solid var(--border);border-radius:11px;padding:11px 13px;margin-bottom:9px}
.rhead{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:15px}
.rrole{font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.4px}
.rscore{color:#fff;font-weight:800;font-size:13px;border-radius:8px;padding:3px 9px;white-space:nowrap}
.rdir{margin:8px 0 4px}
.dirrow{font-size:13px;line-height:1.7}
.rdir-hl{background:#eff6ff;border-radius:6px;padding:2px 6px;margin:2px 0;font-weight:600}
.vehrow{font-size:14px;margin:3px 0;font-weight:600}
.ttag{font-size:10px;background:#ffedd5;color:#9a3412;border-radius:999px;padding:2px 8px;font-weight:700;white-space:nowrap}
.ttrow{font-size:12px;margin:5px 0;line-height:1.6}
.camver{font-size:12.5px;margin:5px 0;background:var(--panel-2);border-radius:7px;padding:6px 9px}
.cchk{font-size:12px;margin:8px 0 6px;text-align:left;background:#eff6ff;border-radius:7px;padding:7px 9px;line-height:1.5}
.ccbtns,.dccbtns{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}
.ccb{flex:1 1 40%;border:none;border-radius:9px;color:#fff;font:inherit;font-weight:700;font-size:13px;padding:11px 8px;cursor:pointer}
.dveh{font-size:21px;font-weight:800;margin:4px 0}
.dpazi{font-size:14px;background:rgba(250,204,21,.15);color:#fde047;border-radius:9px;padding:9px 11px;margin:10px 0 4px;line-height:1.4}
.dccbtns .ccb{font-size:15px;padding:13px 8px}
.dactions{display:flex;gap:9px}
.dactions .dcam{flex:1;margin-top:0}
.tvojasmer{font-size:11px;color:#1d4ed8;font-weight:700}
.rmeta{font-size:12px;color:var(--muted);margin:4px 0}
.rconf{font-size:13px;font-weight:700;margin:6px 0 2px}
.rsrc{font-size:12px;color:var(--text);margin:3px 0;line-height:1.5}
.rsoc{font-size:12px;color:var(--text);margin:5px 0;line-height:1.7}
.rsoc a{color:var(--accent);font-weight:600}
.rnote{font-size:12.5px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:8px;padding:7px 9px;margin:6px 0}
.linklike{background:none;border:none;color:var(--accent);font:inherit;font-weight:600;cursor:pointer;padding:0;text-decoration:underline}
.ract{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
.ract .cam{padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--panel-2);color:var(--text);font:inherit;font-weight:600;font-size:13px;cursor:pointer}
.rfuel{margin-top:8px;padding:9px 11px;background:var(--panel-2);border-radius:9px;font-size:13px}
.rsub{margin:14px 0 8px;font-size:15px}
.drivebtn{display:block;width:100%;padding:15px;margin:0 0 12px;border:none;border-radius:12px;background:#16a34a;color:#fff;font-size:19px;font-weight:800;cursor:pointer;font-family:inherit}
#driveMode{display:none;position:fixed;inset:0;z-index:3000;background:#0b1220;color:#fff;flex-direction:column}
.drivehead{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;font-size:20px;font-weight:800;border-bottom:1px solid rgba(255,255,255,.12)}
.drivehead button{background:#1f2937;color:#fff;border:none;border-radius:10px;padding:10px 16px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit}
#driveBody{flex:1;overflow:auto;padding:18px;display:flex;flex-direction:column;gap:13px}
.droute{font-size:18px;color:#93c5fd;font-weight:700;text-align:center}
.dgo{background:#14532d;border-radius:16px;padding:22px 18px;text-align:center}
.dlabel{font-size:17px;font-weight:700;color:#86efac}
.dname{font-size:36px;font-weight:900;line-height:1.1;margin:6px 0}
.dwait{font-size:23px;font-weight:700}
.dfresh{font-size:15px;color:#cbd5e1;margin-top:4px}
.dcam{margin-top:14px;background:#2563eb;color:#fff;border:none;border-radius:12px;padding:14px 20px;font-size:18px;font-weight:800;cursor:pointer;width:100%;font-family:inherit}
.dalt{background:#3f3a14;border-radius:12px;padding:15px 16px;font-size:19px}
.davoid{background:#4c1d1d;border-radius:12px;padding:15px 16px;font-size:19px}
#mpBanner{margin-bottom:12px}
.mpalert{background:var(--panel);border:1px solid var(--border);border-radius:11px;padding:10px 13px;margin-bottom:8px;font-size:14px}
.rmine{font-size:12px;color:#0369a1;background:#e0f2fe;border-radius:7px;padding:5px 8px;margin:4px 0}
.manform{display:flex;flex-direction:column;gap:10px;padding:4px 2px}
.manform label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:600;color:var(--text)}
.manform select,.manform input,.manform textarea{padding:10px 11px;border:1px solid var(--border);border-radius:8px;font:inherit;background:var(--bg);color:var(--text);width:100%;box-sizing:border-box}
.manform textarea{resize:vertical}
#toast{display:none;position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:4000;background:#0b1220;color:#fff;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,.3);max-width:90%}
.alrow{display:flex;align-items:center;gap:8px;font-size:14px;padding:6px 0}
.alrow span{flex:1;font-weight:600}
.althr{width:74px;padding:7px 9px;border:1px solid var(--border);border-radius:7px;font:inherit;background:var(--bg);color:var(--text)}
.legend{display:flex;gap:14px;flex-wrap:wrap;margin:14px 0;font-size:12px;color:var(--muted)}
.legend .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:middle}
.country-group{margin-top:24px}.country-group h2{font-size:15px;margin:0 0 10px;display:flex;align-items:center;gap:8px}
.country-group h2 .cnt{background:var(--panel-2);color:var(--muted);font-size:11px;padding:1px 7px;border-radius:999px;font-weight:400}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.card{background:var(--panel);border:1px solid var(--border);border-left-width:4px;border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(16,32,43,.05)}
.card .name{font-weight:600;font-size:14px}.card .wait{font-size:13px;margin-top:6px;display:flex;align-items:center;gap:8px}
.badge{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;color:#08111c}.card .raw{color:var(--muted);font-size:11px;margin-top:8px;line-height:1.35;flex:1}
.cams{margin-top:10px;display:flex;gap:6px;flex-wrap:wrap}
.cam{display:inline-block;font-size:12px;font-weight:600;text-decoration:none;color:var(--accent);background:rgba(76,141,255,.1);border:1px solid rgba(76,141,255,.35);padding:5px 9px;border-radius:8px;text-align:center;cursor:pointer;font-family:inherit}
.cam:hover{background:rgba(76,141,255,.2)}
.cam.live{color:#ff8a90;background:rgba(239,77,86,.12);border-color:rgba(239,77,86,.45)}
.cam.live:hover{background:rgba(239,77,86,.22)}
.roadgroup{border:1px solid var(--border);border-radius:10px;margin-bottom:8px;background:var(--panel);padding:0 12px}
.roadgroup summary{cursor:pointer;padding:11px 0;font-weight:600;font-size:14px;list-style:none}
.roadgroup summary::-webkit-details-marker{display:none}
.roadgroup summary:before{content:"▸ ";color:var(--accent)}
.roadgroup[open] summary:before{content:"▾ "}
.roadgroup[open] summary{border-bottom:1px solid var(--border);margin-bottom:10px}
.roadgroup .cams{padding:0 0 12px}
.roadgroup .cnt{background:var(--panel-2);color:var(--muted);font-size:11px;padding:1px 7px;border-radius:999px;font-weight:400}
.camgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
.camshot{position:relative;display:block;background:var(--panel);border:1px solid var(--border);border-radius:10px;overflow:hidden;text-decoration:none;color:var(--text);box-shadow:0 1px 3px rgba(16,32,43,.05)}
.camshot img{width:100%;height:108px;object-fit:cover;display:block;background:var(--panel-2)}
.camshot span{display:block;padding:6px 9px;font-size:12px;font-weight:600}
.camshot:hover{border-color:var(--accent)}
.camshot.nolink{display:flex;align-items:center;justify-content:center;min-height:64px;color:var(--accent);font-weight:600;font-size:12px;text-align:center;padding:10px 40px 10px 10px}
.favbtn{position:absolute;top:6px;right:6px;width:30px;height:30px;padding:0;border:none;border-radius:50%;background:rgba(255,255,255,.88);color:#b3bac6;font-size:18px;line-height:30px;text-align:center;cursor:pointer;box-shadow:0 1px 3px rgba(16,32,43,.28);z-index:2;transition:transform .08s}
.favbtn:hover{background:#fff;transform:scale(1.12)}
.favbtn.on{color:#f5a623}
#favSection h2 .cnt{background:#fff7e6;color:#b9770e}
#favGrid:empty{display:none}
.busiest{display:flex;flex-direction:column;gap:6px}
.busyrow{display:flex;justify-content:space-between;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--border);border-left:4px solid var(--border);border-radius:9px;padding:9px 12px;cursor:pointer;text-align:left}
.busyrow:hover{border-color:var(--accent)}
.busyname{font-weight:600;font-size:14px}
.busymeta{display:flex;align-items:center;gap:8px;white-space:nowrap}
.busywait{font-size:12px;color:var(--muted)}
.cfav{background:none;border:none;cursor:pointer;font-size:17px;color:#cbd5e1;line-height:1;padding:0 0 0 6px;vertical-align:middle}
.cfav.on{color:#f5a623}
#favCrossSection .meta{margin:6px 0 0}
.cardcams{grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:5px;margin:9px 0 4px}
.cardcams .camshot img{height:56px}
.cardcams .camshot span{padding:3px 5px;font-size:9px;font-weight:600}
.cardcams .favbtn{width:22px;height:22px;font-size:13px;line-height:22px;top:3px;right:3px}
.favhint{margin:4px 0 0}
.campin{font-size:12px;width:22px;height:22px;line-height:19px;text-align:center;background:#fff;border:1.5px solid #3b82f6;border-radius:50%;box-shadow:0 1px 3px rgba(16,32,43,.4)}
.carina{position:relative;width:38px;height:38px}
.carinadiv .csign{transition:transform .1s}
.carinadiv:hover .csign{transform:scale(1.1)}
#view-map:fullscreen{background:var(--bg);padding:10px}
#view-map:-webkit-full-screen{background:var(--bg);padding:10px}
#view-map:fullscreen #map{height:92vh}
#view-map:-webkit-full-screen #map{height:92vh}
.csign{width:34px;height:34px;border-radius:50%;background:#fff;border:3px solid #d32f2f;color:#c62828;font-size:7px;font-weight:800;line-height:1.05;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.45);text-align:center}
.csign span{font-size:6px;font-weight:700;opacity:.85}
.cdot{position:absolute;top:0;right:0;width:11px;height:11px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 2px rgba(0,0,0,.4)}
.cd-none{background:var(--none)}.cd-low{background:var(--low)}.cd-moderate{background:var(--moderate)}.cd-high{background:var(--high)}.cd-severe{background:var(--severe)}.cd-unknown{background:var(--unknown)}
.searchwrap{position:relative;margin-bottom:10px}
#search{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:var(--panel);color:var(--text);font-size:14px;font-family:inherit}
#search:focus{outline:none;border-color:var(--accent)}
#searchResults{display:none;position:absolute;top:46px;left:0;right:0;background:var(--panel);border:1px solid var(--border);border-radius:10px;z-index:600;overflow:hidden;box-shadow:0 6px 20px rgba(16,32,43,.14)}
.sr{padding:9px 12px;font-size:13px;cursor:pointer;border-bottom:1px solid var(--border)}
.sr:last-child{border-bottom:none}
.sr:hover{background:var(--panel-2)}
.marker-cluster-small,.marker-cluster-medium,.marker-cluster-large{background:rgba(37,99,235,.25)}
.marker-cluster-small div,.marker-cluster-medium div,.marker-cluster-large div{background:rgba(37,99,235,.9);color:#fff;font-weight:700}
/* --- preglednost --- */
.wrap{max-width:1240px}
.filterbar{position:sticky;top:0;z-index:550;background:var(--bg);padding:10px 0 12px;margin-bottom:14px;border-bottom:1px solid var(--border)}
.filterbar .searchwrap{margin-bottom:9px}
.filterbar .chips{margin-bottom:0}
.country-group{margin-top:32px}
.country-group>h2{font-size:16px;margin:0 0 14px;padding-bottom:9px;border-bottom:2px solid var(--border);align-items:baseline}
.legend{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:9px 12px;align-items:center;margin:12px 0 4px}
.legend label{font-size:12px}
.neighbor-title{margin-top:4px}
.stat{box-shadow:0 1px 3px rgba(16,32,43,.05)}
h1{font-size:24px}
.subtitle{font-size:13px}
.tabs{display:flex;gap:4px;margin-bottom:16px;border-bottom:2px solid var(--border);flex-wrap:wrap}
.tab{background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;padding:10px 16px;font-size:14px;font-weight:600;color:var(--muted);cursor:pointer;font-family:inherit}
.tab:hover{color:var(--text)}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
#view-map{position:relative}
.zoomhint{display:none;position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:500;background:rgba(22,32,43,.86);color:#fff;padding:6px 13px;border-radius:999px;font-size:12px;font-weight:600;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.view>.country-group:first-child{margin-top:8px}
/* dvostolpčna postavitev: levo ploščice (navpično), desno večji zemljevid */
.layout{display:flex;gap:18px;align-items:flex-start}
.sidebar{flex:0 0 174px;position:sticky;top:10px}
.main{flex:1;min-width:0}
.countrytiles{display:flex;flex-direction:column;gap:7px;margin:0}
.ctile{display:grid;grid-template-columns:auto 1fr;column-gap:10px;align-items:center;text-align:left;background:var(--panel);border:1px solid var(--border);border-radius:11px;padding:9px 11px;cursor:pointer;font-family:inherit;color:var(--text);width:100%}
.ctile:hover{border-color:var(--accent)}
.ctile.active{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent) inset}
.ctile .cflag{grid-row:1/3;font-size:22px;line-height:1}
.ctile .cname{font-size:13px;font-weight:700}
.ctile .cstat{font-size:10.5px;color:var(--muted)}
@media(max-width:860px){
 .layout{flex-direction:column;gap:12px}
 .sidebar{position:static;flex:none;width:auto}
 .countrytiles{flex-direction:row;flex-wrap:wrap}
 .ctile{flex:1 1 130px}
 #map{height:440px}
}
@media(max-width:640px){
 .wrap{padding:12px 10px 48px}
 h1{font-size:20px}
 .countrytiles{grid-template-columns:repeat(3,1fr);gap:6px}
 .ctile{padding:10px 4px;border-radius:10px}
 .ctile .cflag{font-size:22px}.ctile .cname{font-size:11px}.ctile .cstat{font-size:10px}
 .tabs{flex-wrap:nowrap;gap:2px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
 .tabs::-webkit-scrollbar{display:none}
 .rhead{font-size:14px}.dname{font-size:30px}.dwait{font-size:20px}
 .tab{padding:8px 11px;font-size:13px;white-space:nowrap}
 #map{height:360px}
 .stats{gap:6px}.stat{flex:1 1 calc(33% - 6px);padding:8px 6px}.stat b{font-size:18px}
 .grid,.camgrid,.reports{grid-template-columns:1fr 1fr;gap:8px}
 .legend{font-size:11px;gap:8px 10px}
 .report,.card{padding:10px 12px}
}
@media(max-width:400px){
 .countrytiles{grid-template-columns:repeat(2,1fr)}
 .grid,.camgrid,.reports{grid-template-columns:1fr}
}
.reports{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.report{background:var(--panel);border:1px solid var(--border);border-left:4px solid var(--accent);border-radius:10px;padding:12px 14px;box-shadow:0 1px 3px rgba(16,32,43,.05)}
.report-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:6px}
.report-head b{font-size:14px}
.report-time{font-size:11px;color:var(--muted);white-space:nowrap}
.report-text{font-size:13px;color:var(--text);line-height:1.45}
.diesel{display:flex;flex-direction:column;gap:6px;max-width:520px}
.dprice{position:relative;background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;overflow:hidden}
.dprice .dn{font-size:13px;font-weight:600;z-index:1}
.dprice .dv{font-size:13px;font-weight:700;z-index:1}
.dprice .dbar{position:absolute;left:0;top:0;bottom:0;background:rgba(63,163,77,.15);z-index:0}
.tpdiv{font-size:14px;text-align:center;line-height:18px}
.fuelwrap{overflow-x:auto;border:1px solid var(--border);border-radius:10px;-webkit-overflow-scrolling:touch}
.fueltable{width:100%;border-collapse:collapse;font-size:12.5px;background:var(--panel)}
.fueltable th{text-align:left;padding:9px 10px;background:var(--panel-2);color:var(--muted);font-weight:700;white-space:nowrap}
.fueltable td{padding:8px 10px;border-top:1px solid var(--border);white-space:nowrap}
.fueltable .fc{font-weight:600}
.fueltable .fd{color:var(--muted);font-size:11px}
.fueltable tr.fx{background:rgba(76,141,255,.08)}
.fueltable tr.fx .fc{color:var(--accent)}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:1000;align-items:center;justify-content:center;padding:16px}
.modalbox{background:var(--panel);border:1px solid var(--border);border-radius:14px;max-width:920px;width:100%;max-height:92vh;overflow:auto;padding:16px}
.modalhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:10px}
.modalhead span{font-weight:600}
.modalhead button{background:var(--panel-2);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:4px 12px;cursor:pointer;font-size:16px}
.modalbody{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:640px){.modalbody{grid-template-columns:1fr}}
.vwrap .vlab{font-size:12px;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em}
.vwrap video{width:100%;border-radius:8px;background:#000;aspect-ratio:16/9}
.modalfoot{margin-top:12px;color:var(--muted);font-size:11px}
#camBig{display:block;max-width:100%;max-height:80vh;width:auto;height:auto;border-radius:10px;background:#000;min-height:200px}
.popcams{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:5px;margin:7px 0 4px}
.popcam{width:100%;height:82px;object-fit:cover;border-radius:6px;cursor:zoom-in;display:block;background:#000}
.popsrc{font-size:11px;color:var(--muted)}
.lvl-none{border-left-color:var(--none)}.b-none{background:var(--none)}.lvl-low{border-left-color:var(--low)}.b-low{background:var(--low)}
.lvl-moderate{border-left-color:var(--moderate)}.b-moderate{background:var(--moderate)}.lvl-high{border-left-color:var(--high)}.b-high{background:var(--high)}
.lvl-severe{border-left-color:var(--severe)}.b-severe{background:var(--severe);color:#fff}.lvl-unknown{border-left-color:var(--unknown)}.b-unknown{background:var(--unknown);color:#16202b}
footer{margin-top:40px;color:var(--muted);font-size:12px;line-height:1.5;border-top:1px solid var(--border);padding-top:16px}
.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#fff;color:#08111c}.leaflet-popup-content a{color:#1a55c8;font-weight:600}
</style></head><body><div class="wrap">
<div class="top"><div><h1>Promet<span>Info</span></h1><p class="subtitle">Mejni prehodi · čakanje + žive kamere · bivša Jugoslavija</p></div><span class="meta">OSNUTEK · ${new Date().toLocaleString("sl-SI")}</span></div>
<div class="layout">
<aside class="sidebar"><div class="countrytiles">${tiles}</div></aside>
<div class="main">
<div class="filterbar">
  <div class="searchwrap"><input id="search" type="text" autocomplete="off" placeholder="🔍 Išči mejni prehod ali kamero…" oninput="doSearch(this.value)"><div id="searchResults"></div></div>
</div>
<div class="tabs">
  <button class="tab active" data-view="route" onclick="showView('route',this)">🧭 Moja pot</button>
  <button class="tab" data-view="map" onclick="showView('map',this)">🗺️ Zemljevid</button>
  <button class="tab" data-view="borders" onclick="showView('borders',this)">🚧 Mejni prehodi</button>
  <button class="tab" data-view="cams" onclick="showView('cams',this)">📷 Kamere</button>
  <button class="tab" data-view="reports" onclick="showView('reports',this)">📰 Poročila</button>
  <button class="tab" data-view="truck" onclick="showView('truck',this)">🚛 Tovornjaki</button>
  <button class="tab" data-view="fuel" onclick="showView('fuel',this)">⛽ Gorivo</button>
  <button class="tab" data-view="settings" onclick="showView('settings',this)">⚙️ Nastavitve</button>
</div>
<div class="view" id="view-route">
  <div id="mpBanner"></div>
  <section class="country-group">
    <h2>🧭 Kam grem danes?</h2>
    <div class="routebar">
      <input id="mpFrom" type="text" autocomplete="off" placeholder="Izhodišče (npr. Kamnik)">
      <span class="rarrow">→</span>
      <input id="mpTo" type="text" autocomplete="off" placeholder="Cilj (npr. Banja Luka)">
      <button type="button" onclick="checkRoute()">Preveri pot</button>
    </div>
    <p class="meta" style="margin:2px 0 10px">Hitre poti (shranjene v napravi):</p>
    <div class="quickroutes" id="quickRoutes"></div>
    <p class="meta" style="margin:10px 0 4px">📱 Socialni signali (Facebook so pogosto najbolj ažurirani):</p>
    <button class="cam" onclick="openFbPaste()">📋 Prilepi objavo iz Facebooka</button>
  </section>
  <section class="country-group" id="routeResult" style="display:none"></section>
</div>
<div class="view" id="view-map" style="display:none">
<div class="routebar">
  <input id="routeFrom" type="text" autocomplete="off" placeholder="Od (npr. Banja Luka)">
  <span class="rarrow">→</span>
  <input id="routeTo" type="text" autocomplete="off" placeholder="Do (npr. Zagreb)">
  <button type="button" onclick="calcRoute()">🧭 Izračunaj pot</button>
  <button type="button" id="routeClear" onclick="clearRoute()" style="display:none">✕ počisti</button>
  <span id="routeInfo" class="routeinfo"></span>
</div>
<div id="map"></div>
<div id="zoomHint" class="zoomhint">🔍 Približaj zemljevid za prikaz kamer</div>
<div class="legend"><span><i class="dot b-none"></i>brez</span><span><i class="dot b-low"></i>do 30 min</span><span><i class="dot b-moderate"></i>do 1 h</span><span><i class="dot b-high"></i>do 2 h</span><span><i class="dot b-severe"></i>nad 2 h</span><span><i class="dot b-unknown"></i>kamera/ni podatka</span><span><i class="dot" style="background:#3b82f6"></i>cestna kamera</span><label style="margin-left:auto;cursor:pointer"><input type="checkbox" id="crossingToggle" checked onchange="toggleCrossings(this)"> 🚧 prehodi</label><label style="cursor:pointer"><input type="checkbox" id="roadToggle" checked onchange="toggleRoads(this)"> 📷 kamere</label><label style="cursor:pointer"><input type="checkbox" id="trafficToggle" checked onchange="toggleTraffic(this)"> 🚦 gostota prometa</label><span id="trafficNote" style="display:none;color:var(--muted);font-size:11px">🚦 gostota prometa trenutno ni na voljo</span><label style="cursor:pointer"><input type="checkbox" id="truckToggle" onchange="toggleTruckPark(this)"> 🅿️ parkirišča</label><label style="cursor:pointer"><input type="checkbox" id="fuelStToggle" onchange="toggleFuelSt(this)"> ⛽ črpalke</label><span id="fuelStatus" style="display:none;font-size:11px;flex-basis:100%"></span></div>
</div>
<div class="view" id="view-borders" style="display:none">
<section class="country-group" id="favCrossSection">
  <h2>⭐ Priljubljeni prehodi <span class="cnt" id="favCrossCnt">0</span></h2>
  <div class="busiest" id="favCrossList"></div>
  <p class="meta" id="favCrossHint">Klikni zvezdico ⭐ pri katerem koli prehodu spodaj — prikaže se tukaj na vrhu. Shrani se v tej napravi.</p>
</section>
<section class="country-group" id="busiestSection">
  <h2>⏱ Najdaljša čakanja zdaj <span class="cnt" id="busiestCnt">0</span></h2>
  <div class="busiest" id="busiestList"></div>
  <p class="meta" id="busiestHint" style="display:none">Trenutno ni zaznanih zastojev na prehodih z živimi podatki (čakalne dobe so večinoma za BiH).</p>
</section>
${sections}
</div>
<div class="view" id="view-cams" style="display:none">
<section class="country-group" id="favSection">
  <h2>⭐ Moje priljubljene kamere <span class="cnt" id="favCnt">0</span></h2>
  <div class="camgrid" id="favGrid"></div>
  <p class="meta favhint" id="favHint">Klikni zvezdico ⭐ na kateri koli kameri spodaj — prikaže se tukaj na vrhu, da jo odpreš brez iskanja. Shrani se v tej napravi.</p>
</section>
${bihCamHtml}
${amsrsCamHtml}
${hakBorderHtml}
${roadsHtml}
${rsRoadHtml}
${siCamHtml}
${amsmCamHtml}
</div>
<div class="view" id="view-reports" style="display:none">
${reportsHtml}
</div>
<div class="view" id="view-truck" style="display:none">
${truckHtml}
</div>
<div class="view" id="view-fuel" style="display:none">
${fuelHtml}
</div>
<div class="view" id="view-settings" style="display:none">
  <section class="country-group">
    <h2>⚙️ Nastavitve</h2>
    <h3 class="rsub">🚗 Moje vozilo</h3>
    <div class="manform" style="max-width:440px">
      <label>Ime vozila<input id="setVehName" type="text" placeholder="BMW X3 2.0d"></label>
      <label>Poraba (l/100km)<input id="setVehCons" type="number" step="0.1" min="1" inputmode="decimal"></label>
      <label>Rezervoar (l)<input id="setVehTank" type="number" min="1" inputmode="numeric"></label>
      <button class="cam" onclick="saveVehicle()">Shrani vozilo</button>
    </div>
    <h3 class="rsub">📱 Moje FB skupine (Facebook)</h3>
    <div class="manform" style="max-width:460px">
      <label>Ena skupina/stran na vrstico (lahko »Ime | povezava«)<textarea id="setFbGroups" rows="4" placeholder="Gužve na granicama | https://www.facebook.com/groups/...&#10;https://www.facebook.com/..."></textarea></label>
      <button class="cam" onclick="saveFbGroups()">Shrani FB skupine</button>
      <p class="meta">Pri vsakem prehodu v »Moja pot« dobiš povezave do teh skupin. FB skupine so pogosto najbolj ažurirane.</p>
    </div>
    <h3 class="rsub">📥 Moji socialni signali (velja 3 h)</h3>
    <div id="setSocial" class="meta"></div>
    <h3 class="rsub">🔔 Moji alarmi</h3>
    <div id="setAlarms"></div>
    <p class="meta">Alarm se sproži, ko čakanje na prehodu preseže prag — prikaže se kot pasica v zavihku »Moja pot«.</p>
    <h3 class="rsub">⭐ Moji podatki v napravi</h3>
    <div id="setCounts" class="meta"></div>
    <div class="ract"><button class="cam" onclick="clearFavs()">Počisti priljubljene</button><button class="cam" onclick="clearManual()">Počisti moje vnose</button></div>
    <h3 class="rsub">🛠️ Razvijalec</h3>
    <label style="display:flex;gap:8px;align-items:center;cursor:pointer;font-size:14px"><input type="checkbox" id="setDebug" onchange="toggleDebug(this)"> Debug način (tehnični podatki)</label>
    <div id="debugPanel" class="meta" style="display:none;margin-top:8px;background:var(--panel-2);border-radius:8px;padding:9px 11px"></div>
    <h3 class="rsub">♻️ Ponastavitev</h3>
    <button class="cam" style="border-color:#dc2626;color:#dc2626" onclick="resetAll()">Ponastavi vse (počisti localStorage)</button>
    <p class="meta">Izbriše vse osebne nastavitve v tej napravi (vozilo, priljubljene, vnose, alarme).</p>
  </section>
</div>
<footer><strong>Opomba:</strong> žive čakalne dobe trenutno iz BIHAMK (BiH); ostali prehodi prikazani z lokacijo + povezavo na uradno kamero (klik = uradni vir). 🔴 „AMSS v živo" predvaja uradni HLS tok kamere v aplikaciji. Čakalne dobe so pogosto opisne ocene. Koordinate približne (osnutek).</footer>
</div></div>
</div>
<div id="modal" class="modal" onclick="if(event.target===this)closeStream()">
  <div class="modalbox">
    <div class="modalhead"><span id="modalTitle"></span><button onclick="closeStream()">✕</button></div>
    <div id="modalBody" class="modalbody"></div>
    <div class="modalfoot">Vir: AMSS (kamere.amss.org.rs) · živ prenos v aplikaciji</div>
  </div>
</div>
<div id="driveMode"><div class="drivehead"><span>🚗 Vozim</span><button onclick="exitDrive()">✕ Končaj</button></div><div id="driveBody"></div></div>
<div id="fbPasteModal" class="modal" onclick="if(event.target===this)closeFbPaste()">
  <div class="modalbox">
    <div class="modalhead"><span>📋 Prilepi objavo iz Facebooka</span><button onclick="closeFbPaste()">✕</button></div>
    <div class="manform">
      <label>Besedilo FB objave / komentarja<textarea id="fbText" rows="4" maxlength="600" placeholder="Prilepi tukaj (npr. 'Gradiška kolona 2 km, čeka se preko sat vremena')"></textarea></label>
      <div id="fbDetect" class="meta"></div>
      <label>Prehod (samodejno zaznano — po potrebi popravi)<select id="fbCrossing"></select></label>
      <button class="drivebtn" style="background:#1877f2" onclick="saveFbPaste()">Dodaj kot socialni signal</button>
      <p class="meta">VARNO: nič se ne pobira s Facebooka — ti prilepiš besedilo. Signal velja 3 ure.</p>
    </div>
  </div>
</div>
<div id="manualModal" class="modal" onclick="if(event.target===this)closeManual()">
  <div class="modalbox">
    <div class="modalhead"><span>➕ Dodaj moj podatek o čakanju</span><button onclick="closeManual()">✕</button></div>
    <div class="manform">
      <label>Mejni prehod<select id="manCrossing"></select></label>
      <label>Vir podatka<select id="manSource"><option>HAK</option><option>AMSS</option><option>AMS-RS</option><option>BIHAMK</option><option>promet.si</option><option>Facebook</option><option value="osebno" selected>osebno (na kraju)</option><option>drugo</option></select></label>
      <label>Smer<select id="manDir"><option value="vstop v HR">vstop v Hrvaško</option><option value="izstop iz HR">izstop iz Hrvaške</option><option value="vstop v BiH">vstop v BiH</option><option value="izstop iz BiH">izstop iz BiH</option><option value="">druga / ni pomembno</option></select></label>
      <label>Čakanje (minute)<input id="manMin" type="number" min="0" max="600" inputmode="numeric" placeholder="npr. 45"></label>
      <label>Komentar (neobvezno)<input id="manCom" type="text" maxlength="80" placeholder="npr. samo en pas odprt"></label>
      <label>Povezava na vir (neobvezno)<input id="manLink" type="url" placeholder="https://…"></label>
      <label style="flex-direction:row;align-items:center;gap:8px"><input id="manVerified" type="checkbox"> Podatek sem osebno preveril</label>
      <button class="drivebtn" style="background:#2563eb" onclick="saveManual()">Shrani moj podatek</button>
      <p class="meta">Shrani se v tej napravi in dopolnjuje uradni podatek (ga ne izbriše).</p>
    </div>
  </div>
</div>
<div id="camModal" class="modal" onclick="if(event.target===this)closeCam()">
  <div class="modalbox">
    <div class="modalhead"><span id="camTitle"></span><button onclick="closeCam()">✕</button></div>
    <div style="text-align:center"><img id="camBig" referrerpolicy="no-referrer" alt=""></div>
    <div id="camCheckBar" style="display:none"></div>
    <div class="modalfoot">Živa slika (osvežuje se) · <a id="camOpen" href="#" target="_blank" rel="noopener noreferrer">odpri v novem zavihku ↗</a></div>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script>
const STREAMS=${JSON.stringify(streamsData)};
window._hls=[];
function openStream(id){
  const d=STREAMS[id]; if(!d) return;
  document.getElementById('modalTitle').textContent=d.title;
  const body=document.getElementById('modalBody'); body.innerHTML='';
  d.streams.forEach(function(s){
    const w=document.createElement('div'); w.className='vwrap';
    const l=document.createElement('div'); l.className='vlab'; l.textContent=s.label;
    const v=document.createElement('video'); v.controls=true; v.muted=true; v.autoplay=true; v.setAttribute('playsinline','');
    w.appendChild(l); w.appendChild(v); body.appendChild(w);
    if(window.Hls && Hls.isSupported()){ const h=new Hls(); h.loadSource(s.url); h.attachMedia(v); window._hls.push(h); }
    else { v.src=s.url; }
  });
  document.getElementById('modal').style.display='flex';
}
function closeStream(){
  (window._hls||[]).forEach(function(h){ try{h.destroy()}catch(e){} }); window._hls=[];
  document.getElementById('modalBody').innerHTML=''; document.getElementById('modal').style.display='none';
}
document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeStream(); });
const PTS=${JSON.stringify(points)};
const ROADPTS=${JSON.stringify(roadPoints)};
const RSROADPTS=${JSON.stringify(rsRoadPoints)};
const SIPTS=${JSON.stringify(siPoints)};
const BIHCAMPTS=${JSON.stringify(bihCamPoints)};
const AMSRSCAMPTS=${JSON.stringify(amsrsCamPoints)};
const TRUCKPTS=${JSON.stringify(TRUCK_PARKING)};
const BORDERS=${JSON.stringify(COUNTRY_BORDERS)};
const COL={none:"#2dd4a7",low:"#5fd35f",moderate:"#e7c84b",high:"#f29c3e",severe:"#ef4d56",unknown:"#6b7a8d"};
const FLAGJS=${JSON.stringify(FLAG)};
const CNAMES=${JSON.stringify(COUNTRY_NAMES)};
const ROUTES=${JSON.stringify(ROUTE_PRESETS)};
const DIESEL=${JSON.stringify(Object.fromEntries(DIESEL_PRICES.map((d) => [d.country, d.eur])))};
const DIESEL_UPD=${JSON.stringify(DIESEL_UPDATED)};
const SOC_KW=${JSON.stringify(SOCIAL_KEYWORDS)};
const FUELPTS=${JSON.stringify(FUEL_STATIONS)};
const SOC_PAGES=${JSON.stringify(SOCIAL_PAGES)};
const SOC_Q=${JSON.stringify(SOCIAL_QUERIES)};
const BORDERSEARCH=${JSON.stringify(hakBorderCams.flatMap((c) => HAK_CAM_IMAGES[c.k].map((img, i) => ({ name: HAK_CAM_IMAGES[c.k].length > 1 ? `${c.name} · kam ${i + 1}` : c.name, img, lat: c.lat, lng: c.lng }))))};
const map=L.map('map',{scrollWheelZoom:true,zoomSnap:0.5,zoomDelta:0.5,wheelPxPerZoomLevel:90}).setView([45.0,16.6],6);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{attribution:'© OpenStreetMap, © CARTO',maxZoom:20}).addTo(map);
// drzavne meje: mehek sijaj + cista pikcasta crta
try{
  L.geoJSON(BORDERS,{interactive:false,style:{color:'#818cf8',weight:7,opacity:0.10,fill:false,lineJoin:'round'}}).addTo(map);
  L.geoJSON(BORDERS,{interactive:false,style:{color:'#475569',weight:2,opacity:0.9,fill:false,dashArray:'1 8',lineCap:'round',lineJoin:'round'}}).addTo(map);
}catch(e){}
// celozaslonski gumb
function toggleFs(){ var el=document.getElementById('view-map'); if(!el)return; var fe=document.fullscreenElement||document.webkitFullscreenElement; if(!fe){ (el.requestFullscreen||el.webkitRequestFullscreen||function(){}).call(el); } else { (document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document); } setTimeout(function(){ map.invalidateSize(); }, 300); }
var fsCtrl=L.control({position:'topleft'}); fsCtrl.onAdd=function(){ var d=L.DomUtil.create('div','leaflet-bar locbtn'); d.innerHTML='<a href="#" title="Celozaslonsko" role="button" aria-label="Celozaslonsko">⛶</a>'; L.DomEvent.on(d,'click',function(e){ L.DomEvent.stop(e); toggleFs(); }); return d; }; fsCtrl.addTo(map);
document.addEventListener('fullscreenchange',function(){ setTimeout(function(){ map.invalidateSize(); },250); });
const crossingLayer=L.layerGroup().addTo(map);
function crossingIcon(level){ return L.divIcon({className:'carinadiv',html:'<div class="carina"><div class="csign">CARINA<span>DOUANE</span></div><span class="cdot cd-'+level+'"></span></div>',iconSize:[38,38],iconAnchor:[19,19]}); }
const MARKERS=[];
PTS.forEach(p=>{const cam=(p.cameras&&p.cameras.length)?'<br><span class="popsrc">uradni vir: '+p.cameras.map(c=>'<a href="'+c.url+'" target="_blank" rel="noopener noreferrer">'+c.source+' ↗</a>').join(' · ')+'</span>':'';
 var imgs=(p.images&&p.images.length)?'<div class="popcams">'+p.images.map(function(u){return '<img class="popcam snap" src="'+u.url+'" data-base="'+u.url+'" data-name="'+u.name+'" referrerpolicy="no-referrer" alt="'+u.name+'" title="'+u.name+'">';}).join('')+'</div>':'';
 const live=(p.streams&&p.streams.length)?'<br><b style="cursor:pointer;color:#c0392b" onclick="openStream(\\''+p.id+'\\')">▶ AMSS v živo</b>':'';
 const mk=L.marker([p.lat,p.lng],{icon:crossingIcon(p.level)})
 .bindTooltip('<b>'+p.name+'</b> '+FLAGJS[p.country]+'↔'+FLAGJS[p.neighbor])
 .bindPopup('<b>'+FLAGJS[p.country]+' '+p.name+' → '+FLAGJS[p.neighbor]+'</b><br>'+(p.waitMinutes==null?'čakanje: ni podatka':(p.waitMinutes<=0?'brez zadrževanja':'~'+p.waitMinutes+' min'))+'<br><small>'+p.rawStatus+'</small>'+imgs+cam+live,{maxWidth:280});
 mk.addTo(crossingLayer); MARKERS.push({mk:mk, id:p.id, cs:[p.country,p.neighbor], name:p.name, lat:p.lat, lng:p.lng});
});
document.addEventListener('click',function(e){ var t=e.target; if(t&&t.classList&&t.classList.contains('popcam')){ e.preventDefault(); openCam(t.getAttribute('data-base'), t.getAttribute('data-name')); } });
const camIcon=L.divIcon({className:'camdiv',html:'<div class="campin">📷</div>',iconSize:[22,22],iconAnchor:[11,11]});
const camCluster=L.layerGroup();
const CAMS=[];
function addCam(lat,lng,country,name,popupHtml,image,road){ var m=L.marker([lat,lng],{icon:camIcon}).bindTooltip('📷 '+name).bindPopup(popupHtml); CAMS.push({m:m,country:country,name:name,lat:lat,lng:lng,image:image||'',road:road||''}); }
ROADPTS.forEach(function(p){ var im=p.image?'<br><img src="'+p.image+'" referrerpolicy="no-referrer" style="width:240px;border-radius:6px;margin-top:4px">':''; addCam(p.lat,p.lng,'HR',p.name,'<b>📷 '+p.name+'</b><br><small>'+p.road+'</small>'+im+'<br><a href="'+p.url+'" target="_blank" rel="noopener noreferrer">odpri na HAK ↗</a>',p.image,p.road); });
RSROADPTS.forEach(function(p){ addCam(p.lat,p.lng,'RS',p.name,'<b>📷 '+p.name+'</b><br><img src="'+p.poster+'" referrerpolicy="no-referrer" style="width:240px;border-radius:6px;margin-top:4px"><br><small>Putevi Srbije</small>',p.poster); });
SIPTS.forEach(function(p){ addCam(p.lat,p.lng,'SI',p.title,'<b>📷 '+p.title+'</b><br><img src="'+p.image+'" referrerpolicy="no-referrer" style="width:240px;border-radius:6px;margin-top:4px"><br><small>DARS</small>',p.image); });
BIHCAMPTS.forEach(function(p){ addCam(p.lat,p.lng,'BA',p.name,'<b>📷 '+p.name+'</b><br><img src="'+p.image+'" referrerpolicy="no-referrer" style="width:240px;border-radius:6px;margin-top:4px"><br><small>BIHAMK</small>',p.image); });
AMSRSCAMPTS.forEach(function(p){ addCam(p.lat,p.lng,'BA',p.name,'<b>📷 '+p.name+'</b><br><img src="'+p.image+'" referrerpolicy="no-referrer" style="width:240px;border-radius:6px;margin-top:4px"><br><small>AMS-RS</small>',p.image); });
camCluster.addTo(map);
var _filter='all';
var CAM_MIN_ZOOM=9;
function rebuildCams(){ camCluster.clearLayers(); var rt=document.getElementById('roadToggle'); if(rt&&!rt.checked){ updateZoomHint(); return; } if(_filter==='all' && map.getZoom()<CAM_MIN_ZOOM){ updateZoomHint(); return; } var arr=[]; CAMS.forEach(function(o){ if(_filter==='all'||_filter===o.country) arr.push(o.m); }); if(camCluster.addLayers){camCluster.addLayers(arr);}else{arr.forEach(function(m){camCluster.addLayer(m);});} updateZoomHint(); }
function updateZoomHint(){ var el=document.getElementById('zoomHint'); if(!el) return; var rt=document.getElementById('roadToggle'), ft=document.getElementById('fuelStToggle'); var z=map.getZoom(); var need=[]; if(_filter==='all'&&rt&&rt.checked&&z<CAM_MIN_ZOOM) need.push('kamer'); if(ft&&ft.checked&&z<10) need.push('črpalk'); if(need.length){ el.textContent='🔍 Približaj zemljevid za prikaz '+need.join(' in '); el.style.display='block'; } else { el.style.display='none'; } }
function toggleRoads(cb){ rebuildCams(); }
function toggleCrossings(cb){ if(cb.checked) crossingLayer.addTo(map); else map.removeLayer(crossingLayer); }
function filterCountry(c, btn){
 _filter=c;
 var chips=document.querySelectorAll('.ctile'); for(var i=0;i<chips.length;i++) chips[i].classList.remove('active');
 if(btn) btn.classList.add('active');
 var secs=document.querySelectorAll('.country-group[data-countries]');
 for(var j=0;j<secs.length;j++){ var cs=(secs[j].getAttribute('data-countries')||'').split(' '); secs[j].style.display=(c==='all'||cs.indexOf(c)>=0)?'':'none'; }
 MARKERS.forEach(function(o){ var show=(c==='all'||o.cs.indexOf(c)>=0); if(show){o.mk.addTo(crossingLayer);}else{crossingLayer.removeLayer(o.mk);} });
 showView('map');
 setTimeout(function(){
   if(c!=='all'){ var pts=[]; MARKERS.forEach(function(o){ if(o.cs.indexOf(c)>=0) pts.push([o.lat,o.lng]); }); CAMS.forEach(function(o){ if(o.country===c) pts.push([o.lat,o.lng]); }); if(pts.length) try{ map.fitBounds(pts,{padding:[40,40],maxZoom:11}); }catch(e){} }
   rebuildCams();
 }, 130);
}
function nrm(s){ return (s||'').toLowerCase().normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]','g'),''); }
var SEARCH=[];
MARKERS.forEach(function(o){ SEARCH.push({name:o.name,lat:o.lat,lng:o.lng,t:'🚧',kind:'crossing',mk:o.mk}); });
var _imgseen={};
CAMS.forEach(function(o){ var disp=o.road?(o.name+' · '+o.road):o.name; SEARCH.push({name:disp,lat:o.lat,lng:o.lng,t:'📷',kind:'cam',img:o.image}); if(o.image)_imgseen[o.image]=1; });
// HAK mejne kamere (npr. Gornji Varos, Stara Gradiska) -> v iskanje
BORDERSEARCH.forEach(function(a){ if(a.img && !_imgseen[a.img]){ _imgseen[a.img]=1; SEARCH.push({name:a.name,lat:a.lat,lng:a.lng,t:'📷',kind:'cam',img:a.img}); } });
SEARCH.forEach(function(s,i){ s.id=i; s._n=nrm(s.name); });
function doSearch(q){ var nq=nrm(q); var box=document.getElementById('searchResults'); if(!box) return; if(!nq){box.style.display='none';box.innerHTML='';return;}
 var hits=SEARCH.filter(function(s){return s._n.indexOf(nq)>=0;});
 hits.sort(function(a,b){ return (a._n.indexOf(nq)) - (b._n.indexOf(nq)); }); // zadetki na zacetku imena prej
 hits=hits.slice(0,10);
 box.innerHTML=hits.length?hits.map(function(h){return '<div class="sr" onmousedown="gotoHit('+h.id+')">'+h.t+' '+h.name+'</div>';}).join(''):'<div class="sr" style="color:#94a3b8">ni zadetkov</div>';
 box.style.display='block'; }
function gotoHit(i){ var s=SEARCH[i]; if(!s) return; var box=document.getElementById('searchResults'); if(box)box.style.display='none'; var inp=document.getElementById('search'); if(inp)inp.value='';
 if(s.kind==='cam' && s.img){ openCam(s.img, s.name); return; }
 showView('map');
 setTimeout(function(){ try{ map.invalidateSize(); map.setView([s.lat,s.lng],12); if(s.mk) s.mk.openPopup(); }catch(e){} }, 140); }
function gotoPoint(lat,lng){ map.setView([lat,lng],13); var b=document.getElementById('searchResults'); if(b)b.style.display='none'; var s=document.getElementById('search'); if(s)s.value=''; }
var truckPark=L.layerGroup();
var truckIcon=L.divIcon({className:'tpdiv',html:'🅿️',iconSize:[18,18],iconAnchor:[9,9]});
function rebuildTruckPark(){ truckPark.clearLayers(); var tb=document.getElementById('truckToggle'); if(!tb||!tb.checked) return; TRUCKPTS.forEach(function(p){ truckPark.addLayer(L.marker([p.lat,p.lng],{icon:truckIcon}).bindTooltip('🅿️ '+p.name).bindPopup('<b>🅿️ '+p.name+'</b><br><small>'+p.type+'</small>')); }); }
function toggleTruckPark(cb){ if(cb.checked){truckPark.addTo(map);} else {map.removeLayer(truckPark);} rebuildTruckPark(); }
truckPark.addTo(map);
rebuildCams();
map.on('zoomend', function(){ rebuildCams(); rebuildTruckPark(); });

/* ⛽ Crpalke (OpenStreetMap/Overpass, dinamicno za vidno obmocje; cena dizla po drzavi) */
var fuelLayer=L.layerGroup();
var ISO2={SVN:'SI',HRV:'HR',BIH:'BA',SRB:'RS',MNE:'ME',MKD:'MK',HUN:'HU',AUT:'AT',ITA:'IT',ROU:'RO',BGR:'BG',ALB:'AL',GRC:'GR',XKX:'XK'};
function _pip(lng,lat,ring){ var inside=false; for(var i=0,j=ring.length-1;i<ring.length;j=i++){ var xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1]; if(((yi>lat)!=(yj>lat))&&(lng<(xj-xi)*(lat-yi)/(yj-yi)+xi)) inside=!inside; } return inside; }
function countryAt(lat,lng){ try{ var fs=BORDERS.features; for(var i=0;i<fs.length;i++){ var g=fs[i].geometry; if(g.type==='Polygon'){ if(_pip(lng,lat,g.coordinates[0])) return ISO2[fs[i].properties.iso]||null; } else if(g.type==='MultiPolygon'){ for(var k=0;k<g.coordinates.length;k++){ if(_pip(lng,lat,g.coordinates[k][0])) return ISO2[fs[i].properties.iso]||null; } } } }catch(e){} return null; }
var fuelIcon=L.divIcon({className:'fueldiv',html:'<div class="fuelpin">⛽</div>',iconSize:[22,22],iconAnchor:[11,11]});
var _fuelTimer=null;
function fuelStatus(msg,isErr){ var el=document.getElementById('fuelStatus'); if(!el)return; el.textContent=msg||''; el.style.display=msg?'block':'none'; el.style.color=isErr?'#dc2626':'#64748b'; }
function fuelPopup(st){
  var cc=countryAt(st.a,st.o), pr=(cc&&DIESEL[cc]!=null)?(DIESEL[cc].toFixed(3)+' €/l'):'ni cene';
  var ccN=cc?((FLAGJS[cc]||'')+' '+(CNAMES[cc]||cc)):'';
  return '<b>⛽ '+st.n+'</b>'+(ccN?'<br>'+ccN:'')+'<br>dizel ~<b>'+pr+'</b> <span style="color:#94a3b8">(okvirno, po državi · AMZS)</span>';
}
function rebuildFuel(){
  // crpalke so VGRAJENE (OSM prek CI) — brez mreznih klicev, deluje vedno
  var tb=document.getElementById('fuelStToggle');
  fuelLayer.clearLayers();
  updateZoomHint();
  if(!tb||!tb.checked){ fuelStatus(''); return; }
  if(map.getZoom()<10){ fuelStatus('Približaj zemljevid (⛽ se pokažejo pri večji povečavi).'); return; }
  var b=map.getBounds(), s=b.getSouth(), w=b.getWest(), n2=b.getNorth(), e2=b.getEast();
  var n=0;
  for(var i=0;i<FUELPTS.length;i++){
    var st=FUELPTS[i];
    if(st.a<s||st.a>n2||st.o<w||st.o>e2) continue;
    fuelLayer.addLayer(L.marker([st.a,st.o],{icon:fuelIcon}).bindTooltip('⛽ '+st.n).bindPopup(fuelPopup(st)));
    if(++n>=350) break;
  }
  fuelStatus(n?('Prikazanih '+n+' črpalk (OpenStreetMap)'+(n>=350?' — približaj za ostale':'')+'.'):'V tem območju ni znamčenih črpalk (OSM).');
}
function toggleFuelSt(cb){ if(cb.checked){ fuelLayer.addTo(map); rebuildFuel(); } else { map.removeLayer(fuelLayer); fuelLayer.clearLayers(); fuelStatus(''); updateZoomHint(); } }
map.on('moveend', function(){ if(_fuelTimer)clearTimeout(_fuelTimer); _fuelTimer=setTimeout(rebuildFuel, 600); });

/* 📍 Moja lokacija + najblizji prehod */
var youMarker=null;
function _km(a,b,c,d){ var R=6371,p=Math.PI/180,s=Math.sin((c-a)*p/2)*Math.sin((c-a)*p/2)+Math.cos(a*p)*Math.cos(c*p)*Math.sin((d-b)*p/2)*Math.sin((d-b)*p/2); return Math.round(R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s))); }
function locateMe(){
  if(!navigator.geolocation){ alert('Naprava ne podpira lokacije.'); return; }
  navigator.geolocation.getCurrentPosition(function(pos){
    var la=pos.coords.latitude, ln=pos.coords.longitude, ll=[la,ln];
    if(youMarker){ youMarker.setLatLng(ll); } else { youMarker=L.marker(ll,{icon:L.divIcon({className:'youdiv',html:'<div class="youpin">📍</div>',iconSize:[26,26],iconAnchor:[13,13]})}).addTo(map); }
    var near=null,nd=1e9; MARKERS.forEach(function(o){ var d=_km(la,ln,o.lat,o.lng); if(d<nd){nd=d;near=o;} });
    youMarker.bindTooltip(near?('Tukaj ste · najbližji prehod: '+near.name+' (~'+nd+' km)'):'Tukaj ste').openTooltip();
    map.setView(ll,10); rebuildCams();
  }, function(){ alert('Lokacije ni bilo mogoče dobiti (dovoli dostop do lokacije).'); }, {enableHighAccuracy:true,timeout:10000,maximumAge:60000});
}
var locCtrl=L.control({position:'topleft'});
locCtrl.onAdd=function(){ var d=L.DomUtil.create('div','leaflet-bar locbtn'); d.innerHTML='<a href="#" title="Moja lokacija" role="button" aria-label="Moja lokacija">📍</a>'; L.DomEvent.on(d,'click',function(e){ L.DomEvent.stop(e); locateMe(); }); return d; };
locCtrl.addTo(map);

/* samodejno osvezevanje vidnih slik kamer (~45s) */
setInterval(function(){ var vh=window.innerHeight||800; var ims=document.querySelectorAll('img.snap'); for(var i=0;i<ims.length;i++){ var im=ims[i]; if(im.offsetParent===null) continue; var r=im.getBoundingClientRect(); if(r.bottom<-50||r.top>vh+50) continue; var base=im.getAttribute('data-base'); if(!base) continue; im.src=base+(base.indexOf('?')>=0?'&':'?')+'t='+Date.now(); } }, 45000);
var TOMTOM_KEY='F4bmVyCwlAC8AYfwKDndl4iLAvCAhFh1';
var trafficLayer=null;
function toggleTraffic(cb){
 if(!TOMTOM_KEY){ cb.checked=false; alert('Za prikaz gostote prometa (kot Google Maps) rabiš brezplačen TomTom API ključ z developer.tomtom.com. Ko ga dobiš, ga vstaviva v aplikacijo in se ceste obarvajo.'); return; }
 var note=document.getElementById('trafficNote');
 if(cb.checked){
   if(!trafficLayer){
     trafficLayer=L.tileLayer('https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key='+TOMTOM_KEY,{opacity:0.75,maxZoom:22,crossOrigin:true});
     var failed=false;
     trafficLayer.on('tileerror', function(){ if(failed)return; failed=true; try{map.removeLayer(trafficLayer);}catch(e){} cb.checked=false; if(note)note.style.display='inline'; });
     trafficLayer.on('tileload', function(){ if(note)note.style.display='none'; });
   }
   if(note)note.style.display='none';
   trafficLayer.addTo(map);
 }
 else if(trafficLayer){ map.removeLayer(trafficLayer); }
}
/* 🧭 Pot: geokodiranje (Photon) + usmerjanje (OSRM), brezplacno brez kljuca */
var routeLayer=null;
function geocode(q){ return fetch('https://photon.komoot.io/api/?limit=1&lang=default&q='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(j){ var f=j&&j.features&&j.features[0]; if(!f) throw new Error('ni najdeno: '+q); var p=f.properties||{}; var nm=[p.name,p.city,p.country].filter(Boolean).join(', '); return {lat:f.geometry.coordinates[1], lng:f.geometry.coordinates[0], name:nm||q}; }); }
function calcRoute(){
  var a=(document.getElementById('routeFrom').value||'').trim(), b=(document.getElementById('routeTo').value||'').trim();
  var info=document.getElementById('routeInfo');
  if(!a||!b){ info.textContent='Vpiši izhodišče in cilj.'; return; }
  info.textContent='Računam pot…';
  Promise.all([geocode(a),geocode(b)]).then(function(pts){
    var url='https://router.project-osrm.org/route/v1/driving/'+pts[0].lng+','+pts[0].lat+';'+pts[1].lng+','+pts[1].lat+'?overview=full&geometries=geojson';
    return fetch(url).then(function(r){return r.json();}).then(function(j){
      if(j.code!=='Ok'||!j.routes||!j.routes.length) throw new Error('poti ni mogoče izračunati');
      var rt=j.routes[0];
      if(routeLayer){ map.removeLayer(routeLayer); }
      var glow=L.geoJSON(rt.geometry,{interactive:false,style:{color:'#1d4ed8',weight:11,opacity:0.18}});
      var line=L.geoJSON(rt.geometry,{interactive:false,style:{color:'#2563eb',weight:5,opacity:0.9}});
      var m1=L.marker([pts[0].lat,pts[0].lng]).bindTooltip('Od: '+pts[0].name);
      var m2=L.marker([pts[1].lat,pts[1].lng]).bindTooltip('Do: '+pts[1].name);
      routeLayer=L.layerGroup([glow,line,m1,m2]).addTo(map);
      showView('map');
      setTimeout(function(){ try{ map.invalidateSize(); map.fitBounds(line.getBounds(),{padding:[50,50]}); }catch(e){} }, 120);
      info.innerHTML='📏 <b>'+(rt.distance/1000).toFixed(0)+' km</b> · ⏱ ~'+Math.round(rt.duration/60)+' min <span style="color:#94a3b8">(brez prometa)</span>';
      document.getElementById('routeClear').style.display='';
      // gostota prometa ob poti (TomTom) — vklopi sloj, ce kljuc/domena delata
      var tt=document.getElementById('trafficToggle'); if(tt&&!tt.checked){ tt.checked=true; toggleTraffic(tt); }
    });
  }).catch(function(e){ info.textContent='Napaka: '+(e&&e.message?e.message:e); });
}
function clearRoute(){ if(routeLayer){ map.removeLayer(routeLayer); routeLayer=null; } var i=document.getElementById('routeInfo'); if(i)i.textContent=''; var c=document.getElementById('routeClear'); if(c)c.style.display='none'; }
document.addEventListener('keydown',function(e){ if(e.key==='Enter'){ var t=e.target; if(t&&(t.id==='routeFrom'||t.id==='routeTo')) calcRoute(); } });
function showView(v, btn){
 var tabs=document.querySelectorAll('.tab'); for(var i=0;i<tabs.length;i++) tabs[i].classList.remove('active');
 if(btn){ btn.classList.add('active'); } else { var tb=document.querySelector('.tab[data-view="'+v+'"]'); if(tb) tb.classList.add('active'); }
 ['route','map','borders','cams','reports','truck','fuel','settings'].forEach(function(name){ var el=document.getElementById('view-'+name); if(el) el.style.display=(v===name)?'':'none'; });
 if(v==='settings' && window.renderSocial){ try{ window.renderSocial(); }catch(e){} }
 if(v==='map'){ setTimeout(function(){ map.invalidateSize(); }, 60); }
}
(function(){ var tt=document.getElementById('trafficToggle'); if(tt&&tt.checked&&TOMTOM_KEY) toggleTraffic(tt); })();
/* ⭐ Priljubljene kamere — shranjeno v napravi (localStorage) */
var FAVKEY='promet_favs';
function favGet(){ try{ return new Set(JSON.parse(localStorage.getItem(FAVKEY)||'[]')); }catch(e){ return new Set(); } }
function favSave(){ try{ localStorage.setItem(FAVKEY, JSON.stringify(Array.from(FAVS))); }catch(e){} }
var FAVS=favGet();
function camKey(a){ var im=a.querySelector('img.snap'); var b=im&&im.getAttribute('data-base'); return b||a.getAttribute('href')||''; }
function favBtn(key,on){ var b=document.createElement('button'); b.type='button'; b.className='favbtn'+(on?' on':''); b.textContent='\\u2605'; b.title='Dodaj/odstrani med priljubljene'; b.setAttribute('aria-label','Priljubljena kamera'); b.setAttribute('data-k',key); return b; }
function favSync(){ var bs=document.querySelectorAll('.favbtn[data-k]'); for(var i=0;i<bs.length;i++){ bs[i].classList.toggle('on', FAVS.has(bs[i].getAttribute('data-k'))); } }
function favRebuild(){ var grid=document.getElementById('favGrid'); if(!grid) return; grid.innerHTML=''; var seen={}; var list=document.querySelectorAll('#view-cams .camgrid:not(#favGrid) .camshot, #view-borders .camgrid .camshot'); for(var i=0;i<list.length;i++){ var a=list[i]; var k=camKey(a); if(!k||!FAVS.has(k)||seen[k]) continue; seen[k]=1; var c=a.cloneNode(true); var ob=c.querySelector('.favbtn'); if(ob)ob.parentNode.removeChild(ob); c.appendChild(favBtn(k,true)); grid.appendChild(c); } var n=grid.children.length; var cnt=document.getElementById('favCnt'); if(cnt)cnt.textContent=n; var hint=document.getElementById('favHint'); if(hint)hint.style.display=n?'none':''; }
function favToggle(k){ if(FAVS.has(k))FAVS.delete(k); else FAVS.add(k); favSave(); favSync(); favRebuild(); }
var _camTimer=null;
function camBust(u){ return u+(u.indexOf('?')>=0?'&':'?')+'t='+Date.now(); }
function openCam(img,title){ if(!img)return; var m=document.getElementById('camModal'); document.getElementById('camTitle').textContent=title||'Kamera'; var big=document.getElementById('camBig'); big.src=img; var op=document.getElementById('camOpen'); if(op)op.href=img; m.style.display='flex'; if(_camTimer)clearInterval(_camTimer); _camTimer=setInterval(function(){ big.src=camBust(img); },15000); }
function closeCam(){ var m=document.getElementById('camModal'); if(m)m.style.display='none'; if(_camTimer){clearInterval(_camTimer);_camTimer=null;} var big=document.getElementById('camBig'); if(big)big.src=''; var cb=document.getElementById('camCheckBar'); if(cb){cb.style.display='none';cb.innerHTML='';} }
document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeCam(); });
(function favInit(){
  function attach(view){ if(!view) return; var list=view.querySelectorAll('.camgrid:not(#favGrid) .camshot'); for(var i=0;i<list.length;i++){ var a=list[i]; var k=camKey(a); if(!k) continue; if(!a.querySelector('.favbtn')) a.appendChild(favBtn(k,FAVS.has(k))); }
    view.addEventListener('click',function(e){ var t=e.target; var b=(t&&t.classList&&t.classList.contains('favbtn'))?t:(t&&t.closest?t.closest('.favbtn'):null); if(b){ e.preventDefault(); e.stopPropagation(); favToggle(b.getAttribute('data-k')); return; } var a=t&&t.closest?t.closest('.camshot'):null; if(a){ var im=a.querySelector('img.snap'); if(im){ e.preventDefault(); var nm=a.getAttribute('title')||(a.querySelector('span')?a.querySelector('span').textContent:''); openCam(im.getAttribute('data-base')||im.src, nm); } } });
  }
  attach(document.getElementById('view-cams'));
  attach(document.getElementById('view-borders'));
  favRebuild();
})();

/* ⭐ Priljubljeni prehodi + ⏱ najbolj obremenjeni prehodi */
(function(){
  var LBL={none:'Brez',low:'Kratko',moderate:'Zmerno',high:'Daljše',severe:'Dolgo',unknown:'Ni podatka'};
  var RANK={severe:5,high:4,moderate:3,low:2,none:1,unknown:0};
  function waitTxt(m){ if(m==null)return ''; if(m<=0)return 'brez zadrževanja'; if(m<60)return '~'+m+' min'; var h=Math.floor(m/60),mm=m%60; return '~'+h+' h'+(mm?' '+mm+' min':''); }
  var PBYID={}; PTS.forEach(function(p){ PBYID[p.id]=p; });
  function crossRow(p){ var w=waitTxt(p.waitMinutes); return '<div class="busyrow lvl-'+p.level+'" onclick="focusCrossing(\\''+p.id+'\\')"><span class="busyname">'+(FLAGJS[p.country]||'')+(FLAGJS[p.neighbor]||'')+' '+p.name+'</span><span class="busymeta"><span class="badge b-'+p.level+'">'+(LBL[p.level]||'')+'</span>'+(w?'<span class="busywait">'+w+'</span>':'')+'</span></span></div>'; }
  // najbolj obremenjeni
  // dejansko cakanje = znan nivo cakanja (Kratko in vec) ALI minute > 0
  var busy=PTS.filter(function(p){ return RANK[p.level]>=2 || (p.waitMinutes!=null&&p.waitMinutes>0); });
  busy.sort(function(a,b){ var aw=a.waitMinutes==null?-1:a.waitMinutes, bw=b.waitMinutes==null?-1:b.waitMinutes; return (bw-aw)||(RANK[b.level]-RANK[a.level]); });
  var bl=document.getElementById('busiestList'), bc=document.getElementById('busiestCnt'), bh=document.getElementById('busiestHint');
  if(bl){ if(busy.length){ bl.innerHTML=busy.slice(0,12).map(crossRow).join(''); if(bh)bh.style.display='none'; } else { bl.innerHTML=''; if(bh)bh.style.display='block'; } if(bc)bc.textContent=busy.length; }
  // priljubljeni prehodi
  var FCKEY='promet_fav_cross';
  function fcGet(){ try{ return JSON.parse(localStorage.getItem(FCKEY)||'[]'); }catch(e){ return []; } }
  function fcSave(a){ try{ localStorage.setItem(FCKEY, JSON.stringify(a)); }catch(e){} }
  var FC=fcGet();
  function fcSyncStars(){ var bs=document.querySelectorAll('.cfav'); for(var i=0;i<bs.length;i++){ var on=FC.indexOf(bs[i].getAttribute('data-cid'))>=0; bs[i].textContent=on?'\\u2605':'\\u2606'; bs[i].classList.toggle('on',on); } }
  function fcRender(){ var list=document.getElementById('favCrossList'), cnt=document.getElementById('favCrossCnt'), hint=document.getElementById('favCrossHint'); if(!list)return; var rows=[]; FC.forEach(function(id){ var p=PBYID[id]; if(p)rows.push(crossRow(p)); }); list.innerHTML=rows.join(''); if(cnt)cnt.textContent=rows.length; if(hint)hint.style.display=rows.length?'none':'block'; }
  window.focusCrossing=function(id){ var m=null; for(var i=0;i<MARKERS.length;i++){ if(MARKERS[i].id===id){ m=MARKERS[i]; break; } } showView('map'); setTimeout(function(){ try{ map.invalidateSize(); if(m){ map.setView([m.lat,m.lng],12); m.mk.openPopup(); } }catch(e){} }, 150); };
  var bv=document.getElementById('view-borders');
  if(bv){ bv.addEventListener('click',function(e){ var t=e.target; if(t&&t.classList&&t.classList.contains('cfav')){ e.preventDefault(); e.stopPropagation(); var id=t.getAttribute('data-cid'); var ix=FC.indexOf(id); if(ix>=0)FC.splice(ix,1); else FC.push(id); fcSave(FC); fcSyncStars(); fcRender(); } }); }
  fcSyncStars(); fcRender();
})();

/* 🧭 Moja pot: decision score, smer cakanja, zanesljivost, priporoceni prehodi */
(function(){
  var CBYID={}; PTS.forEach(function(p){ CBYID[p.id]=p; });
  var REV=false; // smer poti obrnjena (npr. Banja Luka -> Kamnik)
  function norm(s){ return (s||'').toLowerCase().normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]','g'),'').trim(); }
  function waitMinTxt(m){ if(m==null)return 'ni podatka'; if(m<=0)return 'brez zadrževanja'; if(m<60)return '~'+m+' min'; var h=Math.floor(m/60),mm=m%60; return '~'+h+' h'+(mm?' '+mm+' min':''); }
  var LVLNUM={none:30,low:22,moderate:2,high:-15,severe:-25,unknown:-15};
  function scoreCrossing(p, role){
    var s=50, w=p.waitMinutes;
    if(w!=null){ if(w<=15)s+=35; else if(w<=30)s+=25; else if(w<=60)s+=5; else s-=25; }
    else { s+=(LVLNUM[p.level]!=null?LVLNUM[p.level]:-15); }
    if(p.images&&p.images.length) s+=10;
    var age=(p.hak&&p.hak.tsISO)?(Date.now()-Date.parse(p.hak.tsISO))/60000:null;
    if(age!=null){ if(age<30)s+=15; else if(age<=120)s+=0; else s-=20; }
    else if(p.level==='unknown') s-=15;
    // VEČ VIROV: potrditev iz >1 uradnega vira dvigne oceno
    var offN=sourcesFor(p).filter(function(x){return x.official;}).length;
    if(offN>=2) s+=6;
    // socialni signali: samo OSEBNI znižajo; kamionski ne vplivajo na osebno oceno
    var ss=socSplit(p.id);
    if(ss.pax>0 && (p.waitMinutes==null||p.waitMinutes<=15)) s-=8;
    if(ss.neutral>0 && !ss.pax && !ss.truck && (p.waitMinutes==null||p.waitMinutes<=15)) s-=4;
    // kamera preverjanje (najmocnejsi rocni signal)
    var cc=ccLast(p.id);
    if(cc){ if(cc.cameraStatus==='passenger_queue') s-=25; else if(cc.cameraStatus==='clear') s+=8; else if(cc.cameraStatus==='truck_only_queue') s+=3; }
    if(role==='avoid') s-=20; else if(role==='alternative') s-=8;
    return Math.max(0, Math.min(100, Math.round(s)));
  }
  function scoreColor(s){ return s>=80?'#16a34a':(s>=60?'#ca8a04':'#dc2626'); }
  function reliab(p){
    var iso=p.hak&&p.hak.tsISO;
    if(!iso) return {dot:'⚫', txt:'ni žive čakalne dobe — zanesljivost omejena'};
    var age=(Date.now()-Date.parse(iso))/60000;
    if(age<30) return {dot:'🟢', txt:'svež podatek (< 30 min)'};
    if(age<=120) return {dot:'🟡', txt:'star 30–120 min'};
    return {dot:'🔴', txt:'star > 2 h — preveri uradni vir'};
  }
  // ---- VEČ-VIRNI SLOJ: kateri vir pravi kaj ----
  function sourcesFor(p){
    var s=[];
    if(p.hak){ var a=p.hak.tsISO?Math.round((Date.now()-Date.parse(p.hak.tsISO))/60000):null; s.push({key:'hak',label:'🇭🇷 HAK/MUP',official:true,wait:true,ageMin:a}); }
    if(p.hasLive){ s.push({key:'bihamk',label:'🇧🇦 BIHAMK',official:true,wait:true,ageMin:null}); }
    if(p.amss){ s.push({key:'amss',label:'🇷🇸 AMSS ('+(p.amss.ulazTxt||'?')+' vstop / '+(p.amss.izlazTxt||'?')+' izstop)',official:true,wait:true}); }
    if(p.images&&p.images.length){
      var u=p.images.map(function(i){return i.url||'';}).join(' ');
      if(/satwork/.test(u)) s.push({key:'amsrs',label:'🇧🇦 AMS-RS (kamera)',official:true,wait:false});
      if(/bihamk|videosurveillence/.test(u)) s.push({key:'bihcam',label:'🇧🇦 BIHAMK (kamera)',official:true,wait:false});
      if(/cam\\.asp|m\\.hak\\.hr/.test(u)) s.push({key:'hakcam',label:'🇭🇷 HAK (kamera)',official:false,wait:false});
    }
    var ml=manLast(p.id); if(ml) s.push({key:'manual',label:'📝 moj vnos '+ml.min+' min'+(ml.source?' ('+ml.source+')':''),official:false,wait:true});
    return s;
  }
  // ---- SOCIALNI SIGNALI (varno: brez scrapinga; staranje 3h) ----
  var SKEY='promet_social';
  function socGet(){ try{ return JSON.parse(localStorage.getItem(SKEY)||'[]'); }catch(e){ return []; } }
  function socSave(a){ try{ localStorage.setItem(SKEY,JSON.stringify(a)); }catch(e){} }
  function socFresh(id){ var now=Date.now(); return socGet().filter(function(x){ return x.id===id && (now-Date.parse(x.t))<3*3600*1000; }); }
  function fbGroupsC(){ try{ var a=JSON.parse(localStorage.getItem('promet_fbgroups')); if(a&&a.length) return a; }catch(e){} var old=localStorage.getItem('promet_fbgroup'); return old?[{name:'Moja FB skupina',url:old}]:[]; }
  window.shareCrossing=function(id){ var p=CBYID[id]; if(!p)return; var txt=p.name+': čakanje '+(mainWait(p)||'ni podatka')+' · '+nowHM()+' (PrometInfo)'; if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(function(){toast('Kopirano — prilepi v FB skupino.');},function(){window.prompt('Kopiraj:',txt);}); } else window.prompt('Kopiraj:',txt); };
  function socQ(p){ if(SOC_Q[p.id]) return SOC_Q[p.id]; var nm=(p.name||'').replace(/^GP\\s+/,''); return [nm+' granica gužva', nm+' granični prelaz kolona', nm+' zastoj']; }
  function fbUrl(q){ return 'https://www.facebook.com/search/posts/?q='+encodeURIComponent(q); }
  function gUrl(q){ return 'https://www.google.com/search?tbs=qdr:d&q='+encodeURIComponent(q); }
  window.addSocial=function(id){ var t=window.prompt('Socialni signal za ta prehod (kratek opis, npr. "kolona 2 km, čeka se"):'); if(!t)return; var a=socGet(); a.push({id:id,text:(''+t).slice(0,140),t:new Date().toISOString(),confirmed:false,source:'facebook'}); socSave(a); toast('Socialni signal dodan (velja 3 ure).'); if(CURRENT_ROUTE) renderRoute(CURRENT_ROUTE); };
  // ---- Prilepi iz Facebooka: zaznava prehoda + kljucnih besed ----
  var CALIAS={ 'ba-gradiska':['gradiska','stara gradiska','gornji varos','novi most'], 'ba-brod':['brod','slavonski brod','bosanski brod'], 'ba-samac':['samac','slavonski samac'], 'ba-svilaj':['svilaj'], 'ba-orasje':['orasje','zupanja'], 'ba-izacic':['izacic','licko petrovo selo'], 'ba-velika-kladusa':['velika kladusa','maljevac'], 'ba-kostajnica':['kostajnica','hrvatska kostajnica'], 'ba-gradina':['gradina','jasenovac'], 'ba-doljani':['doljani','metkovic'], 'ba-bijaca':['bijaca','nova sela'], 'ba-raca':['raca','sremska raca'], 'ba-karakaj':['karakaj','mali zvornik'], 'hr-bajakovo':['bajakovo','batrovci'], 'hr-tovarnik':['tovarnik','sid'], 'si-obrezje':['obrezje','bregana'], 'si-gruskovje':['gruskovje','macelj'], 'si-karavanke':['karavanke'] };
  function detectCrossing(txt){ var t=norm(txt); for(var id in CALIAS){ var al=CALIAS[id]; for(var i=0;i<al.length;i++){ if(t.indexOf(al[i])>=0) return id; } } for(var k in CBYID){ var nm=norm(CBYID[k].name).replace(/^gp\\s+/,''); if(nm.length>3 && t.indexOf(nm)>=0) return k; } return null; }
  function detectKw(txt){ var t=norm(txt); var found=[]; SOC_KW.forEach(function(k){ if(t.indexOf(norm(k))>=0) found.push(k); }); return found; }
  function fillFbSelect(sel){ var ids=CURRENT_ROUTE?CURRENT_ROUTE.recommended.concat(CURRENT_ROUTE.alternative,CURRENT_ROUTE.avoid):[]; if(!ids.length)ids=Object.keys(CBYID); var box=document.getElementById('fbCrossing'); box.innerHTML=ids.map(function(id){var p=CBYID[id];return p?'<option value="'+id+'"'+(id===sel?' selected':'')+'>'+p.name+'</option>':'';}).join(''); }
  window.openFbPaste=function(){ var dm=document.getElementById('fbPasteModal'); if(!dm)return; document.getElementById('fbText').value=''; document.getElementById('fbDetect').textContent=''; fillFbSelect(); dm.style.display='flex'; var ta=document.getElementById('fbText'); ta.oninput=function(){ var id=detectCrossing(ta.value); var kw=detectKw(ta.value); var d=document.getElementById('fbDetect'); if(id){ fillFbSelect(id); d.innerHTML='✅ Zaznan prehod: <b>'+CBYID[id].name+'</b>'+(kw.length?' · ključne besede: '+kw.join(', '):''); } else { d.textContent=kw.length?('Ključne besede: '+kw.join(', ')+' — prehoda nisem zaznal, izberi ročno.'):'Prehoda nisem zaznal — izberi ročno.'; } }; };
  window.closeFbPaste=function(){ var dm=document.getElementById('fbPasteModal'); if(dm)dm.style.display='none'; };
  window.saveFbPaste=function(){ var txt=(document.getElementById('fbText').value||'').trim(); var id=document.getElementById('fbCrossing').value; if(!txt||!id){ toast('Prilepi besedilo in izberi prehod.'); return; } var a=socGet(); a.push({id:id,text:txt.slice(0,200),kw:detectKw(txt),t:new Date().toISOString(),confirmed:false,source:'facebook'}); socSave(a); closeFbPaste(); toast('FB signal dodan za '+CBYID[id].name+' (velja 3 ure).'); if(CURRENT_ROUTE) renderRoute(CURRENT_ROUTE); };
  // ---- ZANESLJIVOST IZ VEČ VIROV (🟢🟡🟠🔴⚫) ----
  function confidence(p){
    var srcs=sourcesFor(p), official=srcs.filter(function(s){return s.official;});
    var officialWait=!!(p.hak||p.hasLive||p.amss);
    var age=(p.hak&&p.hak.tsISO)?(Date.now()-Date.parse(p.hak.tsISO))/60000:null;
    var stale=age!=null && age>120;
    var soc=socFresh(p.id).length;
    if(officialWait && stale) return {dot:'🔴', txt:'Podatek star ali sumljiv', col:'#dc2626'};
    if(official.length>=2) return {dot:'🟢', txt:'Potrjeno iz več virov', col:'#16a34a'};
    if(soc>0 && !officialWait) return {dot:'🟠', txt:'Socialni signal — preveri kamero', col:'#ea580c'};
    if(officialWait) return {dot:'🟡', txt:'Samo en uradni vir', col:'#ca8a04'};
    if(official.length>=1) return {dot:'🟡', txt:'En vir (kamera) — brez čakalne dobe', col:'#ca8a04'};
    return {dot:'⚫', txt:'Ni zanesljivega podatka', col:'#64748b'};
  }
  /* ===== 🚗/🚚 LOČEVANJE OSEBNIH IN TOVORNIH VOZIL ===== */
  var TRUCK_WORDS=['kamion','kamioni','sleper','šleper','sleperi','teretna vozila','tovorna vozila','tovornjak','truck','lorry','teretni terminal','carina za kamione','teretni'];
  var PAX_WORDS=['auta','automobil','avti','osobna vozila','putnicka','putnička','passenger','turisti','kolona auta','kolona automobila','ulaz osobna','izlaz osobna','porodice','osebna vozila'];
  function socClass(txt){ var t=norm(txt); var tr=false,px=false; TRUCK_WORDS.forEach(function(w){ if(t.indexOf(norm(w))>=0)tr=true; }); PAX_WORDS.forEach(function(w){ if(t.indexOf(norm(w))>=0)px=true; });
    // "kamioni stoje, auta prolaze normalno" -> avti so OK, signal je kamionski
    if(tr&&px&&/(auta|automobil|avti|osobna|putnick)[^.]{0,40}(prolaz|normaln|tece|teče|bez guzve|bez gu[zž]ve|ok\b|slobodno)/.test(t)) return 'truck';
    return (tr&&!px)?'truck':(px?'pax':'neutral'); }
  function socSplit(id){ var out={pax:0,truck:0,neutral:0}; socFresh(id).forEach(function(s){ out[socClass(s.text||'')]++; }); return out; }
  // uradna cakanja za tvojo smer (fallback: druga smer)
  function paxTruck(p){
    function pick(a,b){ return a!=null?a:b; }
    var px=null,tr=null;
    if(p.hak){
      var d=REV?[p.hak.ulazMin,p.hak.truckUlazMin,p.hak.izlazMin,p.hak.truckIzlazMin]:[p.hak.izlazMin,p.hak.truckIzlazMin,p.hak.ulazMin,p.hak.truckUlazMin];
      px=pick(d[0],d[2]); tr=pick(d[1],d[3]);
    }
    if(p.amss){
      var e=REV?[p.amss.izlazMin,p.amss.truckIzlazMin,p.amss.ulazMin,p.amss.truckUlazMin]:[p.amss.ulazMin,p.amss.truckUlazMin,p.amss.izlazMin,p.amss.truckIzlazMin];
      if(px==null) px=pick(e[0],e[2]);
      if(tr==null) tr=pick(e[1],e[3]);
    }
    if(px==null) px=p.waitMinutes;
    return {pax:px, truck:tr};
  }
  function vcls(m){ if(m==null)return {e:'⚪',t:'ni podatka',c:'#94a3b8'}; if(m<=15)return {e:'🟢',t:'verjetno tekoče',c:'#16a34a'}; if(m<=30)return {e:'🟡',t:'krajše čakanje',c:'#ca8a04'}; if(m<=60)return {e:'🟠',t:'daljše čakanje',c:'#ea580c'}; return {e:'🔴',t:'velika kolona',c:'#dc2626'}; }
  /* ===== KAMERA PREVERJANJE (rocna potrditev, velja 2 h) ===== */
  var CCKEY='promet_camcheck';
  function ccGet(){ try{ return JSON.parse(localStorage.getItem(CCKEY)||'[]'); }catch(e){ return []; } }
  function ccLast(id){ var a=ccGet().filter(function(x){ return x.borderId===id && (Date.now()-Date.parse(x.checkedAt))<2*3600*1000; }); return a.length?a[a.length-1]:null; }
  var CCLBL={passenger_queue:'🚗 avti stojijo',truck_only_queue:'🚚 samo kamioni',clear:'✅ tekoče',unclear:'❓ ni jasno'};
  window.setCamStatus=function(id,status){
    var p=CBYID[id]; var a=ccGet();
    a.push({borderId:id,borderName:p?p.name:id,direction:REV?'nazaj':'tja',cameraStatus:status,note:'',checkedAt:new Date().toISOString(),source:'manual_camera_check'});
    if(a.length>60)a=a.slice(-60);
    try{ localStorage.setItem(CCKEY,JSON.stringify(a)); }catch(e){}
    toast('Kamera preverjanje shranjeno: '+(CCLBL[status]||status));
    try{ closeCam(); }catch(e){}
    if(CURRENT_ROUTE) renderRoute(CURRENT_ROUTE);
    var dm=document.getElementById('driveMode'); if(dm&&dm.style.display==='flex') enterDrive();
  };
  window.openCamCheck=function(id){
    var p=CBYID[id]; if(!p||!p.images||!p.images.length){ toast('Ta prehod nima direktne kamere.'); return; }
    var bar=document.getElementById('camCheckBar');
    if(bar){ bar.style.display='block'; bar.innerHTML=
      '<div class="cchk"><b>Preveri na sliki:</b> 1) stojijo osebni avti? 2) samo kamioni? 3) se osebni pas premika? 4) prava smer? 5) slika uporabna?</div>'
      +'<div class="ccbtns">'
      +'<button class="ccb" style="background:#dc2626" onclick="setCamStatus(\\''+id+'\\',\\'passenger_queue\\')">🚗 Avti stojijo</button>'
      +'<button class="ccb" style="background:#ea580c" onclick="setCamStatus(\\''+id+'\\',\\'truck_only_queue\\')">🚚 Samo kamioni</button>'
      +'<button class="ccb" style="background:#16a34a" onclick="setCamStatus(\\''+id+'\\',\\'clear\\')">✅ Tekoče</button>'
      +'<button class="ccb" style="background:#64748b" onclick="setCamStatus(\\''+id+'\\',\\'unclear\\')">❓ Ni jasno</button>'
      +'</div>'; }
    openCam(p.images[0].url, p.name);
  };
  /* ===== TOMTOM QUEUE DETECTOR (Flow Segment Data; deluje, ko je domena na kljucu) ===== */
  // fwd = azimut pristopa, ko potujes OD DOMA proti Balkanu; back = povratek
  var TTQ={'ba-gradiska':{fwd:0,back:180},'ba-gradina':{fwd:315,back:135},'ba-brod':{fwd:0,back:180},'ba-svilaj':{fwd:0,back:180},'ba-orasje':{fwd:0,back:180},'ba-velika-kladusa':{fwd:0,back:180},'si-obrezje':{fwd:290,back:110},'si-gruskovje':{fwd:0,back:180},'hr-bajakovo':{fwd:270,back:90},'rs-horgos':{fwd:180,back:0},'si-karavanke':{fwd:170,back:350}};
  // znane cone kamionskih kolon (radij m okoli prehoda)
  var TRUCK_ZONES={'hr-bajakovo':2500,'si-obrezje':2000,'si-gruskovje':2000,'rs-horgos':2500,'si-karavanke':2000,'ba-gradiska':2000,'ba-brod':2000,'ba-svilaj':2000,'ba-orasje':2000,'ba-velika-kladusa':1500};
  var TTRES={};
  function destPt(lat,lng,km,bear){ var r=bear*Math.PI/180; return [lat+km*Math.cos(r)*0.008993, lng+km*Math.sin(r)*0.008993/Math.cos(lat*Math.PI/180)]; }
  window.checkTomTom=function(id){
    var p=CBYID[id]; if(!p||!TTQ[id]||p.lat==null){ toast('Za ta prehod TomTom analiza ni nastavljena.'); return; }
    TTRES[id]={status:'loading'}; if(CURRENT_ROUTE) renderRoute(CURRENT_ROUTE);
    var bear=REV?TTQ[id].back:TTQ[id].fwd, dists=[0.5,1,2,3,5];
    Promise.all(dists.map(function(km){ var pt=destPt(p.lat,p.lng,km,bear);
      return fetch('https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point='+pt[0].toFixed(5)+','+pt[1].toFixed(5)+'&unit=KMPH&key='+TOMTOM_KEY,{signal:AbortSignal.timeout(9000)})
        .then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(j){ return {km:km,d:j.flowSegmentData}; }).catch(function(){ return null; });
    })).then(function(res){
      var ok=res.filter(Boolean);
      if(!ok.length){ TTRES[id]={status:'unavailable'}; if(CURRENT_ROUTE) renderRoute(CURRENT_ROUTE); return; }
      var pts=ok.map(function(o){ var d=o.d; var ratio=(d.freeFlowSpeed>0)?(d.currentSpeed/d.freeFlowSpeed):1; return {km:o.km,cur:d.currentSpeed,free:d.freeFlowSpeed,ratio:ratio,conf:(d.confidence!=null?d.confidence:1)}; });
      var slow=pts.filter(function(x){ return x.ratio<0.5 && x.cur<20 && x.conf>=0.5 && x.km<=3; });
      var nearSlow=pts.some(function(x){ return x.km<=1 && x.ratio<0.5; });
      var queueKm=(slow.length&&nearSlow)?Math.max.apply(null,slow.map(function(x){return x.km;})):0;
      var worst=Math.min.apply(null,pts.map(function(x){return x.ratio;}));
      TTRES[id]={
        status: worst>=0.75?'normal':(worst>=0.5?'slow':(worst>=0.25?'jam':'stopped')),
        queueKm:queueKm, farOnly:(slow.length>0&&!nearSlow),
        avg:Math.round(pts.reduce(function(s,x){return s+x.cur;},0)/pts.length),
        free:Math.round(pts.reduce(function(s,x){return s+x.free;},0)/pts.length),
        drop:Math.round((1-worst)*100), lowConf:pts.some(function(x){return x.conf<0.5;}),
        inTruckZone:!!TRUCK_ZONES[id]&&queueKm>0, at:new Date()
      };
      if(CURRENT_ROUTE) renderRoute(CURRENT_ROUTE);
    });
  };
  function ttQueue(id){ var r=TTRES[id]; return !!(r&&(r.status==='jam'||r.status==='stopped')&&r.queueKm>0); }
  function ttBlock(id){
    var r=TTRES[id];
    if(!TTQ[id]) return '';
    if(!r) return '<div class="ttrow">🚦 TomTom: <button class="linklike" onclick="checkTomTom(\\''+id+'\\')">preveri kolono pred mejo</button></div>';
    if(r.status==='loading') return '<div class="ttrow">🚦 TomTom: preverjam…</div>';
    if(r.status==='unavailable') return '<div class="ttrow" style="color:var(--muted)">🚦 TomTom analiza trenutno ni na voljo — uporabljam uradne vire, kamere in socialne signale. <button class="linklike" onclick="checkTomTom(\\''+id+'\\')">poskusi znova</button></div>';
    var lbl={normal:'🟢 normalno',slow:'🟡 upočasnjeno',jam:'🟠 zastoj',stopped:'🔴 skoraj stoji'}[r.status];
    var out='🚦 TomTom: '+lbl+' · '+r.avg+'/'+r.free+' km/h (padec '+r.drop+'%)'+(r.queueKm?(' · možna kolona ~'+r.queueKm+' km'):'')+(r.lowConf?' · ⚠ nizka zanesljivost':'')+' · '+('0'+r.at.getHours()).slice(-2)+':'+('0'+r.at.getMinutes()).slice(-2)+' <button class="linklike" onclick="checkTomTom(\\''+id+'\\')">osveži</button>';
    if(r.farOnly) out+='<br><span class="meta">Počasen odsek je stran od meje — verjetno mestni promet/semafor, ne mejna kolona.</span>';
    if(r.inTruckZone) out+='<br><span class="meta">Rdeča črta je znotraj znane kamionske cone — verjetno povezana s tovornimi vozili.</span>';
    return '<div class="ttrow">'+out+'</div>';
  }
  /* ===== ZAKLJUCEK ASISTENTA (vrstni red zanesljivosti + truck contamination filter) ===== */
  function conclude(p){
    var pt=paxTruck(p), px=pt.pax, tr=pt.truck;
    var s=socSplit(p.id), cc=ccLast(p.id), tt=TTRES[p.id];
    var notes=[], likelyTruck=false;
    // 1. kriticna zapora preglasi vse
    if(/zatvoren|zaprt|prekinjen|obustavljen|zabranjen promet/i.test(p.rawStatus||'')) return {pax:{e:'🔴',t:'MOŽNA ZAPORA — preveri uradni vir!',c:'#dc2626'},truck:vcls(tr),notes:['⛔ Uradni vir omenja zaporo/prekinitev — to preglasi vse ostalo.'],likelyTruck:false};
    // truck contamination filter
    if(ttQueue(p.id) && px!=null && px<=15 && tr!=null && tr>=60){ likelyTruck=true; notes.push('TomTom kaže kolono, a uradni vir za osebna vozila kaže kratko čakanje, za tovorna dolgo — verjetno gre za tovorno kolono.'); }
    else if(ttQueue(p.id) && TTRES[p.id].inTruckZone && (px==null||px<=30)){ likelyTruck=true; notes.push('TomTom rdeča črta je verjetno kamionska (znana tovorna cona). Za osebna vozila gužva ni potrjena — preveri kamero.'); }
    // 3./4. kamera preverjanje
    if(cc){
      var ago=Math.round((Date.now()-Date.parse(cc.checkedAt))/60000);
      if(cc.cameraStatus==='passenger_queue'){ px=Math.max(px==null?0:px,61); notes.unshift('📷 Kamera potrjuje kolono osebnih vozil ('+ago+' min nazaj).'); }
      else if(cc.cameraStatus==='truck_only_queue'){ tr=Math.max(tr==null?0:tr,61); likelyTruck=true; notes.unshift('📷 Kamera kaže predvsem tovorno kolono ('+ago+' min) — za osebna vozila gužva ni potrjena.'); }
      else if(cc.cameraStatus==='clear'){ if(px!=null&&px>30)px=30; notes.unshift('📷 Kamera ne potrjuje večje kolone ('+ago+' min nazaj).'); likelyTruck=likelyTruck||ttQueue(p.id); }
      else notes.unshift('📷 Kamera ni dovolj jasna — preveri še uradni vir ali socialni signal.');
    }
    // 6./7. socialni signali (loceno)
    if(s.pax>0){ notes.push('🔎 '+s.pax+' svežih socialnih signalov omenja kolono OSEBNIH vozil — preveri kamero.'); if(px!=null&&px<=15)px=25; }
    if(s.truck>0){ notes.push('🔎 '+s.truck+' svežih socialnih signalov omenja KAMIONE — na osebna vozila verjetno ne vpliva bistveno.'); if(tr!=null)tr=Math.max(tr,61); else tr=61; }
    if(s.neutral>0 && !s.pax && !s.truck) notes.push('🔎 '+s.neutral+' svežih socialnih signalov (tip ni jasen) — preveri kamero.');
    if(px==null && !cc) notes.push('Za osebna vozila ni avtomatskega podatka — odpri kamero in potrdi stanje.');
    return {pax:vcls(px), truck:vcls(tr), notes:notes, likelyTruck:likelyTruck, paxMin:px, truckMin:tr};
  }
  function assistantNote(p){ return ''; }
  var CACC={SI:'Slovenijo',HR:'Hrvaško',RS:'Srbijo',BA:'Bosno in Hercegovino',ME:'Črno goro',MK:'Severno Makedonijo',XK:'Kosovo',HU:'Madžarsko',AT:'Avstrijo',IT:'Italijo',AL:'Albanijo',BG:'Bolgarijo',RO:'Romunijo',GR:'Grčijo'};
  function acc(c){ return CACC[c]||CNAMES[c]||c; }
  var MARK=' <span class="tvojasmer">← tvoja smer</span>';
  function dirWaits(p){
    if(p.hak){
      var other=(p.country==='HR')?p.neighbor:p.country;
      var u=(p.hak.ulazMin!=null)?p.hak.ulazTxt:'ni podatka', iz=(p.hak.izlazMin!=null)?p.hak.izlazTxt:'ni podatka';
      // smer potovanja: naprej (od doma) = vstop v tujino (izlaz iz HR); nazaj = vstop v HR (ulaz)
      return '<div class="dirrow'+(REV?' rdir-hl':'')+'">'+(FLAGJS[other]||'')+'→🇭🇷 vstop v '+acc('HR')+': <b>'+u+'</b>'+(REV?MARK:'')+'</div>'
           + '<div class="dirrow'+(!REV?' rdir-hl':'')+'">🇭🇷→'+(FLAGJS[other]||'')+' vstop v '+acc(other)+': <b>'+iz+'</b>'+(!REV?MARK:'')+'</div>';
    }
    if(p.amss){
      return '<div class="dirrow'+(!REV?' rdir-hl':'')+'">🇷🇸→ vstop v Srbijo: <b>'+(p.amss.ulazMin!=null?p.amss.ulazTxt:'ni podatka')+'</b>'+(!REV?MARK:'')+'</div>'
           + '<div class="dirrow'+(REV?' rdir-hl':'')+'">→🇷🇸 izstop iz Srbije: <b>'+(p.amss.izlazMin!=null?p.amss.izlazTxt:'ni podatka')+'</b>'+(REV?MARK:'')+' <span class="meta">(AMSS)</span></div>';
    }
    if(p.waitMinutes!=null) return '<div class="dirrow">Čakanje (obe smeri): <b>'+waitMinTxt(p.waitMinutes)+'</b></div>';
    return '<div class="dirrow" style="color:var(--muted)">Smerni podatek ni na voljo — preveri kamero / uradni vir.</div>';
  }
  function crossingCard(id, role){
    var p=CBYID[id]; if(!p) return '<div class="rcard" style="border-left:5px solid #94a3b8"><div class="rhead"><b>'+id+'</b></div><div class="rmeta" style="color:var(--muted)">Prehod ni v bazi — preveri uradni vir.</div></div>';
    var sc=scoreCrossing(p,role), col=scoreColor(sc), rl=reliab(p), cf=confidence(p);
    var icon=role==='recommended'?'✅':(role==='alternative'?'🟡':'🔴');
    var roleLbl=role==='recommended'?'Priporočeno':(role==='alternative'?'Alternativa':'Izogni se');
    var cam=(p.images&&p.images.length)?'<button class="cam" onclick="openCam(\\''+p.images[0].url+'\\',\\''+(p.name||'').replace(/[\\\\\\x27"]/g,'')+'\\')">📷 Kamera</button>':'';
    var srcs=sourcesFor(p);
    var srcLine=srcs.length?srcs.map(function(s){return s.label+(s.ageMin!=null?' ('+s.ageMin+' min)':'');}).join(' · '):'ni avtomatskih virov';
    var soc=socFresh(p.id).length, q=socQ(p)[0];
    var grpLinks=fbGroupsC().slice(0,3).map(function(g){ return '<a href="'+g.url+'" target="_blank" rel="noopener noreferrer">'+(g.name||'FB skupina')+' ↗</a>'; }).join(' · ');
    var socLine='🔎 Socialni signali: '+(soc>0?('<b>'+soc+' svežih</b> (&lt;3h)'):'ni svežih')
      +' · <a href="'+fbUrl(q)+'" target="_blank" rel="noopener noreferrer">Facebook ↗</a>'
      +' · <a href="'+gUrl(q)+'" target="_blank" rel="noopener noreferrer">Google ↗</a>'
      +(grpLinks?' · '+grpLinks:'')
      +' · <button class="linklike" onclick="addSocial(\\''+id+'\\')">➕ dodaj</button>'
      +' · <button class="linklike" onclick="shareCrossing(\\''+id+'\\')">📤 deli</button>';
    var cn=conclude(p);
    var vehLines='<div class="vehrow" style="color:'+cn.pax.c+'">🚗 Osebna vozila: <b>'+cn.pax.e+' '+cn.pax.t+'</b>'+(cn.paxMin!=null?' <span class="meta">(~'+cn.paxMin+' min)</span>':'')+'</div>'
      +'<div class="vehrow" style="color:'+cn.truck.c+'">🚚 Tovorna vozila: <b>'+cn.truck.e+' '+cn.truck.t+'</b>'+(cn.truckMin!=null?' <span class="meta">(~'+cn.truckMin+' min)</span>':'')+(cn.likelyTruck?' <span class="ttag">verjetno kamionska kolona</span>':'')+'</div>';
    var cc=ccLast(id);
    var camBlock='<div class="camver">📷 Kamera preverjanje: '
      +(cc?('<b>'+(CCLBL[cc.cameraStatus]||cc.cameraStatus)+'</b> <span class="meta">('+Math.round((Date.now()-Date.parse(cc.checkedAt))/60000)+' min nazaj)</span>'):'<span class="meta">še ni preverjeno</span>')
      +(p.images&&p.images.length?' · <button class="linklike" onclick="openCamCheck(\\''+id+'\\')">Odpri kamero in potrdi</button>':'')
      +'</div>';
    var notesHtml=cn.notes.length?('<div class="rnote">🤖 '+cn.notes.join('<br>')+'</div>'):'';
    return '<div class="rcard" style="border-left:5px solid '+col+'">'
      +'<div class="rhead"><span>'+icon+' <b>'+p.name+'</b> <span class="rrole">'+roleLbl+'</span></span><span class="rscore" style="background:'+col+'">'+sc+'/100</span></div>'
      +'<div class="rconf" style="color:'+cf.col+'">'+cf.dot+' '+cf.txt+'</div>'
      +vehLines
      +'<div class="rdir">'+dirWaits(p)+'</div>'
      +ttBlock(id)
      +camBlock
      +'<div class="rsrc">Viri: '+srcLine+'</div>'
      +'<div class="rmeta">'+rl.dot+' Svežina čakalne dobe: '+rl.txt+'</div>'
      +manLine(id)
      +'<div class="rsoc">'+socLine+'</div>'
      +notesHtml
      +'<div class="ract">'+cam+' <button class="cam" onclick="focusCrossing(\\''+id+'\\')">🗺️ Na zemljevidu</button></div>'
      +'</div>';
  }
  function routeCams(pr){
    var seen={}, out=[];
    pr.recommended.concat(pr.alternative, pr.avoid).forEach(function(id){
      var p=CBYID[id]; if(!p||!p.images) return;
      p.images.forEach(function(im){ if(im.url&&!seen[im.url]){ seen[im.url]=1; out.push(im); } });
    });
    return out;
  }
  var CURRENT_ROUTE=null;
  function rFrom(pr){ return REV?pr.to:pr.from; }
  function rTo(pr){ return REV?pr.from:pr.to; }
  window.swapDir=function(){ REV=!REV; if(CURRENT_ROUTE) renderRoute(CURRENT_ROUTE); };
  function renderRoute(pr){
    CURRENT_ROUTE=pr; window._curRoute=pr;
    var res=document.getElementById('routeResult');
    var html='<h2>'+rFrom(pr)+' → '+rTo(pr)+'</h2>';
    html+='<button class="cam" onclick="swapDir()" style="margin-bottom:8px">⇄ Obrni smer ('+rTo(pr)+' → '+rFrom(pr)+')</button>';
    var all=pr.recommended.concat(pr.alternative, pr.avoid);
    if(all.length) html+='<button class="drivebtn" onclick="enterDrive()">🚗 Vozim</button>';
    if(pr.note) html+='<p class="meta">ℹ️ '+pr.note+'</p>';
    if(!all.length){ html+='<p class="meta">Na tej poti ni mejne kontrole (Schengen) — preveri le gostoto prometa na zemljevidu.</p>'; }
    else {
      pr.recommended.forEach(function(id){ html+=crossingCard(id,'recommended'); });
      pr.alternative.forEach(function(id){ html+=crossingCard(id,'alternative'); });
      pr.avoid.forEach(function(id){ html+=crossingCard(id,'avoid'); });
    }
    var cams=routeCams(pr);
    if(cams.length){
      html+='<h3 class="rsub">📷 Kamere za to pot</h3>';
      html+='<div class="camgrid cardcams">'+cams.slice(0,12).map(function(im){ return '<a class="camshot" href="'+im.url+'" data-name="'+(im.name||'')+'"><img class="snap" data-base="'+im.url+'" src="'+im.url+'" loading="lazy" referrerpolicy="no-referrer" alt="'+(im.name||'')+'"><span>'+(im.name||'')+'</span></a>'; }).join('')+'</div>';
      html+='<button class="cam" onclick="showView(\\'cams\\')" style="margin-top:4px">Odpri vse kamere ↗</button>';
    }
    if(pr.fuelCountries&&pr.fuelCountries.length){ html+=fuelBlock(pr); }
    html+='<div class="ract" style="margin-top:12px"><button class="cam" onclick="shareState()">📋 Pošlji stanje</button><button class="cam" onclick="openManual()">➕ Dodaj moj podatek</button></div>';
    res.innerHTML=html; res.style.display='';
    try{ res.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){}
    updateFuelDistance(pr);
  }
  // ---- gorivo po poti (profil vozila) ----
  var VKEY='promet_vehicle';
  function veh(){ try{ var v=JSON.parse(localStorage.getItem(VKEY)); if(v&&v.name) return v; }catch(e){} return {name:'BMW X3 2.0d', cons:7.8, tank:67}; }
  function fuelCC(pr){ var c=(pr.fuelCountries||[]); return c.indexOf('SI')>=0?c:['SI'].concat(c); }
  function fuelBlock(pr){
    var v=veh();
    var rows=fuelCC(pr).map(function(c){return {c:c, eur:DIESEL[c]};}).filter(function(x){return x.eur!=null;});
    if(!rows.length) return '';
    rows.sort(function(a,b){return a.eur-b.eur;});
    var cheap=rows[0];
    var h='<h3 class="rsub">⛽ Gorivo na poti</h3><div class="rfuel">';
    h+='<div class="meta" style="margin-bottom:6px">Vozilo: '+v.name+' · '+v.cons+' l/100km · rezervoar '+v.tank+' l · cene dizla AMZS '+DIESEL_UPD+'</div>';
    h+=rows.map(function(x){return (FLAGJS[x.c]||'')+' '+(CNAMES[x.c]||x.c)+': <b>'+x.eur.toFixed(3)+' €/l</b>'+(x.c===cheap.c?' ✅':'');}).join('<br>');
    h+='<div style="margin-top:8px">✅ <b>Najbolje tankati: '+(CNAMES[cheap.c]||cheap.c)+'</b> ('+cheap.eur.toFixed(3)+' €/l)</div>';
    if(DIESEL.SI!=null && cheap.c!=='SI' && DIESEL.SI>cheap.eur) h+='<div>⚠ Ne tankaj v Sloveniji, če ni nujno (dražje za ~'+Math.round((DIESEL.SI-cheap.eur)*100)+' centov/l kot v '+(CNAMES[cheap.c]||cheap.c)+').</div>';
    h+='<div id="fuelTrip" class="meta" style="margin-top:8px">Računam porabo za pot…</div>';
    h+='<button class="cam" style="margin-top:8px" onclick="showRouteFuel()">⛽ Pokaži črpalke ob poti</button>';
    h+='<div id="fuelSuggest" class="meta" style="margin-top:6px"></div>';
    h+='</div>';
    return h;
  }
  window.showRouteFuel=function(){
    var pr=CURRENT_ROUTE; if(!pr) return;
    var rf=document.getElementById('routeFrom'), rt=document.getElementById('routeTo');
    if(rf)rf.value=rFrom(pr); if(rt)rt.value=rTo(pr);
    var cb=document.getElementById('fuelStToggle'); if(cb&&!cb.checked){ cb.checked=true; if(window.toggleFuelSt)toggleFuelSt(cb); }
    calcRoute(); // narise pot + preklopi na zemljevid
    toast('Približaj del poti za prikaz črpalk in cen (⛽).');
  };
  function updateFuelDistance(pr){
    if(!pr.fuelCountries||!pr.fuelCountries.length) return;
    var cheapC=fuelCC(pr).filter(function(c){return DIESEL[c]!=null;}).sort(function(a,b){return DIESEL[a]-DIESEL[b];})[0];
    Promise.all([geocode(pr.from),geocode(pr.to)]).then(function(p){
      var url='https://router.project-osrm.org/route/v1/driving/'+p[0].lng+','+p[0].lat+';'+p[1].lng+','+p[1].lat+'?overview=simplified&geometries=geojson';
      return fetch(url).then(function(r){return r.json();}).then(function(j){
        if(j.code!=='Ok'||!j.routes.length) throw 0;
        var km=j.routes[0].distance/1000, v=veh(), liters=km/100*v.cons;
        var prices=fuelCC(pr).map(function(c){return DIESEL[c];}).filter(function(x){return x!=null;}).sort(function(a,b){return a-b;});
        var cheap=prices[0], dear=prices[prices.length-1], cost=liters*cheap, save=liters*(dear-cheap);
        var t=document.getElementById('fuelTrip');
        if(t) t.innerHTML='Pot ~<b>'+km.toFixed(0)+' km</b> · poraba ~<b>'+liters.toFixed(0)+' l</b> · strošek ~<b>'+cost.toFixed(0)+' €</b> (po najcenejši)'+(save>1?(' · prihranek do ~'+save.toFixed(0)+' € proti najdražji državi'):'');
        // konkreten predlog crpalke ob poti v najcenejsi drzavi
        var coords=(j.routes[0].geometry&&j.routes[0].geometry.coordinates)||[];
        if(cheapC && coords.length && typeof countryAt==='function') suggestStation(coords, cheapC);
      });
    }).catch(function(){ var t=document.getElementById('fuelTrip'); if(t) t.textContent='Porabe za pot ni bilo mogoče izračunati.'; });
  }
  function suggestStation(coords, cc){
    var box=document.getElementById('fuelSuggest'); if(!box) return;
    // najdi tocko na poti v najcenejsi drzavi (nekje na sredini tega odseka)
    var inC=coords.filter(function(c){ return countryAt(c[1],c[0])===cc; });
    if(!inC.length){ return; }
    var pt=inC[Math.floor(inC.length*0.55)]; // [lng,lat]
    // vgrajene OSM crpalke: najblizje tocki na poti (brez mreznih klicev)
    var near=[];
    for(var i=0;i<FUELPTS.length;i++){
      var st=FUELPTS[i];
      var dLat=(st.a-pt[1])*111, dLng=(st.o-pt[0])*111*Math.cos(pt[1]*Math.PI/180);
      var d2=dLat*dLat+dLng*dLng;
      if(d2<36) near.push({st:st,d:d2}); // <6 km
    }
    if(!near.length){ box.innerHTML='V bližini poti (v '+(CNAMES[cc]||cc)+') ni znamčene črpalke — vklopi ⛽ na zemljevidu.'; return; }
    near.sort(function(a,b){return a.d-b.d;});
    var names=[]; near.slice(0,5).forEach(function(x){ if(names.indexOf(x.st.n)<0) names.push(x.st.n); });
    var first=near[0].st;
    box.innerHTML='✅ Predlog za tank ('+(FLAGJS[cc]||'')+' '+(CNAMES[cc]||cc)+', ~'+DIESEL[cc].toFixed(3)+' €/l): <b>'+names.slice(0,3).join(', ')+'</b> ob poti. <a href="https://www.google.com/maps?q='+first.a+','+first.o+'" target="_blank" rel="noopener noreferrer">📍 zemljevid ↗</a>';
  }
  // ---- share stanje ----
  function nowHM(){ var n=new Date(); return ('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2); }
  window.shareState=function(){
    var pr=CURRENT_ROUTE; if(!pr) return;
    var rec=pr.recommended[0]?CBYID[pr.recommended[0]]:null, alt=pr.alternative[0]?CBYID[pr.alternative[0]]:null, av=pr.avoid[0]?CBYID[pr.avoid[0]]:null;
    var lines=[rFrom(pr)+' → '+rTo(pr)];
    if(rec){ lines.push('Priporočilo: '+rec.name); lines.push('Čakanje: '+mainWait(rec)); }
    if(alt) lines.push('Alternativa: '+alt.name+' · '+mainWait(alt));
    if(av) lines.push('Izogni se: '+av.name+' · '+mainWait(av));
    lines.push('Osveženo: '+nowHM());
    var txt=lines.join('\\n');
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(function(){toast('Stanje kopirano — prilepi kamor koli.');},function(){window.prompt('Kopiraj stanje:',txt);}); }
    else window.prompt('Kopiraj stanje:',txt);
  };
  function toast(msg){ var t=document.getElementById('toast'); if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); } t.textContent=msg; t.style.display='block'; clearTimeout(t._h); t._h=setTimeout(function(){t.style.display='none';},2600); }
  // ---- rocni vnos cakanja ----
  var MKEY='promet_manual';
  function manGet(){ try{ return JSON.parse(localStorage.getItem(MKEY)||'[]'); }catch(e){ return []; } }
  function manSave(a){ try{ localStorage.setItem(MKEY, JSON.stringify(a)); }catch(e){} }
  function manLast(id){ var a=manGet().filter(function(x){return x.id===id;}); return a.length?a[a.length-1]:null; }
  function manLine(id){ var ml=manLast(id); if(!ml) return ''; return '<div class="rmine">📝 Moj zadnji vnos: <b>'+ml.min+' min</b> ob '+ml.hh+(ml.dir?' · '+ml.dir:'')+(ml.com?' — '+(''+ml.com).replace(/</g,'&lt;'):'')+'</div>'; }
  window.openManual=function(){ var dm=document.getElementById('manualModal'); if(!dm)return; var sel=document.getElementById('manCrossing'); var ids=CURRENT_ROUTE?CURRENT_ROUTE.recommended.concat(CURRENT_ROUTE.alternative,CURRENT_ROUTE.avoid):Object.keys(CBYID); sel.innerHTML=ids.map(function(id){var p=CBYID[id];return p?'<option value="'+id+'">'+p.name+'</option>':'';}).join(''); dm.style.display='flex'; };
  window.closeManual=function(){ var dm=document.getElementById('manualModal'); if(dm)dm.style.display='none'; };
  window.saveManual=function(){ var id=document.getElementById('manCrossing').value, dir=document.getElementById('manDir').value, min=parseInt(document.getElementById('manMin').value,10), com=(document.getElementById('manCom').value||'').slice(0,80); var src=document.getElementById('manSource')?document.getElementById('manSource').value:'osebno'; var link=document.getElementById('manLink')?document.getElementById('manLink').value.slice(0,300):''; var ver=document.getElementById('manVerified')?document.getElementById('manVerified').checked:false; if(!id||isNaN(min)){ toast('Izberi prehod in vnesi minute.'); return; } var a=manGet(); a.push({id:id,dir:dir,min:min,com:com,source:src,link:link,verified:ver,t:new Date().toISOString(),hh:nowHM()}); manSave(a); closeManual(); toast('Tvoj podatek je shranjen.'); if(CURRENT_ROUTE) renderRoute(CURRENT_ROUTE); };
  // klik na kamero v "Moja pot" -> odpri veliko sliko
  var vr=document.getElementById('view-route');
  if(vr) vr.addEventListener('click',function(e){ var a=e.target&&e.target.closest?e.target.closest('.camshot'):null; if(a){ var im=a.querySelector('img.snap'); if(im){ e.preventDefault(); openCam(im.getAttribute('data-base')||im.src, a.getAttribute('data-name')||''); } } });
  // 🚗 Vozim nacin
  function freshTxt(p){ if(!(p&&p.hak&&p.hak.tsISO)) return 'ni žive čakalne dobe'; var a=Math.round((Date.now()-Date.parse(p.hak.tsISO))/60000); return a<1?'pravkar':('pred '+a+' min'); }
  function mainWait(p){ if(!p) return 'ni podatka'; if(p.hak){ var d=[]; if(p.hak.ulazMin!=null)d.push('vstop '+p.hak.ulazTxt); if(p.hak.izlazMin!=null)d.push('izstop '+p.hak.izlazTxt); if(d.length) return d.join(' · '); } if(p.waitMinutes!=null) return waitMinTxt(p.waitMinutes); return 'ni podatka'; }
  window.enterDrive=function(){
    var pr=CURRENT_ROUTE; if(!pr) return;
    var dm=document.getElementById('driveMode'); var body=document.getElementById('driveBody');
    var recId=pr.recommended[0], altId=pr.alternative[0], avId=pr.avoid[0];
    var rec=recId?CBYID[recId]:null, alt=altId?CBYID[altId]:null, av=avId?CBYID[avId]:null;
    var h='<div class="droute">'+rFrom(pr)+' → '+rTo(pr)+'</div>';
    if(rec){
      var cn=conclude(rec);
      h+='<div class="dgo"><div class="dlabel">✅ Pojdi</div><div class="dname">'+rec.name+'</div>'
        +'<div class="dveh" style="color:'+cn.pax.c+'">🚗 '+cn.pax.e+' '+cn.pax.t+(cn.paxMin!=null?' (~'+cn.paxMin+' min)':'')+'</div>'
        +'<div class="dveh" style="color:'+cn.truck.c+'">🚚 '+cn.truck.e+' '+cn.truck.t+(cn.truckMin!=null?' (~'+cn.truckMin+' min)':'')+'</div>'
        +'<div class="dfresh">🔄 '+freshTxt(rec)+'</div>';
      var ccd=ccLast(recId);
      if(ccd) h+='<div class="dfresh">📷 '+(CCLBL[ccd.cameraStatus]||'')+' ('+Math.round((Date.now()-Date.parse(ccd.checkedAt))/60000)+' min)</div>';
      h+='<div class="dpazi">⚠ PAZI: rdeča črta na navigaciji je lahko samo kamionska kolona. Preveri kamero.</div>';
      if(rec.images&&rec.images.length) h+='<button class="dcam" onclick="openCamCheck(\\''+recId+'\\')">📷 Odpri kamero in potrdi</button>';
      h+='<div class="dccbtns">'
        +'<button class="ccb" style="background:#dc2626" onclick="setCamStatus(\\''+recId+'\\',\\'passenger_queue\\')">🚗 Avti stojijo</button>'
        +'<button class="ccb" style="background:#ea580c" onclick="setCamStatus(\\''+recId+'\\',\\'truck_only_queue\\')">🚚 Samo kamioni</button>'
        +'<button class="ccb" style="background:#16a34a" onclick="setCamStatus(\\''+recId+'\\',\\'clear\\')">✅ Tekoče</button>'
        +'</div>';
      h+='</div>';
    } else { h+='<div class="dgo"><div class="dname">Brez mejne kontrole (Schengen)</div><div class="dwait">vožnja prosta — preveri gostoto</div></div>'; }
    if(alt) h+='<div class="dalt">🟡 Alternativa: <b>'+alt.name+'</b> · '+mainWait(alt)+'</div>';
    if(av) h+='<div class="davoid">🔴 Izogni se: <b>'+av.name+'</b> · '+mainWait(av)+'</div>';
    h+='<div class="dactions">'
      +'<button class="dcam" style="background:#334155" onclick="enterDrive()">🔄 Osveži</button>'
      +(rec&&rec.lat!=null?'<a class="dcam" style="background:#0f766e;text-decoration:none;display:block;text-align:center" href="https://www.google.com/maps/dir/?api=1&destination='+rec.lat+','+rec.lng+'" target="_blank" rel="noopener noreferrer">🧭 Odpri navigacijo</a>':'')
      +'</div>';
    body.innerHTML=h; dm.style.display='flex';
  };
  window.exitDrive=function(){ var dm=document.getElementById('driveMode'); if(dm)dm.style.display='none'; };
  function renderQuick(){
    var box=document.getElementById('quickRoutes'); if(!box) return;
    box.innerHTML=ROUTES.map(function(r){ return '<button class="qroute" onclick="selectRoute(\\''+r.id+'\\')">'+r.from+' → '+r.to+'</button>'; }).join('');
  }
  window.selectRoute=function(id){ var pr=ROUTES.filter(function(r){return r.id===id;})[0]; if(!pr)return; REV=false; var a=document.getElementById('mpFrom'),b=document.getElementById('mpTo'); if(a)a.value=pr.from; if(b)b.value=pr.to; showView('route'); renderRoute(pr); };
  window.checkRoute=function(){
    var a=(document.getElementById('mpFrom').value||'').trim(), b=(document.getElementById('mpTo').value||'').trim();
    var res=document.getElementById('routeResult');
    if(!a||!b){ res.style.display=''; res.innerHTML='<p class="meta">Vpiši izhodišče in cilj.</p>'; return; }
    var pr=ROUTES.filter(function(r){return norm(r.from)===norm(a)&&norm(r.to)===norm(b);})[0];
    if(pr){ REV=false; renderRoute(pr); return; }
    var prR=ROUTES.filter(function(r){return norm(r.from)===norm(b)&&norm(r.to)===norm(a);})[0];
    if(prR){ REV=true; renderRoute(prR); return; }
    res.style.display=''; res.innerHTML='<h2>'+a+' → '+b+'</h2><p class="meta">Za to pot še nimam presetov mejnih prehodov. Pot rišem na zemljevidu…</p>';
    var rf=document.getElementById('routeFrom'), rt=document.getElementById('routeTo'); if(rf)rf.value=a; if(rt)rt.value=b; calcRoute();
  };
  document.addEventListener('keydown',function(e){ if(e.key==='Enter'){ var t=e.target; if(t&&(t.id==='mpFrom'||t.id==='mpTo')) checkRoute(); } });
  // ---- vikend radar (tveganje glede na dan/uro/sezono) ----
  function weekendRadar(){
    var d=new Date(), day=d.getDay(), h=d.getHours(), mo=d.getMonth()+1, lvl=0, why=[];
    if(day===5 && h>=14 && h<20){ why.push('petek popoldne (proti Hrvaški/BiH/Srbiji)'); lvl=2; }
    if(day===6 && h>=6 && h<12){ why.push('sobota dopoldne (proti morju)'); lvl=2; }
    if(day===0 && h>=15 && h<22){ why.push('nedeljski popoldanski povratek proti EU'); lvl=2; }
    if(mo>=6 && mo<=8){ why.push('turistična sezona'); lvl=Math.max(lvl, lvl>=2?2:1); }
    return { lvl: lvl>=2?'visoko':(lvl===1?'srednje':'nizko'), why: why };
  }
  // ---- lokalni alarmi ----
  var AKEY='promet_alarms';
  function alarmsGet(){ try{ var a=JSON.parse(localStorage.getItem(AKEY)); if(a&&a.length) return a; }catch(e){} return [
    {crossing:'si-obrezje', min:45, label:'Obrežje nad 45 min'},
    {crossing:'hr-bajakovo', min:60, label:'Bajakovo nad 60 min'},
    {crossing:'si-karavanke', min:30, label:'Karavanke nad 30 min'}
  ]; }
  function checkAlarms(){ var fired=[]; alarmsGet().forEach(function(al){ var p=CBYID[al.crossing]; if(p&&p.waitMinutes!=null&&p.waitMinutes>al.min) fired.push(al.label+' — trenutno ~'+p.waitMinutes+' min'); }); return fired; }
  function renderBanner(){
    var box=document.getElementById('mpBanner'); if(!box) return;
    var html='';
    var wr=weekendRadar();
    var col=wr.lvl==='visoko'?'#dc2626':(wr.lvl==='srednje'?'#ca8a04':'#16a34a');
    html+='<div class="mpalert" style="border-left:5px solid '+col+'"><b>📅 Napoved tveganja: '+wr.lvl.toUpperCase()+'</b>'+(wr.why.length?'<br><span class="meta">Razlog: '+wr.why.join(' + ')+'</span>':'<br><span class="meta">Trenutno ni posebnih dejavnikov.</span>')+'</div>';
    var fired=checkAlarms();
    if(fired.length){ html+='<div class="mpalert" style="border-left:5px solid #dc2626"><b>🔔 Alarmi</b><br><span class="meta">'+fired.join('<br>')+'</span></div>'; }
    box.innerHTML=html;
  }
  renderQuick(); renderBanner();
})();

/* ⚙️ Nastavitve */
(function(){
  function flash(m){ var t=document.getElementById('toast'); if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t);} t.textContent=m; t.style.display='block'; clearTimeout(t._h); t._h=setTimeout(function(){t.style.display='none';},2600); }
  function loadVeh(){ var v; try{v=JSON.parse(localStorage.getItem('promet_vehicle'));}catch(e){} v=v||{name:'BMW X3 2.0d',cons:7.8,tank:67}; var n=document.getElementById('setVehName'),c=document.getElementById('setVehCons'),t=document.getElementById('setVehTank'); if(n)n.value=v.name; if(c)c.value=v.cons; if(t)t.value=v.tank; }
  window.saveVehicle=function(){ var v={name:(document.getElementById('setVehName').value||'Moje vozilo').slice(0,40), cons:parseFloat(document.getElementById('setVehCons').value)||7.8, tank:parseInt(document.getElementById('setVehTank').value,10)||60}; localStorage.setItem('promet_vehicle',JSON.stringify(v)); flash('Vozilo shranjeno.'); };
  function getAlarms(){ try{var a=JSON.parse(localStorage.getItem('promet_alarms')); if(a&&a.length)return a;}catch(e){} return [{crossing:'si-obrezje',min:45,label:'Obrežje'},{crossing:'hr-bajakovo',min:60,label:'Bajakovo'},{crossing:'si-karavanke',min:30,label:'Karavanke'}]; }
  function renderAlarms(){ var box=document.getElementById('setAlarms'); if(!box)return; var a=getAlarms(); box.innerHTML=a.map(function(al,i){ return '<div class="alrow"><span>'+al.label+'</span> prag: <input type="number" min="0" max="600" data-i="'+i+'" class="althr" value="'+al.min+'"> min</div>'; }).join('')+'<button class="cam" onclick="saveAlarms()" style="margin-top:8px">Shrani alarme</button>'; }
  window.saveAlarms=function(){ var a=getAlarms(); var inps=document.querySelectorAll('.althr'); for(var i=0;i<inps.length;i++){ var ix=+inps[i].getAttribute('data-i'); a[ix].min=parseInt(inps[i].value,10)||0; } localStorage.setItem('promet_alarms',JSON.stringify(a)); flash('Alarmi shranjeni.'); };
  function cnt(k){ try{var a=JSON.parse(localStorage.getItem(k)||'[]'); return a.length||0;}catch(e){return 0;} }
  function renderCounts(){ var box=document.getElementById('setCounts'); if(!box)return; box.innerHTML='Priljubljene kamere: <b>'+cnt('promet_favs')+'</b> · priljubljeni prehodi: <b>'+cnt('promet_fav_cross')+'</b> · moji vnosi čakanja: <b>'+cnt('promet_manual')+'</b>'; }
  window.clearFavs=function(){ localStorage.removeItem('promet_favs'); localStorage.removeItem('promet_fav_cross'); renderCounts(); flash('Priljubljene počiščene (osveži stran za prikaz).'); };
  window.clearManual=function(){ localStorage.removeItem('promet_manual'); renderCounts(); flash('Moji vnosi počiščeni.'); };
  function debugInfo(){
    var tom=(typeof TOMTOM_KEY!=='undefined'&&TOMTOM_KEY)?'ključ vstavljen — domena mora biti na TomTom seznamu (brankotrivic-netizen.github.io/*)':'brez ključa';
    var pts=(typeof PTS!=='undefined')?PTS.length:'?';
    var keys=Object.keys(localStorage).filter(function(k){return k.indexOf('promet_')===0;}).join(', ')||'(brez)';
    return 'Prehodov v podatkih: '+pts+'<br>TomTom prometni sloj: '+tom+'<br>localStorage ključi: '+keys+'<br>Zaslon: '+window.innerWidth+'×'+window.innerHeight+' px';
  }
  window.toggleDebug=function(cb){ localStorage.setItem('promet_debug', cb.checked?'1':'0'); var p=document.getElementById('debugPanel'); if(p){ p.style.display=cb.checked?'block':'none'; if(cb.checked)p.innerHTML=debugInfo(); } };
  window.resetAll=function(){ if(!confirm('Počistim vse osebne nastavitve v tej napravi (vozilo, priljubljene, vnose, alarme)?'))return; Object.keys(localStorage).filter(function(k){return k.indexOf('promet_')===0;}).forEach(function(k){localStorage.removeItem(k);}); location.reload(); };
  function fbGroups(){ try{ var a=JSON.parse(localStorage.getItem('promet_fbgroups')); if(a&&a.length) return a; }catch(e){} var old=localStorage.getItem('promet_fbgroup'); return old?[{name:'Moja FB skupina',url:old}]:[]; }
  function loadFb(){ var el=document.getElementById('setFbGroups'); if(el) el.value=fbGroups().map(function(g){return g.name&&g.name!==g.url?(g.name+' | '+g.url):g.url;}).join('\\n'); }
  window.saveFbGroups=function(){ var lines=(document.getElementById('setFbGroups').value||'').split('\\n'); var out=[]; lines.forEach(function(ln){ ln=ln.trim(); if(!ln)return; var parts=ln.split('|'); var name,url; if(parts.length>=2){ name=parts[0].trim(); url=parts.slice(1).join('|').trim(); } else { url=ln; name='FB skupina'; } if(/^https?:\\/\\//.test(url)) out.push({name:name.slice(0,40),url:url.slice(0,300)}); }); localStorage.setItem('promet_fbgroups',JSON.stringify(out)); localStorage.removeItem('promet_fbgroup'); flash('FB skupine shranjene ('+out.length+').'); };
  // zgodovina socialnih signalov
  var _pname={}; try{ (typeof PTS!=='undefined'?PTS:[]).forEach(function(p){ _pname[p.id]=p.name; }); }catch(e){}
  function socAll(){ try{ return JSON.parse(localStorage.getItem('promet_social')||'[]'); }catch(e){ return []; } }
  function agoTxt(iso){ var m=Math.round((Date.now()-Date.parse(iso))/60000); return m<1?'pravkar':(m<60?(m+' min nazaj'):(Math.round(m/60)+' h nazaj')); }
  window.renderSocial=function(){ var box=document.getElementById('setSocial'); if(!box)return; var a=socAll(); if(!a.length){ box.innerHTML='Ni socialnih signalov.'; return; }
    box.innerHTML=a.slice().reverse().map(function(s){ var i=a.indexOf(s); var fresh=(Date.now()-Date.parse(s.t))<3*3600*1000; return '<div class="alrow"><span>'+(fresh?'🟢':'⚫')+' <b>'+(_pname[s.id]||s.id)+'</b>: '+((s.text||'').replace(/</g,'&lt;').slice(0,60))+' <span style="color:#94a3b8">· '+agoTxt(s.t)+(s.source?' · '+s.source:'')+'</span></span><button class="cam" onclick="delSocial('+i+')">🗑</button></div>'; }).join(''); };
  window.delSocial=function(i){ var a=socAll(); if(i>=0&&i<a.length){ a.splice(i,1); localStorage.setItem('promet_social',JSON.stringify(a)); renderSocial(); flash('Signal izbrisan.'); } };
  loadVeh(); loadFb(); renderAlarms(); renderCounts(); renderSocial();
  var dbg=localStorage.getItem('promet_debug')==='1', dc=document.getElementById('setDebug'); if(dc){ dc.checked=dbg; if(dbg){ var dp=document.getElementById('debugPanel'); dp.style.display='block'; dp.innerHTML=debugInfo(); } }
})();
</script></body></html>`;

  const out = resolve(process.cwd(), "osnutek-preview.html");
  writeFileSync(out, html, "utf8");
  console.log("OSNUTEK ZAPISAN:", out);
  console.log(`Prehodov skupaj: ${items.length} | na zemljevidu: ${points.length} | s kamero: ${items.filter((i) => i.cameras.length).length} | dvojnih kamer: ${items.filter((i) => i.cameras.length > 1).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
