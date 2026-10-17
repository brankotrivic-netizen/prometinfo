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
  "truckUlazMin": 0,
  "truckIzlazMin": 120,
  "truckUlazTxt": "Višesatna čekanja",
  "truckIzlazTxt": "2 h",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "17.10.2026. 19:47:57",
  "izlazTs": "17.10.2026. 19:46:55",
  "ulazTsISO": "2026-10-17T19:47:57+02:00",
  "izlazTsISO": "2026-10-17T19:46:55+02:00",
  "ts": "17.10.2026. 19:47:57",
  "tsISO": "2026-10-17T19:47:57+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 120,
  "truckIzlazMin": 120,
  "truckUlazTxt": "2 h",
  "truckIzlazTxt": "2 h",
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
