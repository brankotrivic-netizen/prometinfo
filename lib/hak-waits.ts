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
  "ulazTs": "12.9.2026. 17:17:38",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-09-12T17:17:38+02:00",
  "izlazTsISO": "",
  "ts": "12.9.2026. 17:17:38",
  "tsISO": "2026-09-12T17:17:38+02:00"
 },
 {
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": 10,
  "truckIzlazMin": 420,
  "truckUlazTxt": "&gt;10 sati",
  "truckIzlazTxt": "7 h",
  "level": "low",
  "waitMinutes": 30,
  "ulazTs": "12.9.2026. 15:36:21",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "2026-09-12T15:36:21+02:00",
  "izlazTsISO": "",
  "ts": "12.9.2026. 15:36:21",
  "tsISO": "2026-09-12T15:36:21+02:00"
 }
];
