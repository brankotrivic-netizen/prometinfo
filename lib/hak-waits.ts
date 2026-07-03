// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradiska",
  "name": "Gornji Varoš (Gradiška (novi most))",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": 120,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "2 h",
  "level": "low",
  "waitMinutes": 30,
  "ts": "3.7.2026. 14:03:47",
  "tsISO": "2026-07-03T14:03:47+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": 60,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "1 h",
  "level": "low",
  "waitMinutes": 30,
  "ts": "3.7.2026. 13:12:36",
  "tsISO": "2026-07-03T13:12:36+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": 120,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "2 h",
  "level": "unknown",
  "waitMinutes": null,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
