// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": 30,
  "ulazTxt": "1 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 180,
  "truckIzlazMin": 120,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "2 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "8.10.2026. 11:19:47",
  "izlazTs": "8.10.2026. 11:19:56",
  "ulazTsISO": "2026-10-08T11:19:47+02:00",
  "izlazTsISO": "2026-10-08T11:19:56+02:00",
  "ts": "8.10.2026. 11:19:47",
  "tsISO": "2026-10-08T11:19:47+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 10,
  "truckIzlazMin": 480,
  "truckUlazTxt": "do 10 sati",
  "truckIzlazTxt": "8 h",
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
