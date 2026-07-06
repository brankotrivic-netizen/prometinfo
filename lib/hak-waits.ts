// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": 180,
  "truckIzlazMin": 60,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "1 h",
  "level": "low",
  "waitMinutes": 30,
  "ts": "7.7.2026. 0:20:41",
  "tsISO": "2026-07-07T00:20:41+02:00"
 },
 {
  "id": "hr-batina",
  "name": "Batina (Bezdan)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 480,
  "truckIzlazMin": null,
  "truckUlazTxt": "8 h",
  "truckIzlazTxt": "-",
  "level": "unknown",
  "waitMinutes": null,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
