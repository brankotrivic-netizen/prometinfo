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
  "id": "ba-svilaj",
  "name": "Svilaj",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 30,
  "truckIzlazMin": null,
  "truckUlazTxt": "do 30 min.",
  "truckIzlazTxt": "-",
  "level": "unknown",
  "waitMinutes": null,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 240,
  "truckIzlazMin": null,
  "truckUlazTxt": "4 h",
  "truckIzlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ts": "07.07.2026 11:18:49",
  "tsISO": "2026-07-07T11:18:49+02:00"
 }
];
