// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-izacic",
  "name": "Ličko Petrovo Selo (Izačić)",
  "ulazMin": 60,
  "izlazMin": null,
  "ulazTxt": "1 h",
  "izlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "30.6.2026. 7:23:51",
  "tsISO": "2026-06-30T07:23:51+02:00"
 }
];
