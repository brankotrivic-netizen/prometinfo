// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
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
  "ulazTs": "21.8.2026. 5:32:01",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-08-21T05:32:01+02:00",
  "izlazTsISO": "",
  "ts": "21.8.2026. 5:32:01",
  "tsISO": "2026-08-21T05:32:01+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": 120,
  "izlazMin": null,
  "ulazTxt": "2 h",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "21.8.2026. 2:48:47",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-08-21T02:48:47+02:00",
  "izlazTsISO": "",
  "ts": "21.8.2026. 2:48:47",
  "tsISO": "2026-08-21T02:48:47+02:00"
 }
];
