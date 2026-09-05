// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": null,
  "ulazTxt": "1 h",
  "izlazTxt": "-",
  "truckUlazMin": 180,
  "truckIzlazMin": null,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "5.9.2026. 18:00:39",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-09-05T18:00:39+02:00",
  "izlazTsISO": "",
  "ts": "5.9.2026. 18:00:39",
  "tsISO": "2026-09-05T18:00:39+02:00"
 }
];
