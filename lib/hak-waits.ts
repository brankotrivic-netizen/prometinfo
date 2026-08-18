// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradiska",
  "name": "Gornji Varoš (Gradiška (novi most))",
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
  "ulazTs": "18.8.2026. 11:56:49",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-08-18T11:56:49+02:00",
  "izlazTsISO": "",
  "ts": "18.8.2026. 11:56:49",
  "tsISO": "2026-08-18T11:56:49+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 120,
  "izlazMin": 30,
  "ulazTxt": "2 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 30,
  "truckIzlazMin": 30,
  "truckUlazTxt": "do 30 min.",
  "truckIzlazTxt": "do 30 min.",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "18.8.2026. 14:01:35",
  "izlazTs": "18.8.2026. 14:01:50",
  "ulazTsISO": "2026-08-18T14:01:35+02:00",
  "izlazTsISO": "2026-08-18T14:01:50+02:00",
  "ts": "18.8.2026. 14:01:35",
  "tsISO": "2026-08-18T14:01:35+02:00"
 }
];
