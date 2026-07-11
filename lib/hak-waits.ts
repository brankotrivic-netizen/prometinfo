// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-velika-kladusa",
  "name": "Maljevac (Velika Kladuša)",
  "ulazMin": null,
  "izlazMin": 60,
  "ulazTxt": "-",
  "izlazTxt": "1 h",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": 180,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "3 h",
  "truckUlazMin": 90,
  "truckIzlazMin": 90,
  "truckUlazTxt": "1 h 30 min.",
  "truckIzlazTxt": "1 h 30 min.",
  "level": "severe",
  "waitMinutes": 180,
  "ts": "11.7.2026. 5:00:15",
  "tsISO": "2026-07-11T05:00:15+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": 60,
  "ulazTxt": "-",
  "izlazTxt": "1 h",
  "truckUlazMin": null,
  "truckIzlazMin": 240,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "4 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
