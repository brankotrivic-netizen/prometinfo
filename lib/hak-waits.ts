// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradiska",
  "name": "Gornji Varoš (Gradiška (novi most))",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": 60,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "1 h",
  "level": "low",
  "waitMinutes": 30,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "ba-brod",
  "name": "Slavonski Brod (Bosanski Brod)",
  "ulazMin": null,
  "izlazMin": 90,
  "ulazTxt": "-",
  "izlazTxt": "1 h 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": 90,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "1 h 30 min.",
  "level": "high",
  "waitMinutes": 90,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": 90,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "1 h 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": 60,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "1 h",
  "level": "high",
  "waitMinutes": 90,
  "ts": "16.07.2026 20:08:26",
  "tsISO": "2026-07-16T20:08:26+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": 60,
  "ulazTxt": "-",
  "izlazTxt": "1 h",
  "truckUlazMin": 360,
  "truckIzlazMin": 360,
  "truckUlazTxt": "6 h",
  "truckIzlazTxt": "6 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
