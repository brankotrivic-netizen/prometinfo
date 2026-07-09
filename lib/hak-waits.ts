// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-izacic",
  "name": "Ličko Petrovo Selo (Izačić)",
  "ulazMin": 60,
  "izlazMin": null,
  "ulazTxt": "1 h",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "09.07.2026 07:36:38",
  "tsISO": "2026-07-09T07:36:38+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": 90,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "1 h 30 min.",
  "truckUlazMin": 180,
  "truckIzlazMin": 90,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "1 h 30 min.",
  "level": "high",
  "waitMinutes": 90,
  "ts": "09.07.2026 05:23:26",
  "tsISO": "2026-07-09T05:23:26+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 240,
  "truckIzlazMin": 120,
  "truckUlazTxt": "4 h",
  "truckIzlazTxt": "2 h",
  "level": "unknown",
  "waitMinutes": null,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
