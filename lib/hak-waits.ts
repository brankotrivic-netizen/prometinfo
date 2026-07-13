// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradiska",
  "name": "Gornji Varoš (Gradiška (novi most))",
  "ulazMin": 90,
  "izlazMin": null,
  "ulazTxt": "1 h 30 min.",
  "izlazTxt": "-",
  "truckUlazMin": 180,
  "truckIzlazMin": null,
  "truckUlazTxt": "3 h",
  "truckIzlazTxt": "-",
  "level": "high",
  "waitMinutes": 90,
  "ts": "13.7.2026. 11:28:48",
  "tsISO": "2026-07-13T11:28:48+02:00"
 },
 {
  "id": "ba-doljani",
  "name": "Metković (Doljani)",
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
  "ts": "13.7.2026. 9:57:11",
  "tsISO": "2026-07-13T09:57:11+02:00"
 },
 {
  "id": "",
  "name": "Karasovići (Sutorina)",
  "ulazMin": 60,
  "izlazMin": 60,
  "ulazTxt": "1 h",
  "izlazTxt": "1 h",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "13.7.2026. 12:26:14",
  "tsISO": "2026-07-13T12:26:14+02:00"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 180,
  "izlazMin": null,
  "ulazTxt": "3 h",
  "izlazTxt": "-",
  "truckUlazMin": 240,
  "truckIzlazMin": null,
  "truckUlazTxt": "4 h",
  "truckIzlazTxt": "-",
  "level": "severe",
  "waitMinutes": 180,
  "ts": "13.7.2026. 10:56:58",
  "tsISO": "2026-07-13T10:56:58+02:00"
 }
];
