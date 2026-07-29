// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "",
  "name": "Gornji Brgat (Ivanica)",
  "ulazMin": 120,
  "izlazMin": 30,
  "ulazTxt": "2 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 120,
  "ulazTs": "29.7.2026. 13:25:06",
  "izlazTs": "29.7.2026. 13:25:49",
  "ulazTsISO": "2026-07-29T13:25:06+02:00",
  "izlazTsISO": "2026-07-29T13:25:49+02:00",
  "ts": "29.7.2026. 13:25:06",
  "tsISO": "2026-07-29T13:25:06+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 60,
  "izlazMin": 30,
  "ulazTxt": "1 h",
  "izlazTxt": "do 30 min.",
  "truckUlazMin": 300,
  "truckIzlazMin": 180,
  "truckUlazTxt": "5 h",
  "truckIzlazTxt": "3 h",
  "level": "moderate",
  "waitMinutes": 60,
  "ulazTs": "29.7.2026. 12:34:47",
  "izlazTs": "29.7.2026. 12:36:15",
  "ulazTsISO": "2026-07-29T12:34:47+02:00",
  "izlazTsISO": "2026-07-29T12:36:15+02:00",
  "ts": "29.7.2026. 12:34:47",
  "tsISO": "2026-07-29T12:34:47+02:00"
 }
];
