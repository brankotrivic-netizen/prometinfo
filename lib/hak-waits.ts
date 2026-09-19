// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradiska",
  "name": "Gornji Varoš (Gradiška (novi most))",
  "ulazMin": 60,
  "izlazMin": 30,
  "ulazTxt": "1 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "L: 0 km T: 19.09.2026 12:11:47",
  "izlazTs": "19.09.2026 12:12:05",
  "ulazTsISO": "2026-09-19T12:11:47+02:00",
  "izlazTsISO": "2026-09-19T12:12:05+02:00",
  "ts": "L: 0 km T: 19.09.2026 12:11:47",
  "tsISO": "2026-09-19T12:11:47+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": 30,
  "ulazTxt": "1 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": 180,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "3 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "19.09.2026 12:33:44",
  "izlazTs": "19.09.2026 11:22:37",
  "ulazTsISO": "2026-09-19T12:33:44+02:00",
  "izlazTsISO": "2026-09-19T11:22:37+02:00",
  "ts": "19.09.2026 12:33:44",
  "tsISO": "2026-09-19T12:33:44+02:00"
 }
];
