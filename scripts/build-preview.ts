// Samostojen HTML osnutek (brez streznika): zdruzi zive BiH podatke (BIHAMK)
// z registrom vseh prehodov + gumbi za uradno kamero. Zagon: npm run preview
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
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
import { WAIT_HISTORY } from "../lib/wait-history";
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
  HR: "ðŸ‡­ðŸ‡·", RS: "ðŸ‡·ðŸ‡¸", ME: "ðŸ‡²ðŸ‡ª", SI: "ðŸ‡¸ðŸ‡®", MK: "ðŸ‡²ðŸ‡°", BA: "ðŸ‡§ðŸ‡¦", XK: "ðŸ‡½ðŸ‡°",
  HU: "ðŸ‡­ðŸ‡º", AT: "ðŸ‡¦ðŸ‡¹", IT: "ðŸ‡®ðŸ‡¹", AL: "ðŸ‡¦ðŸ‡±", BG: "ðŸ‡§ðŸ‡¬", RO: "ðŸ‡·ðŸ‡´", GR: "ðŸ‡¬ðŸ‡·",
};
const LEVEL_LABEL: Record<WaitLevel, string> = { none: "Brez", low: "Kratko", moderate: "Zmerno", high: "DaljÅ¡e", severe: "Dolgo", unknown: "Ni podatka" };
const NAME_FIX: Record<string, string> = { "rs-presevo": "PreÅ¡evo", "rs-horgos": "HorgoÅ¡", "me-bozaj": "BoÅ¾aj", "si-gruskovje": "GruÅ¡kovje", "ba-velika-kladusa": "Velika KladuÅ¡a" };

