// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-velika-kladusa",
  "name": "Maljevac (Velika Kladuša)",
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
  "ulazTs": "5.9.2026. 15:57:37",
  "izlazTs": "5.9.2026. 15:57:45",
  "ulazTsISO": "2026-09-05T15:57:37+02:00",
  "izlazTsISO": "2026-09-05T15:57:45+02:00",
  "ts": "5.9.2026. 15:57:37",
  "tsISO": "2026-09-05T15:57:37+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": 30,
  "ulazTxt": "1 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 180,
  "truckIzlazMin": null,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "5.9.2026. 18:00:39",
  "izlazTs": "5.9.2026. 14:12:03",
  "ulazTsISO": "2026-09-05T18:00:39+02:00",
  "izlazTsISO": "2026-09-05T14:12:03+02:00",
  "ts": "5.9.2026. 18:00:39",
  "tsISO": "2026-09-05T18:00:39+02:00"
 }
];
