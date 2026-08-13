// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradiska",
  "name": "Gornji Varoš (Gradiška (novi most))",
  "ulazMin": 60,
  "izlazMin": null,
  "ulazTxt": "1 h",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "13.8.2026. 16:42:06",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-08-13T16:42:06+02:00",
  "izlazTsISO": "",
  "ts": "13.8.2026. 16:42:06",
  "tsISO": "2026-08-13T16:42:06+02:00"
 },
 {
  "id": "ba-gradina",
  "name": "Jasenovac (Donja Gradina)",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "L: 0 km T: 13.8.2026. 17:01:26",
  "izlazTs": "L: 0 km T: 13.8.2026. 17:01:49",
  "ulazTsISO": "2026-08-13T17:01:26+02:00",
  "izlazTsISO": "2026-08-13T17:01:49+02:00",
  "ts": "L: 0 km T: 13.8.2026. 17:01:26",
  "tsISO": "2026-08-13T17:01:26+02:00"
 }
];
