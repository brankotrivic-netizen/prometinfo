// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-velika-kladusa",
  "name": "Maljevac (Velika Kladuša)",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "Nema podataka",
  "izlazTs": "04.08.2026 19:23:35",
  "ulazTsISO": "",
  "izlazTsISO": "2026-08-04T19:23:35+02:00",
  "ts": "04.08.2026 19:23:35",
  "tsISO": "2026-08-04T19:23:35+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": 360,
  "truckIzlazMin": 120,
  "truckUlazTxt": "6 h",
  "truckIzlazTxt": "2 h",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "04.08.2026 19:42:52",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-08-04T19:42:52+02:00",
  "izlazTsISO": "",
  "ts": "04.08.2026 19:42:52",
  "tsISO": "2026-08-04T19:42:52+02:00"
 }
];
