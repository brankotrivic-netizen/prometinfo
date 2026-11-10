// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-orasje",
  "name": "Županja (Orašje)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 60,
  "truckIzlazMin": null,
  "truckUlazTxt": "1 h",
  "truckIzlazTxt": "-",
  "level": "unknown",
  "waitMinutes": null,
  "ulazTs": "Nema podataka",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "",
  "izlazTsISO": "",
  "ts": "",
  "tsISO": ""
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 120,
  "izlazMin": null,
  "ulazTxt": "2 h",
  "izlazTxt": "-",
  "truckUlazMin": 120,
  "truckIzlazMin": 60,
  "truckUlazTxt": "2 h",
  "truckIzlazTxt": "1 h",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "10.11.2026 11:59:36",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-11-10T11:59:36+02:00",
  "izlazTsISO": "",
  "ts": "10.11.2026 11:59:36",
  "tsISO": "2026-11-10T11:59:36+02:00"
 }
];
