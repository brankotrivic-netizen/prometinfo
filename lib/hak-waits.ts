// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": 180,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "3 h",
  "truckUlazMin": 120,
  "truckIzlazMin": 30,
  "truckUlazTxt": "2 h",
  "truckIzlazTxt": "do 30 min.",
  "level": "severe",
  "waitMinutes": 180,
  "ts": "17.7.2026. 5:39:16",
  "tsISO": "2026-07-17T05:39:16+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": 90,
  "ulazTxt": "-",
  "izlazTxt": "1 h 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": 180,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "3 h",
  "level": "high",
  "waitMinutes": 90,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
