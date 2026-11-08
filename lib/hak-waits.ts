// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-brod",
  "name": "Slavonski Brod (Bosanski Brod)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": 30,
  "truckIzlazMin": null,
  "truckUlazTxt": "do 30 min.",
  "truckIzlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "08.11.2026 17:47:25",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-11-08T17:47:25+02:00",
  "izlazTsISO": "",
  "ts": "08.11.2026 17:47:25",
  "tsISO": "2026-11-08T17:47:25+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 180,
  "truckIzlazMin": 30,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "do 30 min.",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "L: 0 km T: 08.11.2026 21:05:10",
  "izlazTs": "08.11.2026 21:05:52",
  "ulazTsISO": "2026-11-08T21:05:10+02:00",
  "izlazTsISO": "2026-11-08T21:05:52+02:00",
  "ts": "L: 0 km T: 08.11.2026 21:05:10",
  "tsISO": "2026-11-08T21:05:10+02:00"
 }
];
