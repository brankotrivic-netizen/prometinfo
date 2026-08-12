// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-izacic",
  "name": "Ličko Petrovo Selo (Izačić)",
  "ulazMin": 90,
  "izlazMin": null,
  "ulazTxt": "1 h 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 90,
  "ulazTs": "12.8.2026. 5:39:29",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-08-12T05:39:29+02:00",
  "izlazTsISO": "",
  "ts": "12.8.2026. 5:39:29",
  "tsISO": "2026-08-12T05:39:29+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": 30,
  "ulazTxt": "1 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "12.8.2026. 7:14:05",
  "izlazTs": "12.8.2026. 7:14:27",
  "ulazTsISO": "2026-08-12T07:14:05+02:00",
  "izlazTsISO": "2026-08-12T07:14:27+02:00",
  "ts": "12.8.2026. 7:14:05",
  "tsISO": "2026-08-12T07:14:05+02:00"
 }
];
