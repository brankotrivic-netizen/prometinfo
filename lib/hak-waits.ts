// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-izacic",
  "name": "Ličko Petrovo Selo (Izačić)",
  "ulazMin": 60,
  "izlazMin": null,
  "ulazTxt": "1 h",
  "izlazTxt": "-",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "13.8.2026. 8:43:42",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-08-13T08:43:42+02:00",
  "izlazTsISO": "",
  "ts": "13.8.2026. 8:43:42",
  "tsISO": "2026-08-13T08:43:42+02:00"
 },
 {
  "id": "",
  "name": "Gornji Brgat (Ivanica)",
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
  "ulazTs": "13.8.2026. 7:48:35",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-08-13T07:48:35+02:00",
  "izlazTsISO": "",
  "ts": "13.8.2026. 7:48:35",
  "tsISO": "2026-08-13T07:48:35+02:00"
 }
];
