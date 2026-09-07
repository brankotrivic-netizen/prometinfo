// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-samac",
  "name": "Slavonski Šamac (Bosanski Šamac)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 90,
  "truckIzlazMin": null,
  "truckUlazTxt": "1 h 30 min.",
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
  "izlazMin": 30,
  "ulazTxt": "2 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 360,
  "truckIzlazMin": null,
  "truckUlazTxt": "6 h",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "7.9.2026. 15:23:50",
  "izlazTs": "7.9.2026. 15:26:58",
  "ulazTsISO": "2026-09-07T15:23:50+02:00",
  "izlazTsISO": "2026-09-07T15:26:58+02:00",
  "ts": "7.9.2026. 15:23:50",
  "tsISO": "2026-09-07T15:23:50+02:00"
 }
];
