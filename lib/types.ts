// Skupni tipi za celoten projekt (uporabljajo jih API, web in kasneje mobile).

/** ISO koda drzave bivse Jugoslavije + sosede, relevantne za meje. */
export type Country =
  | "BA" | "HR" | "RS" | "ME" | "MK" | "SI" | "XK"
  // EU / regijske sosede (za mednarodne prehode):
  | "HU" | "AT" | "IT" | "AL" | "BG" | "RO" | "GR";

export type VehicleType = "car" | "truck" | "bus";

/** Smer glede na drzavo vira: vstop v drzavo ali izstop iz nje. */
export type Direction = "entry" | "exit" | "both";

/**
 * Kategorija statusa cakanja. Ker viri pogosto pisejo opisno
 * ("ne duze od 30 minuta"), poleg ocene v minutah hranimo tudi kategorijo.
 */
export type WaitLevel = "none" | "low" | "moderate" | "high" | "severe" | "unknown";

/** Povezava do uradne zive kamere (en prehod ima lahko vec strani/virov). */
export interface CameraLink {
  /** Oznaka vira, npr. "HAK", "AMS-RS", "AMSS". */
  source: string;
  url: string;
}

/** En normaliziran zapis o cakanju na enem prehodu. */
export interface WaitReport {
  /** Stabilen ID, npr. "ba-velika-kladusa". */
  id: string;
  /** Ime prehoda brez predpone, npr. "Velika Kladusa". */
  crossing: string;
  /** Drzava, ki objavlja / kjer je prehod. */
  country: Country;
  /** Sosednja drzava na drugi strani meje, ce je znana. */
  neighbor: Country | null;
  /** Priblizne koordinate prehoda za zemljevid (ce so v registru). */
  lat: number | null;
  lng: number | null;
  vehicle: VehicleType;
  direction: Direction;
  /** Uradne zive kamere za ta prehod (klik -> tocno ta kamera). */
  cameras: CameraLink[];
  /** Parsana ocena cakanja v minutah, ce jo je bilo mogoce izlusciti. */
  waitMinutes: number | null;
  /** Kategorija resnosti cakanja. */
  level: WaitLevel;
  /** Originalno besedilo statusa (vedno ohranjeno). */
  rawStatus: string;
  source: string;
  sourceUrl: string;
  /** ISO cas zajema. */
  fetchedAt: string;
}

/** Rezultat enega vira (scraperja) ob enem zajemu. */
export interface SourceResult {
  source: string;
  country: Country;
  ok: boolean;
  /** Vir je nacrtovan, a se ni implementiran (prikaze se nevtralno, ne kot napaka). */
  pending?: boolean;
  note?: string;
  error?: string;
  fetchedAt: string;
  reports: WaitReport[];
}

export const COUNTRY_NAMES: Record<Country, string> = {
  BA: "Bosna in Hercegovina",
  HR: "Hrvaska",
  RS: "Srbija",
  ME: "Crna gora",
  MK: "Severna Makedonija",
  SI: "Slovenija",
  XK: "Kosovo",
  HU: "Madzarska",
  AT: "Avstrija",
  IT: "Italija",
  AL: "Albanija",
  BG: "Bolgarija",
  RO: "Romunija",
  GR: "Grcija",
};
