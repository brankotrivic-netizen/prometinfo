// SAMODEJNO ZAJETO: zive cakalne dobe na mejnih prehodih (HAK / MUP RH).
// Objavljeni le prehodi s trenutnim cakanjem. ulaz=vstop v HR, izlaz=izstop iz HR (osebna vozila).
export interface HakWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; truckUlazMin: number | null; truckIzlazMin: number | null; truckUlazTxt: string; truckIzlazTxt: string; level: string; waitMinutes: number | null; ulazTs: string; izlazTs: string; ulazTsISO: string; izlazTsISO: string; ts: string; tsISO: string }
export const HAK_WAITS: HakWait[] = [
 {
  "id": "ba-gradina",
  "name": "Jasenovac (Donja Gradina)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 300,
  "truckIzlazMin": null,
  "truckUlazTxt": "5 h",
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
  "id": "hr-tovarnik",
  "name": "Tovarnik (Šid)",
  "ulazMin": null,
  "izlazMin": null,
  "ulazTxt": "-",
  "izlazTxt": "-",
  "truckUlazMin": 420,
  "truckIzlazMin": null,
  "truckUlazTxt": "7 h",
  "truckIzlazTxt": "-",
  "level": "unknown",
  "waitMinutes": null,
  "ulazTs": "Nema podataka",
  "izlazTs": "Nema podataka",
  "ulazTsISO": "",
  "izlazTsISO": "",
  "ts": "",
  "tsISO": ""
 }
];
