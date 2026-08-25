// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 120,
  "izlazMin": 30,
  "ulazTxt": "2 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 240,
  "truckIzlazMin": null,
  "truckUlazTxt": "4 h",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "25.08.2026 20:40:08",
  "izlazTs": "25.08.2026 20:40:42",
  "ulazTsISO": "2026-08-25T20:40:08+02:00",
  "izlazTsISO": "2026-08-25T20:40:42+02:00",
  "ts": "25.08.2026 20:40:08",
  "tsISO": "2026-08-25T20:40:08+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": 480,
  "truckIzlazMin": 60,
  "truckUlazTxt": "8 h",
  "truckIzlazTxt": "1 h",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "25.08.2026 19:20:45",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-08-25T19:20:45+02:00",
  "izlazTsISO": "",
  "ts": "25.08.2026 19:20:45",
  "tsISO": "2026-08-25T19:20:45+02:00"
 }
];
