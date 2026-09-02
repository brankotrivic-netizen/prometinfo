// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": null,
  "ulazTxt": "1 h",
  "izlazTxt": "-",
  "truckUlazMin": 180,
  "truckIzlazMin": 90,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "1 h 30 min.",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "2.9.2026. 21:33:36",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-09-02T21:33:36+02:00",
  "izlazTsISO": "",
  "ts": "2.9.2026. 21:33:36",
  "tsISO": "2026-09-02T21:33:36+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": 360,
  "truckIzlazMin": 240,
  "truckUlazTxt": "6 h",
  "truckIzlazTxt": "4 h",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "2.9.2026. 19:07:51",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-09-02T19:07:51+02:00",
  "izlazTsISO": "",
  "ts": "2.9.2026. 19:07:51",
  "tsISO": "2026-09-02T19:07:51+02:00"
 }
];
