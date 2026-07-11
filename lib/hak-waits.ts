// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradiska",
  "name": "Gornji Varoš (Gradiška (novi most))",
  "ulazMin": null,
  "izlazMin": 90,
  "ulazTxt": "-",
  "izlazTxt": "1 h 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 90,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": null,
  "izlazMin": 60,
  "ulazTxt": "-",
  "izlazTxt": "1 h",
  "truckUlazMin": null,
  "truckIzlazMin": 60,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "1 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 30,
  "truckIzlazMin": 60,
  "truckUlazTxt": "do 30 min.",
  "truckIzlazTxt": "1 h",
  "level": "low",
  "waitMinutes": 30,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
