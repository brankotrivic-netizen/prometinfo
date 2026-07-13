// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-brod",
  "name": "Slavonski Brod (Bosanski Brod)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 120,
  "truckIzlazMin": null,
  "truckUlazTxt": "2 h",
  "truckIzlazTxt": "-",
  "level": "unknown",
  "waitMinutes": null,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "ba-gradina",
  "name": "Jasenovac (Donja Gradina)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 360,
  "truckIzlazMin": null,
  "truckUlazTxt": "6 h",
  "truckIzlazTxt": "-",
  "level": "unknown",
  "waitMinutes": null,
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "ba-samac",
  "name": "Slavonski Šamac (Bosanski Šamac)",
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
  "ts": "Nema podataka",
  "tsISO": ""
 },
 {
  "id": "hr-batina",
  "name": "Batina (Bezdan)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 0,
  "truckIzlazMin": null,
  "truckUlazTxt": "Višesatna čekanja",
  "truckIzlazTxt": "-",
  "level": "unknown",
  "waitMinutes": null,
  "ts": "Nema podataka",
  "tsISO": ""
 }
];
