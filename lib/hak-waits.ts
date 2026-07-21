// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "",
  "name": "Karasovići (Sutorina)",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "Nema podataka",
  "izlazTs": "21.07.2026 11:54:54",
  "ulazTsISO": "",
  "izlazTsISO": "2026-07-21T11:54:54+02:00",
  "ts": "21.07.2026 11:54:54",
  "tsISO": "2026-07-21T11:54:54+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": 60,
  "ulazTxt": "1 h",
  "izlazTxt": "1 h",
  "truckUlazMin": 240,
  "truckIzlazMin": 60,
  "truckUlazTxt": "4 h",
  "truckIzlazTxt": "1 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "21.07.2026 10:31:24",
  "izlazTs": "21.07.2026 10:31:18",
  "ulazTsISO": "2026-07-21T10:31:24+02:00",
  "izlazTsISO": "2026-07-21T10:31:18+02:00",
  "ts": "21.07.2026 10:31:24",
  "tsISO": "2026-07-21T10:31:24+02:00"
 }
];
