// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradina",
  "name": "Jasenovac (Donja Gradina)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": 30,
  "truckIzlazMin": null,
  "truckUlazTxt": "do 30 min.",
  "truckIzlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "11.10.2026. 22:20:53",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-10-11T22:20:53+02:00",
  "izlazTsISO": "",
  "ts": "11.10.2026. 22:20:53",
  "tsISO": "2026-10-11T22:20:53+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": 120,
  "ulazTxt": "1 h",
  "izlazTxt": "2 h",
  "truckUlazMin": 300,
  "truckIzlazMin": null,
  "truckUlazTxt": "5 h",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "12.10.2026. 1:37:28",
  "izlazTs": "12.10.2026. 1:36:24",
  "ulazTsISO": "2026-10-12T01:37:28+02:00",
  "izlazTsISO": "2026-10-12T01:36:24+02:00",
  "ts": "12.10.2026. 1:37:28",
  "tsISO": "2026-10-12T01:37:28+02:00"
 }
];
