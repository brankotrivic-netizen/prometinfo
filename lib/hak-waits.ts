// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": 180,
  "truckIzlazMin": null,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "08.11.2026 00:19:59",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-11-08T00:19:59+02:00",
  "izlazTsISO": "",
  "ts": "08.11.2026 00:19:59",
  "tsISO": "2026-11-08T00:19:59+02:00"
 }
];
