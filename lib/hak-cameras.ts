import type { Country } from "./types";

/**
 * POPOLN register HAK mejnih kamer (skupina g=2 na m.hak.hr).
 * Vsaka kamera ima direktno povezavo: m.hak.hr/kamera.asp?g=2&k=<k>.
 * crossingId: ce kamera pripada prehodu iz registra (lib/crossings.ts),
 * se povezava pripne TEMU prehodu (tako dobimo obe strani meje); sicer
 * se kamera prikaze kot samostojna tocka na zemljevidu.
 * Koordinate so PRIBLIZNE (osnutek).
 */
export interface HakCam {
  k: number;
  name: string;
  neighbor: Country;
  lat: number;
  lng: number;
  crossingId?: string;
}

export const hakLink = (k: number) => `https://m.hak.hr/kamera.asp?g=2&k=${k}`;

export const HAK_CAMERAS: HakCam[] = [
  // HR <-> SI (samostojne tocke; Schengen, za promet/kamere)
  { k: 3, name: "Bregana", neighbor: "SI", lat: 45.84, lng: 15.70, crossingId: "si-obrezje" },
  { k: 16, name: "Macelj", neighbor: "SI", lat: 46.29, lng: 15.78, crossingId: "si-gruskovje" },
  { k: 21, name: "Pasjak", neighbor: "SI", lat: 45.49, lng: 14.30 },
  { k: 28, name: "Rupa", neighbor: "SI", lat: 45.49, lng: 14.27 },
  // HR <-> RS
  { k: 1, name: "Bajakovo", neighbor: "RS", lat: 45.06, lng: 19.10, crossingId: "hr-bajakovo" },
  { k: 196, name: "Tovarnik", neighbor: "RS", lat: 45.16, lng: 19.15, crossingId: "hr-tovarnik" },
  { k: 197, name: "Erdut", neighbor: "RS", lat: 45.52, lng: 19.05, crossingId: "hr-erdut" },
  { k: 200, name: "Ilok", neighbor: "RS", lat: 45.22, lng: 19.37, crossingId: "hr-ilok" },
  { k: 301, name: "Batina", neighbor: "RS", lat: 45.85, lng: 18.85, crossingId: "hr-batina" },
  // HR <-> BiH
  { k: 206, name: "Gunja", neighbor: "BA", lat: 44.88, lng: 18.84, crossingId: "ba-brcko" },
  { k: 44, name: "Zupanja", neighbor: "BA", lat: 45.01, lng: 18.70, crossingId: "ba-orasje" },
  { k: 183, name: "Orasje (BIH)", neighbor: "BA", lat: 45.03, lng: 18.69, crossingId: "ba-orasje" },
  { k: 300, name: "Slavonski Samac", neighbor: "BA", lat: 45.06, lng: 18.46, crossingId: "ba-samac" },
  { k: 211, name: "Svilaj", neighbor: "BA", lat: 45.10, lng: 18.18, crossingId: "ba-svilaj" },
  { k: 140, name: "Slavonski Brod", neighbor: "BA", lat: 45.16, lng: 18.01, crossingId: "ba-brod" },
  { k: 184, name: "Bosanski Brod (BIH)", neighbor: "BA", lat: 45.14, lng: 17.99, crossingId: "ba-brod" },
  { k: 32, name: "Stara Gradiska", neighbor: "BA", lat: 45.15, lng: 17.25, crossingId: "ba-gradiska" },
  { k: 185, name: "Bosanska Gradiska (BIH)", neighbor: "BA", lat: 45.14, lng: 17.25, crossingId: "ba-gradiska" },
  { k: 303, name: "Gornji Varos", neighbor: "BA", lat: 45.15, lng: 17.26, crossingId: "ba-gradiska" },
  { k: 302, name: "Hrvatska Kostajnica", neighbor: "BA", lat: 45.22, lng: 16.55, crossingId: "ba-kostajnica" },
  { k: 177, name: "Maljevac", neighbor: "BA", lat: 45.18, lng: 15.82, crossingId: "ba-velika-kladusa" },
  { k: 179, name: "Izacic (BIH)", neighbor: "BA", lat: 44.85, lng: 15.78, crossingId: "ba-izacic" },
  { k: 192, name: "Kamensko", neighbor: "BA", lat: 43.65, lng: 16.86, crossingId: "ba-kamensko" },
  { k: 180, name: "Prisika (BIH)", neighbor: "BA", lat: 43.45, lng: 17.28 },
  { k: 193, name: "Arzano", neighbor: "BA", lat: 43.62, lng: 16.95 },
  { k: 282, name: "Vinjani Gornji", neighbor: "BA", lat: 43.49, lng: 17.33 },
  { k: 39, name: "Vinjani Donji", neighbor: "BA", lat: 43.43, lng: 17.27 },
  { k: 181, name: "Crveni Grm (BIH)", neighbor: "BA", lat: 43.20, lng: 17.65, crossingId: "ba-crveni-grm" },
  { k: 137, name: "Nova Sela / Bijaca", neighbor: "BA", lat: 43.17, lng: 17.49, crossingId: "ba-bijaca" },
  { k: 136, name: "Metkovic", neighbor: "BA", lat: 43.05, lng: 17.65, crossingId: "ba-doljani" },
  { k: 138, name: "Klek / Neum 1", neighbor: "BA", lat: 42.92, lng: 17.57, crossingId: "ba-neum-i" },
  { k: 139, name: "Zaton Doli / Neum 2", neighbor: "BA", lat: 42.89, lng: 17.69, crossingId: "ba-neum-ii" },
  { k: 182, name: "Ivanica (BIH)", neighbor: "BA", lat: 42.62, lng: 18.20, crossingId: "ba-ivanica" },
  { k: 208, name: "Brgat", neighbor: "BA", lat: 42.63, lng: 18.18, crossingId: "ba-ivanica" },
  // HR <-> Crna gora
  { k: 141, name: "Karasovici", neighbor: "ME", lat: 42.49, lng: 18.45 },
  { k: 209, name: "Vitaljina", neighbor: "ME", lat: 42.46, lng: 18.43 },
];

/** HAK kamere za dolocen prehod (po crossingId). */
export function hakCamerasForCrossing(crossingId: string): Array<{ source: string; url: string }> {
  return HAK_CAMERAS.filter((c) => c.crossingId === crossingId).map((c) => ({ source: c.name, url: hakLink(c.k) }));
}

/** Samostojne HAK kamere (brez ujemajocega prehoda) za prikaz kot lastne tocke. */
export function standaloneHakCameras(): HakCam[] {
  return HAK_CAMERAS.filter((c) => !c.crossingId);
}
