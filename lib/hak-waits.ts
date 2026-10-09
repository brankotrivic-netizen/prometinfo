// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 120,
  "izlazMin": 120,
  "ulazTxt": "2 h",
  "izlazTxt": "2 h",
  "truckUlazMin": 60,
  "truckIzlazMin": 180,
  "truckUlazTxt": "1 h",
  "truckIzlazTxt": "3 h",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "9.10.2026. 12:58:00",
  "izlazTs": "9.10.2026. 12:07:29",
  "ulazTsISO": "2026-10-09T12:58:00+02:00",
  "izlazTsISO": "2026-10-09T12:07:29+02:00",
  "ts": "9.10.2026. 12:58:00",
  "tsISO": "2026-10-09T12:58:00+02:00"
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
  "ulazTs": "Nema podataka",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "",
  "izlazTsISO": "",
  "ts": "",
  "tsISO": ""
 }
];
