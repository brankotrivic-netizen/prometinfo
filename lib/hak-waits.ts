// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": 60,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "1 h",
  "truckUlazMin": 120,
  "truckIzlazMin": 120,
  "truckUlazTxt": "2 h",
  "truckIzlazTxt": "2 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "19.09.2026 15:15:13",
  "izlazTs": "19.09.2026 15:15:26",
  "ulazTsISO": "2026-09-19T15:15:13+02:00",
  "izlazTsISO": "2026-09-19T15:15:26+02:00",
  "ts": "19.09.2026 15:15:13",
  "tsISO": "2026-09-19T15:15:13+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 60,
  "truckIzlazMin": null,
  "truckUlazTxt": "1 h",
  "truckIzlazTxt": "-",
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
