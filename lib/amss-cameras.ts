import type { CameraLink } from "./types";

/**
 * AMSS (Auto-moto savez Srbije) kamere na glavnih srbskih mejnih prehodih.
 * Stran: kamere.amss.org.rs (akordeon s 4 prehodi, vstop/izstop).
 * Tokovi so ZIVI HLS: kamere.amss.org.rs/<id>/<id>.m3u8 (id npr. horgos1, horgos2)
 * -> v pravi Next.js aplikaciji jih lahko VGRADIMO (hls.js), v osnutku linkamo na stran.
 */
export const AMSS_CAM_PAGE = "https://kamere.amss.org.rs/";
export const amssStream = (id: string) => `https://kamere.amss.org.rs/${id}/${id}.m3u8`;

interface AmssEntry {
  label: string;
  /** ZIVI HLS tokovi: [vstop, izstop] — za vgradnjo v pravi aplikaciji. */
  streams: string[];
}

export const AMSS_CAMERAS: Record<string, AmssEntry> = {
  "rs-horgos": { label: "AMSS Horgoš", streams: [amssStream("horgos1"), amssStream("horgos2")] },
  "hr-bajakovo": { label: "AMSS Batrovci", streams: [amssStream("batrovci1"), amssStream("batrovci2")] }, // srbska stran Bajakova
  "rs-gradina": { label: "AMSS Gradina", streams: [amssStream("gradina1"), amssStream("gradina2")] },
  "rs-presevo": { label: "AMSS Preševo", streams: [amssStream("presevo1"), amssStream("presevo2")] },
};

/** AMSS kamere za prehod (klik -> uradna stran; tokovi shranjeni za vgradnjo). */
export function amssCamerasForCrossing(id: string): CameraLink[] {
  const e = AMSS_CAMERAS[id];
  return e ? [{ source: e.label, url: AMSS_CAM_PAGE }] : [];
}

/** ZIVI HLS tokovi za vgradnjo (klik -> video v aplikaciji). */
export interface StreamLink {
  label: string;
  url: string;
}
export function amssStreamsForCrossing(id: string): StreamLink[] {
  const e = AMSS_CAMERAS[id];
  if (!e) return [];
  return e.streams.map((url, i) => ({ label: i === 0 ? "ulaz" : "izlaz", url }));
}
