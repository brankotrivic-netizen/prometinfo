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
  "truckUlazMin": 0,
  "truckIzlazMin": 300,
  "truckUlazTxt": "Višesatna čekanja",
  "truckIzlazTxt": "5 h",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "12.09.2026 20:03:21",
  "izlazTs": "12.09.2026 20:03:14",
  "ulazTsISO": "2026-09-12T20:03:21+02:00",
  "izlazTsISO": "2026-09-12T20:03:14+02:00",
  "ts": "12.09.2026 20:03:21",
  "tsISO": "2026-09-12T20:03:21+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 10,
  "truckIzlazMin": 420,
  "truckUlazTxt": "&gt;10 sati",
  "truckIzlazTxt": "7 h",
  "level": "unknown",
  "waitMinutes": null,
  "ulazTs": "Nema podataka",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "",
  "izlazTsISO": "",
  "ts": "",
  "tsISO": ""
 }
];
