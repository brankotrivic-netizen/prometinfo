// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": 0,
  "izlazMin": 180,
  "ulazTxt": "Višesatna čekanja",
  "izlazTxt": "3 h",
  "truckUlazMin": null,
  "truckIzlazMin": null,
  "truckUlazTxt": "-",
  "truckIzlazTxt": "-",
  "level": "severe",
  "waitMinutes": 180,
  "ulazTs": "07.08.2026 00:06:56",
  "izlazTs": "07.08.2026 00:07:24",
  "ulazTsISO": "2026-08-07T00:06:56+02:00",
  "izlazTsISO": "2026-08-07T00:07:24+02:00",
  "ts": "07.08.2026 00:06:56",
  "tsISO": "2026-08-07T00:06:56+02:00"
 }
];
