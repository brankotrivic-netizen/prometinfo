// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradiska",
  "name": "Gornji Varoš (Gradiška (novi most))",
  "ulazMin": 60,
  "izlazMin": 60,
  "ulazTxt": "1 h",
  "izlazTxt": "1 h",
  "truckUlazMin": null,
  "truckIzlazMin": 60,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "1 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "16.7.2026. 11:10:17",
  "tsISO": "2026-07-16T11:10:17+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": 180,
  "ulazTxt": "1 h",
  "izlazTxt": "3 h",
  "truckUlazMin": null,
  "truckIzlazMin": 180,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "3 h",
  "level": "severe",
  "waitMinutes": 180,
  "ts": "16.7.2026. 12:35:15",
  "tsISO": "2026-07-16T12:35:15+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": 60,
  "ulazTxt": "-",
  "izlazTxt": "1 h",
  "truckUlazMin": 360,
  "truckIzlazMin": 300,
  "truckUlazTxt": "6 h",
  "truckIzlazTxt": "5 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
