// Samostojen HTML osnutek (brez streznika): zdruzi zive BiH podatke (BIHAMK)
// z registrom vseh prehodov + gumbi za uradno kamero. Zagon: npm run preview
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { scrapeAll } from "../lib/scrapers";
import { allCrossings } from "../lib/crossings";
import { standaloneHakCameras, hakLink } from "../lib/hak-cameras";
import { amssStreamsForCrossing, type StreamLink } from "../lib/amss-cameras";
import { HAK_ROADS, hakRoadLink } from "../lib/hak-road-cameras";
import { HAK_CAM_IMAGES } from "../lib/hak-cam-images";
import { RS_ROAD_CAMS } from "../lib/rs-road-cameras";
import { SI_CAMS } from "../lib/si-road-cameras";
import { BIHAMK_CAMS } from "../lib/bihamk-cameras";
import { AMSRS_CAMS } from "../lib/amsrs-cameras";
import { AMSM_CAMS } from "../lib/amsm-cameras";
import { AI_CONGESTION } from "../lib/ai-congestion";
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
      level: "unknown", waitMinutes: null, rawStatus: "Lokacija + kamera (žive čakalne dobe v pripravi).", hasLive: false,
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

    // AI ocena gnece (Claude vision) — pripni vse kamere prehoda (po crId; obe strani).
    const pid = (p as unknown as { id: string }).id;
    let aiHits = AI_CONGESTION
      .filter((a) => a.crId === pid)
      .sort((a, b) => a.enter.localeCompare(b.enter) || a.side.localeCompare(b.side));
    // skrij prazne "smer neznana" (nejasne kamere), ce so na voljo uporabne ocene
    const useful = aiHits.filter((a) => a.enter !== "neznano" || a.level !== "prosto");
    if (useful.length) aiHits = useful;
    if (aiHits.length) {
      (p as unknown as { aiCams: unknown[] }).aiCams = aiHits.map((a) => ({
        enter: a.enter, dirLabel: a.dirLabel, level: a.level, extent: a.extent, lanes: a.lanes,
        note: a.note, readable: a.readable, ts: a.ts, image: a.image, cam: a.crossing,
      }));
    }
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
            <div class="name">${it.name}</div>
            <div class="wait"><span class="badge b-${it.level}">${LEVEL_LABEL[it.level]}</span><span>${waitText(it.waitMinutes)}</span></div>
            <div class="raw">${it.rawStatus}</div>
            ${camBtn(it.cameras, it.streams, it.id)}
          </article>`).join("")}
      </div>
    </section>`).join("");

  // Prometne kamere po cestah (HAK avtoceste) — zlozljivo po avtocesti.
  const esc = (s: string) => String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const roadTotal = HAK_ROADS.reduce((s, g) => s + g.cams.length, 0);
  const roadsHtml = `
    <section class="country-group" data-countries="HR">
      <h2>🇭🇷 Prometne kamere po cestah <span class="cnt">${roadTotal}</span> <span class="src">· vir: HAK (žive slike)</span></h2>
      ${HAK_ROADS.map((gr) => `
        <details class="roadgroup" open>
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
  const reportsHtml = `
    <section class="country-group">
      <h2>📰 Prometna poročila <span class="src">· uradni viri</span></h2>
      <details open class="roadgroup"><summary>🇭🇷 Hrvaška — HAK <span class="cnt">${HAK_REPORTS.length}</span></summary>
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
.favhint{margin:4px 0 0}
.campin{font-size:15px;line-height:20px;text-align:center;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}
.carina{position:relative;width:38px;height:38px}
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
 .tabs{flex-wrap:wrap;gap:2px}
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
.aibadge{margin:8px 0 4px;padding:6px 8px;background:#f8fafc;border-radius:6px;line-height:1.35}
.aitag{font-size:10px;font-weight:700;letter-spacing:.4px;color:#6366f1;text-transform:uppercase}
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
  <button class="tab active" onclick="showView('map',this)">🗺️ Zemljevid</button>
  <button class="tab" onclick="showView('borders',this)">🚧 Mejni prehodi</button>
  <button class="tab" onclick="showView('cams',this)">📷 Kamere</button>
  <button class="tab" onclick="showView('reports',this)">📰 Poročila</button>
  <button class="tab" onclick="showView('truck',this)">🚛 Tovornjaki</button>
  <button class="tab" onclick="showView('fuel',this)">⛽ Gorivo</button>
</div>
<div class="view" id="view-map">
<div id="map"></div>
<div id="zoomHint" class="zoomhint">🔍 Približaj zemljevid za prikaz kamer</div>
<div class="legend"><span><i class="dot b-none"></i>brez</span><span><i class="dot b-low"></i>do 30 min</span><span><i class="dot b-moderate"></i>do 1 h</span><span><i class="dot b-high"></i>do 2 h</span><span><i class="dot b-severe"></i>nad 2 h</span><span><i class="dot b-unknown"></i>kamera/ni podatka</span><span><i class="dot" style="background:#3b82f6"></i>cestna kamera</span><label style="margin-left:auto;cursor:pointer"><input type="checkbox" id="crossingToggle" checked onchange="toggleCrossings(this)"> 🚧 prehodi</label><label style="cursor:pointer"><input type="checkbox" id="roadToggle" checked onchange="toggleRoads(this)"> 📷 kamere</label><label style="cursor:pointer"><input type="checkbox" id="trafficToggle" checked onchange="toggleTraffic(this)"> 🚦 gostota prometa</label><label style="cursor:pointer"><input type="checkbox" id="truckToggle" onchange="toggleTruckPark(this)"> 🅿️ parkirišča</label></div>
</div>
<div class="view" id="view-borders" style="display:none">
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
<div id="camModal" class="modal" onclick="if(event.target===this)closeCam()">
  <div class="modalbox">
    <div class="modalhead"><span id="camTitle"></span><button onclick="closeCam()">✕</button></div>
    <div style="text-align:center"><span id="camWrap" style="position:relative;display:inline-block;max-width:100%"><img id="camBig" referrerpolicy="no-referrer" alt=""><svg id="camZones" viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none"></svg></span></div>
    <div id="camZoneLegend" style="display:none;font-size:12px;margin-top:6px;line-height:1.5"><b>Vodilo (Gornji Varoš):</b> <span style="color:#16a34a">▬ zelena</span> = ni gužve · <span style="color:#ca8a04">▬ rumena</span> = zmerna · <span style="color:#dc2626">▬ rdeča</span> = gužva. Kolona čez črto = ta nivo.</div>
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
const AIIMG=${JSON.stringify(Object.fromEntries(AI_CONGESTION.map((a) => [a.image, { dirLabel: a.dirLabel, level: a.level, extent: a.extent, lanes: a.lanes, note: a.note, readable: a.readable, ts: a.ts }])))};
const AISEARCH=${JSON.stringify(AI_CONGESTION.map((a) => ({ name: a.crossing, img: a.image, lat: a.lat, lng: a.lng })))};
const map=L.map('map',{scrollWheelZoom:true,zoomSnap:0.5,zoomDelta:0.5,wheelPxPerZoomLevel:90}).setView([45.0,16.6],6);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{attribution:'© OpenStreetMap, © CARTO',maxZoom:20}).addTo(map);
try{ L.geoJSON(BORDERS,{interactive:false,style:{color:'#475569',weight:1.2,opacity:0.7,fill:false,dashArray:'5 4'}}).addTo(map); }catch(e){}
const crossingLayer=L.layerGroup().addTo(map);
function crossingIcon(level){ return L.divIcon({className:'carinadiv',html:'<div class="carina"><div class="csign">CARINA<span>DOUANE</span></div><span class="cdot cd-'+level+'"></span></div>',iconSize:[38,38],iconAnchor:[19,19]}); }
const MARKERS=[];
function aiAgo(ts){ try{ var d=(Date.now()-new Date(ts).getTime())/60000; if(d<1)return 'pravkar'; if(d<60)return Math.round(d)+' min nazaj'; var h=d/60; if(h<24)return Math.round(h)+' h nazaj'; return Math.round(h/24)+' dni nazaj'; }catch(e){return '';} }
var AIM={prosto:['🟢','Prosto','#16a34a'],zmerno:['🟡','Zmerno','#ca8a04'],gneca:['🟠','Gneča','#ea580c'],zastoj:['🔴','Zastoj','#dc2626'],neznano:['⚪','Neznano','#64748b']};
var AIEXT={brez:'brez kolone',kratka:'kratka kolona',srednja:'srednja kolona',dolga:'dolga kolona'};
function aiRow(a){ var m=AIM[a.level]||AIM.neznano;
 var dir=a.dirLabel?'<span style="font-size:11px;font-weight:600;color:#334155">▸ '+a.dirLabel+'</span> ':'';
 var parts=[]; if(a.extent&&AIEXT[a.extent])parts.push(AIEXT[a.extent]); if(a.lanes!=null&&a.lanes>0)parts.push(a.lanes+(a.lanes===1?' kolona':(a.lanes<5?' kolone':' kolon')));
 var ext=parts.length?' <span style="font-size:12px;color:#475569">· '+parts.join(' · ')+'</span>':'';
 var camlbl=a.cam?'<br><span style="font-size:10px;color:#94a3b8">📷 '+a.cam+'</span>':'';
 var note=a.note?'<br><span style="font-size:11px;color:#64748b">'+a.note+'</span>':'';
 var warn=a.readable===false?' <span style="font-size:10px;color:#b45309">⚠ slabo vidno</span>':'';
 return '<div style="margin:3px 0;padding-left:7px;border-left:3px solid '+m[2]+'">'+dir+'<b style="color:'+m[2]+'">'+m[0]+' '+m[1]+'</b>'+ext+warn+note+camlbl+'</div>';
}
function aiOne(url){ var a=AIIMG[url]; return a?'<div class="aibadge" style="margin-top:6px">'+'<span class="aitag">🤖 AI ocena gneče</span>'+aiRow(a)+'<span style="font-size:10px;color:#94a3b8">'+aiAgo(a.ts)+' · približek iz slike, brez parkiranih</span></div>':''; }
function aiHtml(cams){ if(!cams||!cams.length)return '';
 var rows=cams.map(aiRow).join('');
 var ts=cams[0]?aiAgo(cams[0].ts):'';
 return '<div class="aibadge"><span class="aitag">🤖 AI ocena gneče (kolona proti rampi)</span>'+rows+'<span style="font-size:10px;color:#94a3b8">'+ts+' · približek iz slike, brez parkiranih</span></div>';
}
PTS.forEach(p=>{const cam=(p.cameras&&p.cameras.length)?'<br><span class="popsrc">uradni vir: '+p.cameras.map(c=>'<a href="'+c.url+'" target="_blank" rel="noopener noreferrer">'+c.source+' ↗</a>').join(' · ')+'</span>':'';
 var imgs=(p.images&&p.images.length)?'<div class="popcams">'+p.images.map(function(u){return '<img class="popcam snap" src="'+u.url+'" data-base="'+u.url+'" data-name="'+u.name+'" referrerpolicy="no-referrer" alt="'+u.name+'" title="'+u.name+'">';}).join('')+'</div>':'';
 const live=(p.streams&&p.streams.length)?'<br><b style="cursor:pointer;color:#c0392b" onclick="openStream(\\''+p.id+'\\')">▶ AMSS v živo</b>':'';
 var aiBadge=aiHtml(p.aiCams);
 const mk=L.marker([p.lat,p.lng],{icon:crossingIcon(p.level)})
 .bindTooltip('<b>'+p.name+'</b> '+FLAGJS[p.country]+'↔'+FLAGJS[p.neighbor])
 .bindPopup('<b>'+FLAGJS[p.country]+' '+p.name+' → '+FLAGJS[p.neighbor]+'</b><br>'+(p.waitMinutes==null?'čakanje: ni podatka':(p.waitMinutes<=0?'brez zadrževanja':'~'+p.waitMinutes+' min'))+'<br><small>'+p.rawStatus+'</small>'+aiBadge+imgs+cam+live,{maxWidth:280});
 mk.addTo(crossingLayer); MARKERS.push({mk:mk, cs:[p.country,p.neighbor], name:p.name, lat:p.lat, lng:p.lng});
});
document.addEventListener('click',function(e){ var t=e.target; if(t&&t.classList&&t.classList.contains('popcam')){ e.preventDefault(); openCam(t.getAttribute('data-base'), t.getAttribute('data-name')); } });
const camIcon=L.divIcon({className:'camdiv',html:'<div class="campin">📷</div>',iconSize:[20,20],iconAnchor:[10,10]});
const camCluster=L.layerGroup();
const CAMS=[];
function addCam(lat,lng,country,name,popupHtml,image,road){ var m=L.marker([lat,lng],{icon:camIcon}).bindTooltip('📷 '+name).bindPopup(popupHtml); CAMS.push({m:m,country:country,name:name,lat:lat,lng:lng,image:image||'',road:road||''}); }
ROADPTS.forEach(function(p){ var im=p.image?'<br><img src="'+p.image+'" referrerpolicy="no-referrer" style="width:240px;border-radius:6px;margin-top:4px">':''; addCam(p.lat,p.lng,'HR',p.name,'<b>📷 '+p.name+'</b><br><small>'+p.road+'</small>'+im+'<br><a href="'+p.url+'" target="_blank" rel="noopener noreferrer">odpri na HAK ↗</a>',p.image,p.road); });
RSROADPTS.forEach(function(p){ addCam(p.lat,p.lng,'RS',p.name,'<b>📷 '+p.name+'</b><br><img src="'+p.poster+'" referrerpolicy="no-referrer" style="width:240px;border-radius:6px;margin-top:4px"><br><small>Putevi Srbije</small>',p.poster); });
SIPTS.forEach(function(p){ addCam(p.lat,p.lng,'SI',p.title,'<b>📷 '+p.title+'</b><br><img src="'+p.image+'" referrerpolicy="no-referrer" style="width:240px;border-radius:6px;margin-top:4px"><br><small>DARS</small>',p.image); });
BIHCAMPTS.forEach(function(p){ addCam(p.lat,p.lng,'BA',p.name,'<b>📷 '+p.name+'</b><br><img src="'+p.image+'" referrerpolicy="no-referrer" style="width:240px;border-radius:6px;margin-top:4px"><br><small>BIHAMK</small>'+aiOne(p.image),p.image); });
AMSRSCAMPTS.forEach(function(p){ addCam(p.lat,p.lng,'BA',p.name,'<b>📷 '+p.name+'</b><br><img src="'+p.image+'" referrerpolicy="no-referrer" style="width:240px;border-radius:6px;margin-top:4px"><br><small>AMS-RS</small>'+aiOne(p.image),p.image); });
camCluster.addTo(map);
var _filter='all';
var CAM_MIN_ZOOM=9;
function rebuildCams(){ camCluster.clearLayers(); var rt=document.getElementById('roadToggle'); if(rt&&!rt.checked){ updateZoomHint(); return; } if(_filter==='all' && map.getZoom()<CAM_MIN_ZOOM){ updateZoomHint(); return; } var arr=[]; CAMS.forEach(function(o){ if(_filter==='all'||_filter===o.country) arr.push(o.m); }); if(camCluster.addLayers){camCluster.addLayers(arr);}else{arr.forEach(function(m){camCluster.addLayer(m);});} updateZoomHint(); }
function updateZoomHint(){ var el=document.getElementById('zoomHint'); if(!el) return; var rt=document.getElementById('roadToggle'); el.style.display=(_filter==='all'&&rt&&rt.checked&&map.getZoom()<CAM_MIN_ZOOM)?'block':'none'; }
function toggleRoads(cb){ rebuildCams(); }
function toggleCrossings(cb){ if(cb.checked) crossingLayer.addTo(map); else map.removeLayer(crossingLayer); }
function filterCountry(c, btn){
 _filter=c;
 var chips=document.querySelectorAll('.ctile'); for(var i=0;i<chips.length;i++) chips[i].classList.remove('active');
 if(btn) btn.classList.add('active');
 var secs=document.querySelectorAll('.country-group[data-countries]');
 for(var j=0;j<secs.length;j++){ var cs=(secs[j].getAttribute('data-countries')||'').split(' '); secs[j].style.display=(c==='all'||cs.indexOf(c)>=0)?'':'none'; }
 MARKERS.forEach(function(o){ var show=(c==='all'||o.cs.indexOf(c)>=0); if(show){o.mk.addTo(crossingLayer);}else{crossingLayer.removeLayer(o.mk);} });
 var mapTab=document.querySelector('.tab'); showView('map', mapTab);
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
// AI-kamere, ki niso samostojne tocke (npr. Gornji Varos, Stara Gradiska) -> v iskanje
AISEARCH.forEach(function(a){ if(a.img && !_imgseen[a.img]){ _imgseen[a.img]=1; SEARCH.push({name:a.name,lat:a.lat,lng:a.lng,t:'📷',kind:'cam',img:a.img}); } });
SEARCH.forEach(function(s,i){ s.id=i; s._n=nrm(s.name); });
function doSearch(q){ var nq=nrm(q); var box=document.getElementById('searchResults'); if(!box) return; if(!nq){box.style.display='none';box.innerHTML='';return;}
 var hits=SEARCH.filter(function(s){return s._n.indexOf(nq)>=0;});
 hits.sort(function(a,b){ return (a._n.indexOf(nq)) - (b._n.indexOf(nq)); }); // zadetki na zacetku imena prej
 hits=hits.slice(0,10);
 box.innerHTML=hits.length?hits.map(function(h){return '<div class="sr" onmousedown="gotoHit('+h.id+')">'+h.t+' '+h.name+'</div>';}).join(''):'<div class="sr" style="color:#94a3b8">ni zadetkov</div>';
 box.style.display='block'; }
function gotoHit(i){ var s=SEARCH[i]; if(!s) return; var box=document.getElementById('searchResults'); if(box)box.style.display='none'; var inp=document.getElementById('search'); if(inp)inp.value='';
 if(s.kind==='cam' && s.img){ openCam(s.img, s.name); return; }
 showView('map', document.querySelectorAll('.tab')[0]);
 setTimeout(function(){ try{ map.invalidateSize(); map.setView([s.lat,s.lng],12); if(s.mk) s.mk.openPopup(); }catch(e){} }, 140); }
function gotoPoint(lat,lng){ map.setView([lat,lng],13); var b=document.getElementById('searchResults'); if(b)b.style.display='none'; var s=document.getElementById('search'); if(s)s.value=''; }
var truckPark=L.layerGroup();
var truckIcon=L.divIcon({className:'tpdiv',html:'🅿️',iconSize:[18,18],iconAnchor:[9,9]});
function rebuildTruckPark(){ truckPark.clearLayers(); var tb=document.getElementById('truckToggle'); if(!tb||!tb.checked||map.getZoom()<CAM_MIN_ZOOM) return; TRUCKPTS.forEach(function(p){ truckPark.addLayer(L.marker([p.lat,p.lng],{icon:truckIcon}).bindTooltip('🅿️ '+p.name).bindPopup('<b>🅿️ '+p.name+'</b><br><small>'+p.type+'</small>')); }); }
function toggleTruckPark(cb){ if(cb.checked){truckPark.addTo(map);} else {map.removeLayer(truckPark);} rebuildTruckPark(); }
truckPark.addTo(map);
rebuildCams();
map.on('zoomend', function(){ rebuildCams(); rebuildTruckPark(); });
var TOMTOM_KEY='F4bmVyCwlAC8AYfwKDndl4iLAvCAhFh1';
var trafficLayer=null;
function toggleTraffic(cb){
 if(!TOMTOM_KEY){ cb.checked=false; alert('Za prikaz gostote prometa (kot Google Maps) rabiš brezplačen TomTom API ključ z developer.tomtom.com. Ko ga dobiš, ga vstaviva v aplikacijo in se ceste obarvajo.'); return; }
 if(cb.checked){ if(!trafficLayer){ trafficLayer=L.tileLayer('https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key='+TOMTOM_KEY,{opacity:0.75,maxZoom:22,crossOrigin:true}); } trafficLayer.addTo(map); }
 else if(trafficLayer){ map.removeLayer(trafficLayer); }
}
function showView(v, btn){
 var tabs=document.querySelectorAll('.tab'); for(var i=0;i<tabs.length;i++) tabs[i].classList.remove('active');
 if(btn) btn.classList.add('active');
 document.getElementById('view-map').style.display=(v==='map')?'':'none';
 document.getElementById('view-borders').style.display=(v==='borders')?'':'none';
 document.getElementById('view-cams').style.display=(v==='cams')?'':'none';
 document.getElementById('view-reports').style.display=(v==='reports')?'':'none';
 document.getElementById('view-truck').style.display=(v==='truck')?'':'none';
 document.getElementById('view-fuel').style.display=(v==='fuel')?'':'none';
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
function favRebuild(){ var grid=document.getElementById('favGrid'); if(!grid) return; grid.innerHTML=''; var seen={}; var list=document.querySelectorAll('#view-cams .camgrid:not(#favGrid) .camshot'); for(var i=0;i<list.length;i++){ var a=list[i]; var k=camKey(a); if(!k||!FAVS.has(k)||seen[k]) continue; seen[k]=1; var c=a.cloneNode(true); var ob=c.querySelector('.favbtn'); if(ob)ob.parentNode.removeChild(ob); c.appendChild(favBtn(k,true)); grid.appendChild(c); } var n=grid.children.length; var cnt=document.getElementById('favCnt'); if(cnt)cnt.textContent=n; var hint=document.getElementById('favHint'); if(hint)hint.style.display=n?'none':''; }
function favToggle(k){ if(FAVS.has(k))FAVS.delete(k); else FAVS.add(k); favSave(); favSync(); favRebuild(); }
var _camTimer=null;
function camBust(u){ return u+(u.indexOf('?')>=0?'&':'?')+'t='+Date.now(); }
// referencne crte (vodilo gneca) po sliki kamere; koordinate v % (0-100)
var GVZONES={
 'https://m.hak.hr/cam.asp?id=1022':[['#16a34a','18,46 30,42 44,47'],['#ca8a04','33,36 50,33'],['#dc2626','47,30 57,30']],
 'https://m.hak.hr/cam.asp?id=1021':[['#16a34a','26,46 40,44 55,46'],['#ca8a04','42,40 56,38'],['#dc2626','48,36 57,36']]
};
function drawZones(img){ var svg=document.getElementById('camZones'); var leg=document.getElementById('camZoneLegend'); var z=GVZONES[img];
 if(!z){ svg.style.display='none'; leg.style.display='none'; svg.innerHTML=''; return; }
 svg.innerHTML=z.map(function(l){ return '<polyline points="'+l[1]+'" fill="none" stroke="'+l[0]+'" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:3px"/>'; }).join('');
 svg.style.display='block'; leg.style.display='block';
}
function openCam(img,title){ if(!img)return; var m=document.getElementById('camModal'); document.getElementById('camTitle').textContent=title||'Kamera'; var big=document.getElementById('camBig'); big.src=img; var op=document.getElementById('camOpen'); if(op)op.href=img; drawZones(img); m.style.display='flex'; if(_camTimer)clearInterval(_camTimer); _camTimer=setInterval(function(){ big.src=camBust(img); },15000); }
function closeCam(){ var m=document.getElementById('camModal'); if(m)m.style.display='none'; if(_camTimer){clearInterval(_camTimer);_camTimer=null;} var big=document.getElementById('camBig'); if(big)big.src=''; var svg=document.getElementById('camZones'); if(svg){svg.style.display='none';svg.innerHTML='';} }
document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeCam(); });
(function favInit(){ var view=document.getElementById('view-cams'); if(!view) return; var list=view.querySelectorAll('.camgrid:not(#favGrid) .camshot'); for(var i=0;i<list.length;i++){ var a=list[i]; var k=camKey(a); if(!k) continue; if(!a.querySelector('.favbtn')) a.appendChild(favBtn(k,FAVS.has(k))); } view.addEventListener('click',function(e){ var t=e.target; var b=(t&&t.classList&&t.classList.contains('favbtn'))?t:(t&&t.closest?t.closest('.favbtn'):null); if(b){ e.preventDefault(); e.stopPropagation(); favToggle(b.getAttribute('data-k')); return; } var a=t&&t.closest?t.closest('.camshot'):null; if(a){ var im=a.querySelector('img.snap'); if(im){ e.preventDefault(); var nm=a.getAttribute('title')||(a.querySelector('span')?a.querySelector('span').textContent:''); openCam(im.getAttribute('data-base')||im.src, nm); } } }); favRebuild(); })();
setInterval(function(){ document.querySelectorAll('img.snap').forEach(function(im){ var b=im.getAttribute('data-base'); if(b) im.src=b+(b.indexOf('?')>=0?'&':'?')+'t='+Date.now(); }); }, 60000);
</script></body></html>`;

  const out = resolve(process.cwd(), "osnutek-preview.html");
  writeFileSync(out, html, "utf8");
  console.log("OSNUTEK ZAPISAN:", out);
  console.log(`Prehodov skupaj: ${items.length} | na zemljevidu: ${points.length} | s kamero: ${items.filter((i) => i.cameras.length).length} | dvojnih kamer: ${items.filter((i) => i.cameras.length > 1).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
