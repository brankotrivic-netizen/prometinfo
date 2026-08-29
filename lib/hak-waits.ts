// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradiska",
  "name": "Gornji Varoš (Gradiška (novi most))",
  "ulazMin": null,
  "izlazMin": 60,
  "ulazTxt": "-",
  "izlazTxt": "1 h",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "Nema podataka",
  "izlazTs": "28.8.2026. 23:37:12",
  "ulazTsISO": "",
  "izlazTsISO": "2026-08-28T23:37:12+02:00",
  "ts": "28.8.2026. 23:37:12",
  "tsISO": "2026-08-28T23:37:12+02:00"
 },
 {
  "id": "",
  "name": "Dvor (Bosanski Novi)",
  "ulazMin": null,
  "izlazMin": 90,
  "ulazTxt": "-",
  "izlazTxt": "1 h 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 90,
  "ulazTs": "Nema podataka",
  "izlazTs": "28.8.2026. 22:16:47",
  "ulazTsISO": "",
  "izlazTsISO": "2026-08-28T22:16:47+02:00",
  "ts": "28.8.2026. 22:16:47",
  "tsISO": "2026-08-28T22:16:47+02:00"
 }
];
