// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-orasje",
  "name": "Županja (Orašje)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "20.08.2026 05:42:13",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-08-20T05:42:13+02:00",
  "izlazTsISO": "",
  "ts": "20.08.2026 05:42:13",
  "tsISO": "2026-08-20T05:42:13+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 120,
  "izlazMin": 30,
  "ulazTxt": "2 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 120,
  "truckIzlazMin": null,
  "truckUlazTxt": "2 h",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "20.08.2026 04:02:04",
  "izlazTs": "20.08.2026 04:02:18",
  "ulazTsISO": "2026-08-20T04:02:04+02:00",
  "izlazTsISO": "2026-08-20T04:02:18+02:00",
  "ts": "20.08.2026 04:02:04",
  "tsISO": "2026-08-20T04:02:04+02:00"
 }
];
