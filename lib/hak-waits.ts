// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-brod",
  "name": "Slavonski Brod (Bosanski Brod)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 30,
  "truckIzlazMin": null,
  "truckUlazTxt": "do 30 min.",
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
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 300,
  "truckIzlazMin": null,
  "truckUlazTxt": "5 h",
  "truckIzlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "27.9.2026. 21:35:00",
  "izlazTs": "27.9.2026. 21:35:12",
  "ulazTsISO": "2026-09-27T21:35:00+02:00",
  "izlazTsISO": "2026-09-27T21:35:12+02:00",
  "ts": "27.9.2026. 21:35:00",
  "tsISO": "2026-09-27T21:35:00+02:00"
 }
];
