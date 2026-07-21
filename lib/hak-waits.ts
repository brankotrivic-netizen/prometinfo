// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "",
  "name": "Karasovići (Sutorina)",
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
  "ulazTs": "21.7.2026. 14:42:30",
  "izlazTs": "21.7.2026. 14:43:03",
  "ulazTsISO": "2026-07-21T14:42:30+02:00",
  "izlazTsISO": "2026-07-21T14:43:03+02:00",
  "ts": "21.7.2026. 14:42:30",
  "tsISO": "2026-07-21T14:42:30+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 120,
  "izlazMin": 30,
  "ulazTxt": "2 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 240,
  "truckIzlazMin": 90,
  "truckUlazTxt": "4 h",
  "truckIzlazTxt": "1 h 30 min.",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "21.7.2026. 13:17:43",
  "izlazTs": "21.7.2026. 13:17:50",
  "ulazTsISO": "2026-07-21T13:17:43+02:00",
  "izlazTsISO": "2026-07-21T13:17:50+02:00",
  "ts": "21.7.2026. 13:17:43",
  "tsISO": "2026-07-21T13:17:43+02:00"
 }
];
