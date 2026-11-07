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
  "truckUlazMin": 120,
  "truckIzlazMin": 120,
  "truckUlazTxt": "2 h",
  "truckIzlazTxt": "2 h",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "L: 0 km T: 07.11.2026 16:24:47",
  "izlazTs": "07.11.2026 15:15:04",
  "ulazTsISO": "2026-11-07T16:24:47+02:00",
  "izlazTsISO": "2026-11-07T15:15:04+02:00",
  "ts": "L: 0 km T: 07.11.2026 16:24:47",
  "tsISO": "2026-11-07T16:24:47+02:00"
 }
];
