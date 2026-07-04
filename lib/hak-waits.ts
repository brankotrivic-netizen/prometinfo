// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-brod",
  "name": "Slavonski Brod (Bosanski Brod)",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": 30,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "do 30 min.",
  "level": "low",
  "waitMinutes": 30,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "ba-neum-i",
  "name": "Klek (Neum I)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ts": "L: 0,5 km T: 04.07.2026 10:29:57",
  "tsISO": "2026-07-04T10:29:57+02:00"
 },
 {
  "id": "ba-doljani",
  "name": "Metković (Doljani)",
  "ulazMin": 90,
  "izlazMin": null,
  "ulazTxt": "1 h 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 90,
  "ts": "L: 1 km T: 04.07.2026 09:22:00",
  "tsISO": "2026-07-04T09:22:00+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": 180,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "3 h",
  "level": "unknown",
  "waitMinutes": null,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
