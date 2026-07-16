// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": 120,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "2 h",
  "truckUlazMin": null,
  "truckIzlazMin": 120,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "2 h",
  "level": "high",
  "waitMinutes": 120,
  "ts": "16.7.2026. 20:08:26",
  "tsISO": "2026-07-16T20:08:26+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 360,
  "truckIzlazMin": 360,
  "truckUlazTxt": "6 h",
  "truckIzlazTxt": "6 h",
  "level": "low",
  "waitMinutes": 30,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
