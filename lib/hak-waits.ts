// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "",
  "name": "Gornji Brgat (Ivanica)",
  "ulazMin": 30,
  "izlazMin": 90,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "1 h 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 90,
  "ulazTs": "L: 0 km T: 22.7.2026. 19:09:19",
  "izlazTs": "22.7.2026. 20:16:07",
  "ulazTsISO": "2026-07-22T19:09:19+02:00",
  "izlazTsISO": "2026-07-22T20:16:07+02:00",
  "ts": "L: 0 km T: 22.7.2026. 19:09:19",
  "tsISO": "2026-07-22T19:09:19+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 420,
  "truckIzlazMin": 90,
  "truckUlazTxt": "7 h",
  "truckIzlazTxt": "1 h 30 min.",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "Nema podataka",
  "izlazTs": "22.7.2026. 19:40:24",
  "ulazTsISO": "",
  "izlazTsISO": "2026-07-22T19:40:24+02:00",
  "ts": "22.7.2026. 19:40:24",
  "tsISO": "2026-07-22T19:40:24+02:00"
 }
];
