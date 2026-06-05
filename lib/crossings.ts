import type { Country, CameraLink } from "./types";
import { hakCamerasForCrossing } from "./hak-cameras";
import { amssCamerasForCrossing } from "./amss-cameras";

/**
 * Register mejnih prehodov: ID (slug) -> drzava, sosednja drzava, priblizne
 * koordinate. cameraUrl (uradna stran z zivo kamero) se izracuna iz drzav.
 * Koordinate so PRIBLIZNE (osnutek). ID-ji se ujemajo s scraperji (npr. "ba-izacic").
 */
export interface CrossingDef {
  country: Country;
  neighbor: Country;
  lat: number;
  lng: number;
}
export interface CrossingMeta extends CrossingDef {
  cameras: CameraLink[];
}

/** Uradne (splosne) kamerne strani po drzavi vira + oznaka. */
const SRC_CAM: Partial<Record<Country, { source: string; url: string }>> = {
  SI: { source: "promet.si", url: "https://www.promet.si/sl/kamere" },
  HR: { source: "HAK", url: "https://m.hak.hr/kamera.asp?g=2" },
  RS: { source: "AMSS", url: "https://kamere.amss.org.rs/" },
  BA: { source: "BIHAMK", url: "https://bihamk.ba/spi/stanje-na-cesti-u-bih" },
  ME: { source: "AMSCG", url: "https://amscg.org/granicni-prelazi/" },
  MK: { source: "roads.org.mk", url: "https://roads.org.mk/patna-mreza/video-kameri/" },
};

/** Splosna kamerna stran kot zasilna resitev, ce ni globoke povezave. */
function fallbackCam(country: Country, neighbor: Country): CameraLink | null {
  const order: Country[] = ["HR", "SI", "RS", "BA", "ME", "MK"];
  for (const c of order) {
    if ([country, neighbor].includes(c) && SRC_CAM[c]) return { ...SRC_CAM[c]! };
  }
  return null;
}

/**
 * HAK globoke povezave (m.hak.hr/kamera.asp?g=2&k=<id>) so v lib/hak-cameras.ts
 * (popoln register vseh ~36 mejnih kamer); tu jih le pripenjamo prehodom.
 *
 * AMS-RS (Auto-moto savez Republike Srpske) — kamere na strani BiH/RS entitete.
 * Stran na prehod: ams-rs.com/granicni-prelaz-<ime>/. Pri marsikaterem prehodu
 * tako dobimo OBE strani meje (HAK = HR stran, AMS-RS = BiH stran).
 */
const AMSRS = (slug: string) => `https://ams-rs.com/granicni-prelaz-${slug}/`;
const AMSRS_DEEPLINK: Record<string, string> = {
  "ba-gradiska": AMSRS("gradiska"),
  "ba-gradina": AMSRS("gradina-gradina-donja"),
  "ba-raca": AMSRS("raca"),
  "ba-zupci": AMSRS("zupci"),
  "ba-brod": AMSRS("brod"),
  "ba-sepak": AMSRS("sepak"),
  "ba-karakaj": AMSRS("karakaj"),
  "ba-kozarska-dubica": AMSRS("kozarska-dubica"),
  "ba-novi-grad": AMSRS("novi-grad"),
  "ba-kostajnica": AMSRS("kostajnica"),
  "ba-klobuk": AMSRS("klobuk"),
  "ba-hum": AMSRS("hum"),
  "ba-svilaj": AMSRS("svilaj"),
  "ba-samac": AMSRS("samac"),
};

