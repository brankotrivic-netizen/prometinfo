// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 180,
  "truckIzlazMin": 30,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "do 30 min.",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "10.10.2026. 19:19:24",
  "izlazTs": "10.10.2026. 19:19:32",
  "ulazTsISO": "2026-10-10T19:19:24+02:00",
  "izlazTsISO": "2026-10-10T19:19:32+02:00",
  "ts": "10.10.2026. 19:19:24",
  "tsISO": "2026-10-10T19:19:24+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 30,
  "truckIzlazMin": 120,
  "truckUlazTxt": "do 30 min.",
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