function nameFromId(id: string): string {
  if (NAME_FIX[id]) return NAME_FIX[id];
  return id.replace(/^[a-z]{2}-/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function waitText(min: number | null): string {
  if (min == null) return "ni podatka";
  if (min <= 0) return "brez zadrÅ¾evanja";
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
      level: "unknown", waitMinutes: null, rawStatus: "ÄŒakanje: ni podatka â€” preveri kamero / uradni vir.", hasLive: false,
    });
  }
  // Samostojne HAK kamere (brez ujemajocega prehoda) kot lastne tocke.
  for (const c of standaloneHakCameras()) {
    items.push({
      id: `hakcam-${c.k}`, name: c.name, country: "HR", neighbor: c.neighbor,
      lat: c.lat, lng: c.lng, cameras: [{ source: c.name, url: hakLink(c.k) }], streams: [],
      level: "unknown", waitMinutes: null, rawStatus: "Kamera HAK (Å¾iva slika na uradni strani).", hasLive: false,
    });
  }

  // Å½ive Äakalne dobe HAK/MUP (RH stran) â€” prepiÅ¡i/dopolni prehod, kjer je objavljeno.
  const hakWaitById = new Map(HAK_WAITS.filter((w) => w.id).map((w) => [w.id, w]));
  for (const it of items) {
    const w = hakWaitById.get(it.id);
    if (!w) continue;
    // BIHAMK praviloma poda zgornjo mejo za obe smeri. Ohranimo jo kot
    // rezervni podatek, Äe HAK za izbrano smer nima meritve.
    const bihamkFallbackWaitMin = it.hasLive ? it.waitMinutes : null;
    it.level = w.level as WaitLevel;
    it.waitMinutes = w.waitMinutes;
    const parts: string[] = [];
    const ulazTs = (w as { ulazTs?: string }).ulazTs || w.ts;
    const izlazTs = (w as { izlazTs?: string }).izlazTs || w.ts;
    if (w.ulazMin != null) parts.push(`vstop v HR ${w.ulazTxt}${ulazTs ? ` (${ulazTs})` : ""}`);
    if (w.izlazMin != null) parts.push(`izstop iz HR ${w.izlazTxt}${izlazTs ? ` (${izlazTs})` : ""}`);
    const dirAges = [
      (w as { ulazTsISO?: string }).ulazTsISO || w.tsISO,
      (w as { izlazTsISO?: string }).izlazTsISO || w.tsISO,
    ].filter(Boolean).map((iso) => Math.round((Date.now() - Date.parse(iso)) / 60000));
    const stale = dirAges.some((age) => age > 90) ? " Â· âš  vsaj ena smer je starejÅ¡a od 90 min" : "";
    it.rawStatus = `ðŸ‡­ðŸ‡· HAK/MUP: ${parts.join(", ")}${stale}`;
    // shrani za smer + zanesljivost (kasnejÅ¡e faze)
    (it as unknown as { hak: unknown }).hak = {
      ulazMin: w.ulazMin, izlazMin: w.izlazMin, ulazTxt: w.ulazTxt, izlazTxt: w.izlazTxt,
      truckUlazMin: (w as { truckUlazMin?: number | null }).truckUlazMin ?? null,
      truckIzlazMin: (w as { truckIzlazMin?: number | null }).truckIzlazMin ?? null,
      truckUlazTxt: (w as { truckUlazTxt?: string }).truckUlazTxt ?? "-",
      truckIzlazTxt: (w as { truckIzlazTxt?: string }).truckIzlazTxt ?? "-",
      bihamkFallbackWaitMin,
      ulazTsISO: (w as { ulazTsISO?: string }).ulazTsISO || w.tsISO,
      izlazTsISO: (w as { izlazTsISO?: string }).izlazTsISO || w.tsISO,
      tsISO: w.tsISO,
    };
  }

  // AMSS (Srbija) â€” DODATEN uradni vir; Äakanje uporabi le, Äe ni HAK/BIHAMK.
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
      it.rawStatus = `ðŸ‡·ðŸ‡¸ AMSS: ${p.join(", ")}`;
    }
  }

  // Novi most GradiÅ¡ka: HR stran se imenuje Gornji VaroÅ¡ â€” pokaÅ¾i oboje v poti/karticah.
  for (const it of items) if (it.id === "ba-gradiska") it.name = "Gornji VaroÅ¡â€“GradiÅ¡ka (novi most)";

  const counts: Record<WaitLevel, number> = { none: 0, low: 0, moderate: 0, high: 0, severe: 0, unknown: 0 };
  for (const it of items) counts[it.level]++;

  const points = items.filter((it) => it.lat != null && it.lng != null);

  // Direktne Å¾ive slike (AMS-RS + BIHAMK) pripni prehodu po ujemajoÄih koordinatah,
  // da se ob kliku na prehod slika pokaÅ¾e kar v oblaÄku (brez odpiranja spletne strani).
  const directCams = [
    ...AMSRS_CAMS.map((c) => ({ name: c.name, image: c.image, lat: c.lat, lng: c.lng })),
    ...BIHAMK_CAMS.filter((c) => c.lat != null && c.lng != null).map((c) => ({ name: c.name, image: c.image, lat: c.lat as number, lng: c.lng as number })),
  ];
  for (const p of points) {
    const coordImgs = directCams
      .filter((d) => Math.abs(d.lat - (p.lat as number)) < 0.03 && Math.abs(d.lng - (p.lng as number)) < 0.03)
      .map((d) => ({ name: d.name, url: d.image }));
    // HR stran (HAK): iz povezave kamere izluÅ¡Äi k=<id> -> direktne slike HAK_CAM_IMAGES.
    // 1. krog: po ena slika VSAKE kamere (da je vsaka zastopana); 2. krog: dodatne slike.
    const first: { name: string; url: string }[] = [...coordImgs];
    const rest: { name: string; url: string }[] = [];
    for (const cam of p.cameras || []) {
      const mk = /[?&]k=(\d+)/.exec(cam.url || "");
      if (!mk) continue;
      const imgs = HAK_CAM_IMAGES[Number(mk[1])];
      if (!imgs || !imgs.length) continue;
      first.push({ name: cam.source, url: imgs[0] });
      imgs.slice(1, 2).forEach((u) => rest.push({ name: cam.source + " Â· kam 2", url: u }));
    }
    const merged: { name: string; url: string }[] = [];
    const seen = new Set<string>();
    for (const im of [...first, ...rest]) {
      if (seen.has(im.url)) continue;
      seen.add(im.url);
      merged.push(im);
    }
    // Novi prehod GradiÅ¡ka: najprej obe HAK kameri z Gornjega VaroÅ¡a,
    // nato obe novi AMS-RS kameri; vse druge ohranijo obstojeÄi vrstni red.
    if (p.id === "ba-gradiska") {
      const cameraPriority = new Map<string, number>([
        ["https://m.hak.hr/cam.asp?id=1021", 0],
        ["https://m.hak.hr/cam.asp?id=1022", 1],
        ["https://gp.satwork.net/AMSRS_17_GP_CA02/slika.jpg", 2],
        ["https://gp.satwork.net/AMSRS_17_GP_CA01/slika.jpg", 3],
      ]);
      merged.sort((a, b) => (cameraPriority.get(a.url) ?? 100) - (cameraPriority.get(b.url) ?? 100));
    }
    (p as unknown as { images: { name: string; url: string }[] }).images = merged.slice(0, 10);
  }

  // Podatki o zivih tokovih (za vgrajeni HLS predvajalnik).
  const streamsData = Object.fromEntries(
    items.filter((i) => i.streams.length).map((i) => [i.id, { title: `${i.name} â€” AMSS v Å¾ivo`, streams: i.streams }])
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
  // Å½ive sliÄice kamer prehoda (za priljubljene kamere kar v zavihku Mejni prehodi).
  const cardCams = (imgs?: { name: string; url: string }[]) =>
    imgs && imgs.length
      ? `<div class="camgrid cardcams">${imgs.map((im) => `<a class="camshot" href="${im.url}" target="_blank" rel="noopener noreferrer" title="${esc(im.name)}"><img class="snap" data-base="${im.url}" src="${im.url}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(im.name)}"><span>${esc(im.name)}</span></a>`).join("")}</div>`
      : "";

  const camBtn = (cams: CameraLink[], streams: StreamLink[], id: string) => {
    const live = streams.length ? `<button class="cam live" onclick="openStream('${id}')">â–¶ AMSS v Å¾ivo</button>` : "";
    const links = cams.map((c) => `<a class="cam" href="${c.url}" target="_blank" rel="noopener noreferrer">ðŸ“· ${c.source} â†—</a>`).join("");
    return live || links ? `<div class="cams">${live}${links}</div>` : "";
  };

  const sections = groupArr.map((g) => `
    <section class="country-group" data-countries="${g.a} ${g.b}">
      <h2>${FLAG[g.a]} ${COUNTRY_NAMES[g.a]} â†” ${FLAG[g.b]} ${COUNTRY_NAMES[g.b]} <span class="cnt">${g.list.length}</span></h2>
      <div class="grid">
        ${[...g.list].sort((a, b) => (b.waitMinutes ?? -1) - (a.waitMinutes ?? -1)).map((it) => `
          <article class="card lvl-${it.level}">
            <div class="name">${it.name}<button class="cfav" data-cid="${it.id}" title="Dodaj med priljubljene prehode">â˜†</button></div>
            <div class="wait"><span class="badge b-${it.level}">${LEVEL_LABEL[it.level]}</span>${it.level === "unknown" || it.waitMinutes == null ? "" : `<span>ÄŒakanje: ${waitText(it.waitMinutes)}</span>`}</div>
            <div class="raw">${it.rawStatus}</div>
            ${cardCams((it as unknown as { images?: { name: string; url: string }[] }).images)}
            ${camBtn(it.cameras, it.streams, it.id)}
          </article>`).join("")}
      </div>
    </section>`).join("");

  // Prometne kamere po cestah (HAK avtoceste) â€” zlozljivo po avtocesti.
  const roadTotal = HAK_ROADS.reduce((s, g) => s + g.cams.length, 0);

  // HAK mejni prehodi (granicni prijelazi) â€” vedno odprta mreza slicic
  const hakBorderCams = HAK_CAMERAS.filter((c) => HAK_CAM_IMAGES[c.k] && HAK_CAM_IMAGES[c.k].length);
  const hakBorderHtml = `
    <section class="country-group" data-countries="HR">
      <h2>ðŸ‡­ðŸ‡· HAK â€” mejni prehodi <span class="cnt">${hakBorderCams.reduce((s, c) => s + HAK_CAM_IMAGES[c.k].length, 0)}</span> <span class="src">Â· vir: HAK (Å¾ive slike)</span></h2>
      <div class="camgrid">
        ${hakBorderCams.map((c) => { const arr = HAK_CAM_IMAGES[c.k]; const link = hakLink(c.k); const fl = FLAG[c.neighbor] || ""; return arr.map((img, i) => { const label = arr.length > 1 ? `${c.name} Â· kam ${i + 1}` : c.name; return `<a class="camshot" href="${link}" target="_blank" rel="noopener noreferrer" title="${esc(label)}"><img class="snap" data-base="${img}" src="${img}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(label)}"><span>${esc(label)} ${fl}</span></a>`; }).join(""); }).join("")}
      </div>
    </section>`;

  const roadsHtml = `
    <section class="country-group" data-countries="HR">
      <h2>ðŸ‡­ðŸ‡· Prometne kamere po cestah <span class="cnt">${roadTotal}</span> <span class="src">Â· vir: HAK (Å¾ive slike)</span></h2>
      ${HAK_ROADS.map((gr) => `
        <details class="roadgroup">
          <summary>${esc(gr.name)} <span class="cnt">${gr.cams.length}</span></summary>
          <div class="camgrid">
            ${gr.cams.map((c) => { const img = HAK_CAM_IMAGES[c.k] && HAK_CAM_IMAGES[c.k][0]; const link = hakRoadLink(gr.g, c.k); return img
              ? `<a class="camshot" href="${link}" target="_blank" rel="noopener noreferrer" title="${esc(c.name)}"><img class="snap" data-base="${img}" src="${img}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(c.name)}"><span>${esc(c.name)}</span></a>`
              : `<a class="camshot nolink" href="${link}" target="_blank" rel="noopener noreferrer"><span>ðŸ“· ${esc(c.name)} â†—</span></a>`; }).join("")}
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
      <h2>ðŸ‡·ðŸ‡¸ Cestne kamere <span class="cnt">${RS_ROAD_CAMS.length}</span> <span class="src">Â· vir: Putevi Srbije (Å¾ive slike)</span></h2>
      <div class="camgrid">
        ${RS_ROAD_CAMS.map((c) => `<a class="camshot" href="${c.poster}" target="_blank" rel="noopener noreferrer" title="${c.name}"><img class="snap" data-base="${c.poster}" src="${c.poster}" loading="lazy" referrerpolicy="no-referrer" alt="${c.name}"><span>${c.name}</span></a>`).join("")}
      </div>
    </section>`;

  // Slovenske kamere (NAP/DARS) â€” po regijah, zive slike.
  const siTotalCams = SI_CAMS.reduce((s, g) => s + g.cams.length, 0);
  const siByRegion: Record<string, typeof SI_CAMS> = {};
  for (const g of SI_CAMS) (siByRegion[g.region] ??= []).push(g);
  const siCamHtml = `
    <section class="country-group" data-countries="SI">
      <h2>ðŸ‡¸ðŸ‡® Cestne kamere <span class="cnt">${siTotalCams}</span> <span class="src">Â· vir: NAP/DARS (Å¾ive slike)</span></h2>
      ${Object.entries(siByRegion).map(([region, gs]) => `
        <details class="roadgroup">
          <summary>${esc(region)} <span class="cnt">${gs.reduce((s, g) => s + g.cams.length, 0)}</span></summary>
          <div class="camgrid">
            ${gs.flatMap((g) => g.cams).map((c) => `<a class="camshot" href="${c.image}" target="_blank" rel="noopener noreferrer" title="${esc(c.name)}"><img class="snap" data-base="${c.image}" src="${c.image}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(c.name)}"><span>${esc(c.name)}</span></a>`).join("")}
          </div>
        </details>`).join("")}
    </section>`;
  const siPoints = SI_CAMS.map((g) => ({ title: g.title, lat: g.lat, lng: g.lng, image: g.cams[0].image }));

  // AMSM kamere (S. Makedonija) â€” povezave (slike/koord ni)
  const amsmCamHtml = `
    <section class="country-group" data-countries="MK">
      <h2>ðŸ‡²ðŸ‡° Kamere <span class="cnt">${AMSM_CAMS.length}</span> <span class="src">Â· vir: AMSM / roads.org.mk</span></h2>
      <div class="camgrid">
        ${AMSM_CAMS.map((c) => `<a class="camshot nolink" href="${c.url}" target="_blank" rel="noopener noreferrer"><span>ðŸ“· ${esc(c.name)} â†—</span></a>`).join("")}
      </div>
    </section>`;

  // BIHAMK kamere (BiH) â€” zive slike
  const bihCamPoints = BIHAMK_CAMS.filter((c) => c.lat != null && c.lng != null);
  const bihCamHtml = `
    <section class="country-group" data-countries="BA">
      <h2>ðŸ‡§ðŸ‡¦ Kamere <span class="cnt">${BIHAMK_CAMS.length}</span> <span class="src">Â· vir: BIHAMK (Å¾ive slike)</span></h2>
      <div class="camgrid">
        ${BIHAMK_CAMS.map((c) => `<a class="camshot" href="${c.image}" target="_blank" rel="noopener noreferrer" title="${esc(c.name)}"><img class="snap" data-base="${c.image}" src="${c.image}" loading="lazy" referrerpolicy="no-referrer" alt="${esc(c.name)}"><span>${esc(c.name)}</span></a>`).join("")}
      </div>
    </section>`;

  // AMS-RS kamere mejnih prehodov (Republika Srpska / BiH) â€” zive slike
  const amsrsCamPoints = AMSRS_CAMS.filter((c) => c.lat != null && c.ln…40160 tokens truncated…">ðŸŸ¡ Alternativa: <b>'+alt.name+'</b> Â· '+mainWait(alt)+'</div>';
    if(av) h+='<div class="davoid">ðŸ”´ Izogni se: <b>'+av.name+'</b> Â· '+mainWait(av)+'</div>';
    h+='<div class="dactions">'
      +'<button class="dcam" style="background:#334155" onclick="enterDrive()">ðŸ”„ OsveÅ¾i</button>'
      +'<button class="dcam" style="background:#4338ca" onclick="speakDrive()">ðŸ”Š Preberi</button>'
      +(rec&&rec.lat!=null?'<a class="dcam" style="background:#0f766e;text-decoration:none;display:block;text-align:center" href="https://www.google.com/maps/dir/?api=1&destination='+rec.lat+','+rec.lng+'" target="_blank" rel="noopener noreferrer">ðŸ§­ Navigacija</a>':'')
      +'</div>';
    body.innerHTML=h; dm.style.display='flex';
    if(voiceOn()) setTimeout(speakDrive,400);
  };
  window.exitDrive=function(){ var dm=document.getElementById('driveMode'); if(dm)dm.style.display='none'; };
  function renderQuick(){
    var box=document.getElementById('quickRoutes'); if(!box) return;
    box.innerHTML=ROUTES.map(function(r){ return '<button class="qroute" onclick="selectRoute(\\''+r.id+'\\')">'+r.from+' â†’ '+r.to+'</button>'; }).join('');
  }
  window.selectRoute=function(id){ var pr=ROUTES.filter(function(r){return r.id===id;})[0]; if(!pr)return; REV=false; try{ localStorage.setItem('promet_lastroute',id); }catch(e){} var a=document.getElementById('mpFrom'),b=document.getElementById('mpTo'); if(a)a.value=pr.from; if(b)b.value=pr.to; showView('route'); renderRoute(pr); };
  window.checkRoute=function(){
    var a=(document.getElementById('mpFrom').value||'').trim(), b=(document.getElementById('mpTo').value||'').trim();
    var res=document.getElementById('routeResult');
    if(!a||!b){ res.style.display=''; res.innerHTML='<p class="meta">VpiÅ¡i izhodiÅ¡Äe in cilj.</p>'; return; }
    var pr=ROUTES.filter(function(r){return norm(r.from)===norm(a)&&norm(r.to)===norm(b);})[0];
    if(pr){ REV=false; renderRoute(pr); return; }
    var prR=ROUTES.filter(function(r){return norm(r.from)===norm(b)&&norm(r.to)===norm(a);})[0];
    if(prR){ REV=true; renderRoute(prR); return; }
    res.style.display=''; res.innerHTML='<h2>'+a+' â†’ '+b+'</h2><p class="meta">Za to pot Å¡e nimam presetov mejnih prehodov. Pot riÅ¡em na zemljeviduâ€¦</p>';
    var rf=document.getElementById('routeFrom'), rt=document.getElementById('routeTo'); if(rf)rf.value=a; if(rt)rt.value=b; calcRoute();
  };
  document.addEventListener('keydown',function(e){ if(e.key==='Enter'){ var t=e.target; if(t&&(t.id==='mpFrom'||t.id==='mpTo')) checkRoute(); } });
  // ---- vikend radar (tveganje glede na dan/uro/sezono) ----
  function weekendRadar(){
    var d=new Date(), day=d.getDay(), h=d.getHours(), mo=d.getMonth()+1, lvl=0, why=[];
    if(day===5 && h>=14 && h<20){ why.push('petek popoldne (proti HrvaÅ¡ki/BiH/Srbiji)'); lvl=2; }
    if(day===6 && h>=6 && h<12){ why.push('sobota dopoldne (proti morju)'); lvl=2; }
    if(day===0 && h>=15 && h<22){ why.push('nedeljski popoldanski povratek proti EU'); lvl=2; }
    if(mo>=6 && mo<=8){ why.push('turistiÄna sezona'); lvl=Math.max(lvl, lvl>=2?2:1); }
    return { lvl: lvl>=2?'visoko':(lvl===1?'srednje':'nizko'), why: why };
  }
  // ---- lokalni alarmi ----
  var AKEY='promet_alarms';
  function alarmsGet(){ try{ var a=JSON.parse(localStorage.getItem(AKEY)); if(a&&a.length) return a; }catch(e){} return [
    {crossing:'si-obrezje', min:45, label:'ObreÅ¾je nad 45 min'},
    {crossing:'hr-bajakovo', min:60, label:'Bajakovo nad 60 min'},
    {crossing:'si-karavanke', min:30, label:'Karavanke nad 30 min'}
  ]; }
  function checkAlarms(){ var fired=[]; alarmsGet().forEach(function(al){ var p=CBYID[al.crossing]; if(p&&p.waitMinutes!=null&&p.waitMinutes>al.min) fired.push(al.label+' â€” trenutno ~'+p.waitMinutes+' min'); }); return fired; }
  function renderBanner(){
    var box=document.getElementById('mpBanner'); if(!box) return;
    var html='';
    var wr=weekendRadar();
    var col=wr.lvl==='visoko'?'#dc2626':(wr.lvl==='srednje'?'#ca8a04':'#16a34a');
    html+='<div class="mpalert" style="border-left:5px solid '+col+'"><b>ðŸ“… Napoved tveganja: '+wr.lvl.toUpperCase()+'</b>'+(wr.why.length?'<br><span class="meta">Razlog: '+wr.why.join(' + ')+'</span>':'<br><span class="meta">Trenutno ni posebnih dejavnikov.</span>')+'</div>';
    var fired=checkAlarms();
    if(fired.length){ html+='<div class="mpalert" style="border-left:5px solid #dc2626"><b>ðŸ”” Alarmi</b><br><span class="meta">'+fired.join('<br>')+'</span></div>'; }
    box.innerHTML=html;
  }
  renderQuick(); renderBanner();
  // ob zagonu takoj pokazi decision dashboard za zadnjo/privzeto pot (brez klika)
  (function(){ var last='kamnik-banja-luka'; try{ last=localStorage.getItem('promet_lastroute')||last; }catch(e){}
    window._autoload=true; try{ selectRoute(last); }catch(e){} window._autoload=false; })();
})();

/* âš™ï¸ Nastavitve */
(function(){
  function flash(m){ var t=document.getElementById('toast'); if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t);} t.textContent=m; t.style.display='block'; clearTimeout(t._h); t._h=setTimeout(function(){t.style.display='none';},2600); }
  function loadVeh(){ var v; try{v=JSON.parse(localStorage.getItem('promet_vehicle'));}catch(e){} v=v||{name:'BMW X3 2.0d',cons:7.8,tank:67}; var n=document.getElementById('setVehName'),c=document.getElementById('setVehCons'),t=document.getElementById('setVehTank'); if(n)n.value=v.name; if(c)c.value=v.cons; if(t)t.value=v.tank; }
  window.saveVehicle=function(){ var v={name:(document.getElementById('setVehName').value||'Moje vozilo').slice(0,40), cons:parseFloat(document.getElementById('setVehCons').value)||7.8, tank:parseInt(document.getElementById('setVehTank').value,10)||60}; localStorage.setItem('promet_vehicle',JSON.stringify(v)); flash('Vozilo shranjeno.'); };
  function getAlarms(){ try{var a=JSON.parse(localStorage.getItem('promet_alarms')); if(a&&a.length)return a;}catch(e){} return [{crossing:'si-obrezje',min:45,label:'ObreÅ¾je'},{crossing:'hr-bajakovo',min:60,label:'Bajakovo'},{crossing:'si-karavanke',min:30,label:'Karavanke'}]; }
  function renderAlarms(){ var box=document.getElementById('setAlarms'); if(!box)return; var a=getAlarms(); box.innerHTML=a.map(function(al,i){ return '<div class="alrow"><span>'+al.label+'</span> prag: <input type="number" min="0" max="600" data-i="'+i+'" class="althr" value="'+al.min+'"> min</div>'; }).join('')+'<button class="cam" onclick="saveAlarms()" style="margin-top:8px">Shrani alarme</button> <button class="cam" onclick="enableAlarmNotify()" style="margin-top:8px">ðŸ”” Vklopi obvestila</button><p class="meta" style="margin-top:6px">Ko Äakanje na prehodu preseÅ¾e prag, dobiÅ¡ opozorilo v aplikaciji (in obvestilo, Äe ga vklopiÅ¡). Preverja se ob odprtju in vsake 3 min.</p>'; }
  window.saveAlarms=function(){ var a=getAlarms(); var inps=document.querySelectorAll('.althr'); for(var i=0;i<inps.length;i++){ var ix=+inps[i].getAttribute('data-i'); a[ix].min=parseInt(inps[i].value,10)||0; } localStorage.setItem('promet_alarms',JSON.stringify(a)); flash('Alarmi shranjeni.'); };
  function cnt(k){ try{var a=JSON.parse(localStorage.getItem(k)||'[]'); return a.length||0;}catch(e){return 0;} }
  function renderCounts(){ var box=document.getElementById('setCounts'); if(!box)return; box.innerHTML='Priljubljene kamere: <b>'+cnt('promet_favs')+'</b> Â· priljubljeni prehodi: <b>'+cnt('promet_fav_cross')+'</b> Â· moji vnosi Äakanja: <b>'+cnt('promet_manual')+'</b>'; }
  window.clearFavs=function(){ localStorage.removeItem('promet_favs'); localStorage.removeItem('promet_fav_cross'); renderCounts(); flash('Priljubljene poÄiÅ¡Äene (osveÅ¾i stran za prikaz).'); };
  window.clearManual=function(){ localStorage.removeItem('promet_manual'); renderCounts(); flash('Moji vnosi poÄiÅ¡Äeni.'); };
  function debugInfo(){
    var tom=(typeof TOMTOM_KEY!=='undefined'&&TOMTOM_KEY)?'kljuÄ vstavljen â€” domena mora biti na TomTom seznamu (brankotrivic-netizen.github.io/*)':'brez kljuÄa';
    var pts=(typeof PTS!=='undefined')?PTS.length:'?';
    var keys=Object.keys(localStorage).filter(function(k){return k.indexOf('promet_')===0;}).join(', ')||'(brez)';
    return 'Prehodov v podatkih: '+pts+'<br>TomTom prometni sloj: '+tom+'<br>localStorage kljuÄi: '+keys+'<br>Zaslon: '+window.innerWidth+'Ã—'+window.innerHeight+' px';
  }
  window.toggleDebug=function(cb){ localStorage.setItem('promet_debug', cb.checked?'1':'0'); var p=document.getElementById('debugPanel'); if(p){ p.style.display=cb.checked?'block':'none'; if(cb.checked)p.innerHTML=debugInfo(); } };
  window.resetAll=function(){ if(!confirm('PoÄistim vse osebne nastavitve v tej napravi (vozilo, priljubljene, vnose, alarme)?'))return; Object.keys(localStorage).filter(function(k){return k.indexOf('promet_')===0;}).forEach(function(k){localStorage.removeItem(k);}); location.reload(); };
  function fbGroups(){ try{ var a=JSON.parse(localStorage.getItem('promet_fbgroups')); if(a&&a.length) return a; }catch(e){} var old=localStorage.getItem('promet_fbgroup'); return old?[{name:'Moja FB skupina',url:old}]:[]; }
  function loadFb(){ var el=document.getElementById('setFbGroups'); if(el) el.value=fbGroups().map(function(g){return g.name&&g.name!==g.url?(g.name+' | '+g.url):g.url;}).join('\\n'); }
  window.saveFbGroups=function(){ var lines=(document.getElementById('setFbGroups').value||'').split('\\n'); var out=[]; lines.forEach(function(ln){ ln=ln.trim(); if(!ln)return; var parts=ln.split('|'); var name,url; if(parts.length>=2){ name=parts[0].trim(); url=parts.slice(1).join('|').trim(); } else { url=ln; name='FB skupina'; } if(/^https?:\\/\\//.test(url)) out.push({name:name.slice(0,40),url:url.slice(0,300)}); }); localStorage.setItem('promet_fbgroups',JSON.stringify(out)); localStorage.removeItem('promet_fbgroup'); flash('FB skupine shranjene ('+out.length+').'); };
  // zgodovina socialnih signalov
  var _pname={}; try{ (typeof PTS!=='undefined'?PTS:[]).forEach(function(p){ _pname[p.id]=p.name; }); }catch(e){}
  function socAll(){ try{ return JSON.parse(localStorage.getItem('promet_social')||'[]'); }catch(e){ return []; } }
  function agoTxt(iso){ var m=Math.round((Date.now()-Date.parse(iso))/60000); return m<1?'pravkar':(m<60?(m+' min nazaj'):(Math.round(m/60)+' h nazaj')); }
  window.renderSocial=function(){ var box=document.getElementById('setSocial'); if(!box)return; var a=socAll(); if(!a.length){ box.innerHTML='Ni socialnih signalov.'; return; }
    box.innerHTML=a.slice().reverse().map(function(s){ var i=a.indexOf(s); var fresh=(Date.now()-Date.parse(s.t))<3*3600*1000; return '<div class="alrow"><span>'+(fresh?'ðŸŸ¢':'âš«')+' <b>'+(_pname[s.id]||s.id)+'</b>: '+((s.text||'').replace(/</g,'&lt;').slice(0,60))+' <span style="color:#94a3b8">Â· '+agoTxt(s.t)+(s.source?' Â· '+s.source:'')+'</span></span><button class="cam" onclick="delSocial('+i+')">ðŸ—‘</button></div>'; }).join(''); };
  window.delSocial=function(i){ var a=socAll(); if(i>=0&&i<a.length){ a.splice(i,1); localStorage.setItem('promet_social',JSON.stringify(a)); renderSocial(); flash('Signal izbrisan.'); } };
  function loadAi(){ var el=document.getElementById('setAiEndpoint'); if(el){ try{ el.value=localStorage.getItem('promet_ai_endpoint')||''; }catch(e){} } }
  window.saveAiEndpoint=function(){ var v=(document.getElementById('setAiEndpoint').value||'').trim(); if(v&&!/^https?:\\/\\//.test(v)){ flash('Naslov mora biti veljaven URL (https://â€¦).'); return; } try{ if(v)localStorage.setItem('promet_ai_endpoint',v); else localStorage.removeItem('promet_ai_endpoint'); }catch(e){} flash(v?'AI endpoint shranjen.':'AI endpoint odstranjen.'); };
  loadVeh(); loadFb(); loadAi(); renderAlarms(); renderCounts(); renderSocial();
  (function(){ var v=document.getElementById('setVoice'); if(v){ try{ v.checked=localStorage.getItem('promet_voice')==='1'; }catch(e){} } })();
  var dbg=localStorage.getItem('promet_debug')==='1', dc=document.getElementById('setDebug'); if(dc){ dc.checked=dbg; if(dbg){ var dp=document.getElementById('debugPanel'); dp.style.display='block'; dp.innerHTML=debugInfo(); } }
})();
/* ===== PWA: namestitev na telefon + offline (service worker) ===== */
(function(){
  if('serviceWorker' in navigator){ window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }
  var deferred=null;
  var isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;
  var standalone=(window.navigator.standalone===true)||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);
  window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); deferred=e; var b=document.getElementById('installBtn'); if(b){ b.style.display='block'; b.textContent='â¬‡ï¸ Namesti na telefon'; } });
  window.doInstall=function(){
    if(deferred){ deferred.prompt(); deferred.userChoice.finally(function(){ deferred=null; var b=document.getElementById('installBtn'); if(b)b.style.display='none'; }); return; }
    if(isIOS){ showIosHelp(); return; }
    alert('Namestitev: v brskalniku odpri meni (â‹®) â†’ Â»Dodaj na zaÄetni zaslonÂ«.');
  };
  function showIosHelp(){ var m=document.getElementById('iosHelp'); if(m) m.style.display='flex'; }
  window.closeIosHelp=function(){ var m=document.getElementById('iosHelp'); if(m) m.style.display='none'; };
  // iOS: beforeinstallprompt ne obstaja -> pokaÅ¾i gumb + enkraten namig (razen ce je ze nameÅ¡Äeno)
  if(isIOS && !standalone){
    var b=document.getElementById('installBtn'); if(b){ b.style.display='block'; b.textContent='ðŸ“² Namesti na iPhone'; }
    try{ if(!localStorage.getItem('promet_ios_hint')){ localStorage.setItem('promet_ios_hint','1'); setTimeout(showIosHelp,1200); } }catch(e){}
  }
  window.addEventListener('appinstalled',function(){ var b=document.getElementById('installBtn'); if(b)b.style.display='none'; });
})();
</script></body></html>`;

  const out = resolve(process.cwd(), "osnutek-preview.html");
  writeFileSync(out, html, "utf8");

  // ---- PWA datoteke (kopira jih dist skripta v dist/) ----
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="34" fill="#2563eb"/><text x="96" y="130" font-size="112" text-anchor="middle">ðŸš¦</text></svg>`;
  writeFileSync(resolve(process.cwd(), "icon.svg"), icon, "utf8");

  // PNG ikone (iOS na zaÄetnem zaslonu potrebuje PNG, ne SVG) â€” narisan semafor na modrem.
  const crcTab: number[] = [];
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcTab[n] = c >>> 0; }
  const crc32 = (b: Buffer) => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = crcTab[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const pngChunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  };
  const iconPng = (S: number) => {
    const px = Buffer.alloc(S * S * 4);
    const put = (x: number, y: number, r: number, g: number, b: number, a: number) => { const i = (y * S + x) * 4; px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a; };
    const rad = S * 0.22, hr = S * 0.08;
    const hw = S * 0.36, hh = S * 0.62, hx = (S - hw) / 2, hy = (S - hh) / 2;
    const cx = S / 2, cr = S * 0.088;
    const cys = [hy + hh * 0.24, hy + hh * 0.5, hy + hh * 0.76];
    const inRound = (x: number, y: number, x0: number, y0: number, w: number, h: number, r: number) => {
      const nx = x < x0 + r ? x0 + r : x > x0 + w - r ? x0 + w - r : x, ny = y < y0 + r ? y0 + r : y > y0 + h - r ? y0 + h - r : y;
      const dx = x - nx, dy = y - ny; return dx * dx + dy * dy <= r * r;
    };
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      if (!inRound(x, y, 0, 0, S, S, rad)) { put(x, y, 0, 0, 0, 0); continue; }
      put(x, y, 37, 99, 235, 255); // modro ozadje
      if (inRound(x, y, hx, hy, hw, hh, hr)) put(x, y, 15, 23, 42, 255); // temno ohiÅ¡je
      const lights = [[239, 68, 68], [245, 158, 11], [34, 197, 94]];
      for (let li = 0; li < 3; li++) { const dx = x - cx, dy = y - cys[li]; if (dx * dx + dy * dy <= cr * cr) { const c = lights[li]; put(x, y, c[0], c[1], c[2], 255); } }
    }
    const raw = Buffer.alloc(S * (S * 4 + 1));
    for (let y = 0; y < S; y++) { raw[y * (S * 4 + 1)] = 0; px.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4); }
    const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 6;
    return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk("IHDR", ihdr), pngChunk("IDAT", deflateSync(raw)), pngChunk("IEND", Buffer.alloc(0))]);
  };
  writeFileSync(resolve(process.cwd(), "icon-180.png"), iconPng(180));
  writeFileSync(resolve(process.cwd(), "icon-192.png"), iconPng(192));
  writeFileSync(resolve(process.cwd(), "icon-512.png"), iconPng(512));

  const manifest = {
    name: "PrometInfo â€” mejni prehodi in kamere", short_name: "PrometInfo",
    description: "ÄŒakanje na mejnih prehodih, Å¾ive kamere in odloÄitveni asistent (bivÅ¡a Jugoslavija).",
    start_url: ".", scope: ".", display: "standalone", orientation: "portrait-primary",
    background_color: "#eef2f7", theme_color: "#2563eb", lang: "sl",
    icons: [
      { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
  writeFileSync(resolve(process.cwd(), "manifest.webmanifest"), JSON.stringify(manifest, null, 2), "utf8");
  // Service worker: network-first za navigacijo (offline fallback na predpomnjeni index),
  // ostalo (slike kamer, tiles, API) gre mimo predpomnilnika (vedno sveÅ¾e / brez balasta).
  const sw = `var CACHE='prometinfo-v2';
self.addEventListener('install',function(e){ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png']); }).catch(function(){})); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ if(k!==CACHE) return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch',function(e){ var req=e.request; if(req.method!=='GET') return;
  if(req.mode==='navigate'){ e.respondWith(fetch(req).then(function(r){ caches.open(CACHE).then(function(c){ c.put('./index.html', r.clone()); }); return r; }).catch(function(){ return caches.match('./index.html'); })); return; }
  var u=new URL(req.url);
  if(u.origin===location.origin && /\\.(webmanifest|svg)$/.test(u.pathname)){ e.respondWith(caches.match(req).then(function(m){ return m||fetch(req); })); }
});`;
  writeFileSync(resolve(process.cwd(), "sw.js"), sw, "utf8");

  console.log("OSNUTEK ZAPISAN:", out, "(+ manifest.webmanifest, sw.js, icon.svg)");
  console.log(`Prehodov skupaj: ${items.length} | na zemljevidu: ${points.length} | s kamero: ${items.filter((i) => i.cameras.length).length} | dvojnih kamer: ${items.filter((i) => i.cameras.length > 1).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