export const CROSSINGS: Record<string, CrossingDef> = {
  // ===== BiH <-> Hrvaska =====
  "ba-velika-kladusa": { country: "BA", neighbor: "HR", lat: 45.18, lng: 15.81 },
  "ba-izacic": { country: "BA", neighbor: "HR", lat: 44.85, lng: 15.78 },
  "ba-ripac": { country: "BA", neighbor: "HR", lat: 44.74, lng: 15.83 },
  "ba-strmica": { country: "BA", neighbor: "HR", lat: 44.18, lng: 16.27 },
  "ba-kamensko": { country: "BA", neighbor: "HR", lat: 43.65, lng: 16.86 },
  "ba-novi-grad": { country: "BA", neighbor: "HR", lat: 45.05, lng: 16.38 },
  "ba-kostajnica": { country: "BA", neighbor: "HR", lat: 45.22, lng: 16.55 },
  "ba-kozarska-dubica": { country: "BA", neighbor: "HR", lat: 45.18, lng: 16.81 },
  "ba-gradina": { country: "BA", neighbor: "HR", lat: 45.27, lng: 16.93 }, // Jasenovac (HR) / Gradina-Donja Gradina (BiH)
  "ba-gradiska": { country: "BA", neighbor: "HR", lat: 45.14, lng: 17.25 },
  "ba-brod": { country: "BA", neighbor: "HR", lat: 45.14, lng: 17.99 },
  "ba-svilaj": { country: "BA", neighbor: "HR", lat: 45.10, lng: 18.18 },
  "ba-samac": { country: "BA", neighbor: "HR", lat: 45.06, lng: 18.46 },
  "ba-orasje": { country: "BA", neighbor: "HR", lat: 45.03, lng: 18.69 },
  "ba-brcko": { country: "BA", neighbor: "HR", lat: 44.87, lng: 18.81 },
  "ba-bijaca": { country: "BA", neighbor: "HR", lat: 43.17, lng: 17.49 },
  "ba-zvirici": { country: "BA", neighbor: "HR", lat: 43.18, lng: 17.55 },
  "ba-doljani": { country: "BA", neighbor: "HR", lat: 43.02, lng: 17.55 },
  "ba-gabela-polje": { country: "BA", neighbor: "HR", lat: 43.07, lng: 17.62 },
  "ba-neum-i": { country: "BA", neighbor: "HR", lat: 42.92, lng: 17.62 },
  "ba-neum-ii": { country: "BA", neighbor: "HR", lat: 42.93, lng: 17.55 },
  "ba-ivanica": { country: "BA", neighbor: "HR", lat: 42.62, lng: 18.20 },
  "ba-gorica": { country: "BA", neighbor: "HR", lat: 43.35, lng: 17.36 },
  "ba-vaganj": { country: "BA", neighbor: "HR", lat: 43.58, lng: 17.05 },
  "ba-osoje": { country: "BA", neighbor: "HR", lat: 43.52, lng: 17.20 },
  "ba-crveni-grm": { country: "BA", neighbor: "HR", lat: 43.20, lng: 17.65 },
  // ===== BiH <-> Srbija =====
  "ba-raca": { country: "BA", neighbor: "RS", lat: 44.90, lng: 19.32 },
  "ba-popovi": { country: "BA", neighbor: "RS", lat: 44.78, lng: 19.27 },
  "ba-sepak": { country: "BA", neighbor: "RS", lat: 44.55, lng: 19.18 },
  "ba-karakaj": { country: "BA", neighbor: "RS", lat: 44.40, lng: 19.13 },
  "ba-bratunac": { country: "BA", neighbor: "RS", lat: 44.18, lng: 19.32 },
  "ba-skelani": { country: "BA", neighbor: "RS", lat: 43.88, lng: 19.30 },
  "ba-vardiste": { country: "BA", neighbor: "RS", lat: 43.77, lng: 19.42 },
  "ba-uvac": { country: "BA", neighbor: "RS", lat: 43.50, lng: 19.36 },
  // ===== BiH <-> Crna gora =====
  "ba-metaljka": { country: "BA", neighbor: "ME", lat: 43.30, lng: 18.94 },
  "ba-hum": { country: "BA", neighbor: "ME", lat: 43.34, lng: 18.84 },
  "ba-klobuk": { country: "BA", neighbor: "ME", lat: 42.92, lng: 18.45 },
  "ba-deleusa": { country: "BA", neighbor: "ME", lat: 42.86, lng: 18.55 },
  "ba-zupci": { country: "BA", neighbor: "ME", lat: 42.68, lng: 18.40 },
  "ba-vitine": { country: "BA", neighbor: "ME", lat: 42.80, lng: 18.48 },
  "ba-orahov-do": { country: "BA", neighbor: "ME", lat: 42.72, lng: 18.45 },

  // ===== Hrvaska <-> Srbija (glavni tranzit) =====
  "hr-bajakovo": { country: "HR", neighbor: "RS", lat: 45.06, lng: 19.10 },
  "hr-tovarnik": { country: "HR", neighbor: "RS", lat: 45.16, lng: 19.15 },
  "hr-erdut": { country: "HR", neighbor: "RS", lat: 45.52, lng: 19.05 },
  "hr-ilok": { country: "HR", neighbor: "RS", lat: 45.22, lng: 19.37 },
  "hr-batina": { country: "HR", neighbor: "RS", lat: 45.85, lng: 18.85 },

  // ===== Srbija <-> Madzarska / Romunija / Bolgarija / S.Makedonija =====
  "rs-horgos": { country: "RS", neighbor: "HU", lat: 46.16, lng: 19.99 },
  "rs-kelebija": { country: "RS", neighbor: "HU", lat: 46.00, lng: 19.62 },
  "rs-vatin": { country: "RS", neighbor: "RO", lat: 45.18, lng: 21.30 },
  "rs-gradina": { country: "RS", neighbor: "BG", lat: 43.00, lng: 22.78 },
  "rs-presevo": { country: "RS", neighbor: "MK", lat: 42.30, lng: 21.74 },
  "rs-gostun": { country: "RS", neighbor: "ME", lat: 43.20, lng: 19.65 },

  // ===== Crna gora <-> Albanija =====
  "me-sukobin": { country: "ME", neighbor: "AL", lat: 41.93, lng: 19.40 },
  "me-bozaj": { country: "ME", neighbor: "AL", lat: 42.40, lng: 19.36 },

  // ===== S. Makedonija <-> Grcija / Bolgarija / Kosovo =====
  "mk-bogorodica": { country: "MK", neighbor: "GR", lat: 41.15, lng: 22.53 },
  "mk-deve-bair": { country: "MK", neighbor: "BG", lat: 42.25, lng: 22.70 },
  "mk-tabanovce": { country: "MK", neighbor: "RS", lat: 42.18, lng: 21.72 },
  "mk-blace": { country: "MK", neighbor: "XK", lat: 42.35, lng: 21.25 },

  // ===== Slovenija (kamere; Schengen, brez kontrol) =====
  "si-obrezje": { country: "SI", neighbor: "HR", lat: 45.85, lng: 15.69 },
  "si-gruskovje": { country: "SI", neighbor: "HR", lat: 46.29, lng: 15.77 },
  "si-karavanke": { country: "SI", neighbor: "AT", lat: 46.44, lng: 14.08 },
};

/** Vse kamere za prehod: globoke povezave (HAK + AMS-RS) ali zasilna stran vira. */
function camerasFor(id: string, d: CrossingDef): CameraLink[] {
  const out: CameraLink[] = [...hakCamerasForCrossing(id), ...amssCamerasForCrossing(id)];
  if (AMSRS_DEEPLINK[id]) out.push({ source: "AMS-RS", url: AMSRS_DEEPLINK[id] });
  if (out.length === 0) {
    const f = fallbackCam(d.country, d.neighbor);
    if (f) out.push(f);
  }
  return out;
}

export function metaForId(id: string): CrossingMeta | null {
  const d = CROSSINGS[id];
  if (!d) return null;
  return { ...d, cameras: camerasFor(id, d) };
}

/** Vsi prehodi kot meta (za prikaz tudi tam, kjer se ni zivih cakalnih dob). */
export function allCrossings(): Array<{ id: string } & CrossingMeta> {
  return Object.entries(CROSSINGS).map(([id, d]) => ({ id, ...d, cameras: camerasFor(id, d) }));
}
