// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; level: string; waitMinutes: number | null; ts: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-velika-kladusa",
  "name": "Maljevac (Velika Kladuša)",
  "ulazMin": 30,
  "izlazMin": null,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "-",
  "level": "low",
  "waitMinutes": 30,
  "ts": "29.6.2026. 13:24:23"
 },
 {
  "id": "ba-doljani",
  "name": "Metković (Doljani)",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "do 30 min.",
  "izlazTxt": "do 30 min.",
  "level": "low",
  "waitMinutes": 30,
  "ts": "29.6.2026. 11:34:42"
 },
 {
  "id": "",
  "name": "Dvor (Bosanski Novi)",
  "ulazMin": 60,
  "izlazMin": null,
  "ulazTxt": "1 h",
  "izlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "29.6.2026. 12:13:36"
 },
 {
  "id": "ba-kostajnica",
  "name": "Hrvatska Kostajnica (Bosanska Kostajnica)",
  "ulazMin": 60,
  "izlazMin": null,
  "ulazTxt": "1 h",
  "izlazTxt": "-",
  "level": "moderate",
  "waitMinutes": 60,
  "ts": "29.6.2026. 12:02:27"
 },
 {
  "id": "hr-bajakovo",
  "name": "Bajakovo (Batrovci)",
  "ulazMin": null,
  "izlazMin": 30,
  "ulazTxt": "-",
  "izlazTxt": "do 30 min.",
  "level": "low",
  "waitMinutes": 30,
  "ts": "Nema podataka"
 }
];
