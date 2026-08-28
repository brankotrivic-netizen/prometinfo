// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 180,
  "izlazMin": 30,
  "ulazTxt": "3 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 180,
  "truckIzlazMin": 30,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "do 30 min.",
  "level": "severe",
  "waitMinutes": 180,
  "ulazTs": "27.8.2026. 23:49:23",
  "izlazTs": "27.8.2026. 23:49:14",
  "ulazTsISO": "2026-08-27T23:49:23+02:00",
  "izlazTsISO": "2026-08-27T23:49:14+02:00",
  "ts": "27.8.2026. 23:49:23",
  "tsISO": "2026-08-27T23:49:23+02:00"
 }
];
