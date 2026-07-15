// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-orasje",
  "name": "Županja (Orašje)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 90,
  "truckIzlazMin": null,
  "truckUlazTxt": "1 h 30 min.",
  "truckIzlazTxt": "-",
  "level": "unknown",
  "waitMinutes": null,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "ba-gradina",
  "name": "Jasenovac (Donja Gradina)",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 60,
  "truckIzlazMin": 60,
  "truckUlazTxt": "1 h",
  "truckIzlazTxt": "1 h",
  "level": "low",
  "waitMinutes": 30,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": 120,
  "ulazTxt": "1 h",
  "izlazTxt": "2 h",
  "truckUlazMin": 180,
  "truckIzlazMin": 120,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "2 h",
  "level": "high",
  "waitMinutes": 120,
  "ts": "15.07.2026 15:13:42",
  "tsISO": "2026-07-15T15:13:42+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": 60,
  "ulazTxt": "-",
  "izlazTxt": "1 h",
  "truckUlazMin": 300,
  "truckIzlazMin": 180,
  "truckUlazTxt": "5 h",
  "truckIzlazTxt": "3 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
