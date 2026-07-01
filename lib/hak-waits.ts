// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-velika-kladusa",
  "name": "Maljevac (Velika Kladuša)",
  "ulazMin": 90,
  "izlazMin": null,
  "ulazTxt": "1 h 30 min.",
  "izlazTxt": "-",
  "level": "high",
  "waitMinutes": 90,
  "ts": "1.7.2026. 8:47:50",
  "tsISO": "2026-07-01T08:47:50+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "level": "low",
  "waitMinutes": 30,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
