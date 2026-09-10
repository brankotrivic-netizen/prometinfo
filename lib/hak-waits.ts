// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": 30,
  "ulazTxt": "1 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 420,
  "truckIzlazMin": 120,
  "truckUlazTxt": "7 h",
  "truckIzlazTxt": "2 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "10.09.2026 22:21:51",
  "izlazTs": "10.09.2026 22:21:40",
  "ulazTsISO": "2026-09-10T22:21:51+02:00",
  "izlazTsISO": "2026-09-10T22:21:40+02:00",
  "ts": "10.09.2026 22:21:51",
  "tsISO": "2026-09-10T22:21:51+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 0,
  "truckIzlazMin": 240,
  "truckUlazTxt": "Višesatna čekanja",
  "truckIzlazTxt": "4 h",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "Nema podataka",
  "izlazTs": "10.09.2026 22:22:57",
  "ulazTsISO": "",
  "izlazTsISO": "2026-09-10T22:22:57+02:00",
  "ts": "10.09.2026 22:22:57",
  "tsISO": "2026-09-10T22:22:57+02:00"
 }
];
