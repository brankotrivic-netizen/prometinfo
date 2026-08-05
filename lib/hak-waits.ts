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
  "truckUlazMin": null,
  "truckIzlazMin": 120,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "2 h",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "5.8.2026. 22:31:12",
  "izlazTs": "5.8.2026. 22:31:00",
  "ulazTsISO": "2026-08-05T22:31:12+02:00",
  "izlazTsISO": "2026-08-05T22:31:00+02:00",
  "ts": "5.8.2026. 22:31:12",
  "tsISO": "2026-08-05T22:31:12+02:00"
 }
];
