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
  "truckUlazMin": 360,
  "truckIzlazMin": 120,
  "truckUlazTxt": "6 h",
  "truckIzlazTxt": "2 h",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "09.09.2026 14:17:30",
  "izlazTs": "09.09.2026 14:17:40",
  "ulazTsISO": "2026-09-09T14:17:30+02:00",
  "izlazTsISO": "2026-09-09T14:17:40+02:00",
  "ts": "09.09.2026 14:17:30",
  "tsISO": "2026-09-09T14:17:30+02:00"
 }
];
