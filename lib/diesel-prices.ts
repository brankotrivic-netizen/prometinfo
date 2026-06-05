// REALNE cene dizla (vir: AMZS - amzs.si/na-poti/cene-goriv-po-evropi). V EUR.
export interface DieselPrice { country: string; name: string; flag: string; eur: number; local: string; date: string }
export const DIESEL_UPDATED = "2. 6. 2026";
export const DIESEL_PRICES: DieselPrice[] = [
 {
  "country": "SI",
  "name": "Slovenija",
  "flag": "🇸🇮",
  "eur": 1.647,
  "local": "",
  "date": "2. 6. 2026"
 },
 {
  "country": "HR",
  "name": "Hrvaška",
  "flag": "🇭🇷",
  "eur": 1.61,
  "local": "",
  "date": "2. 6. 2026"
 },
 {
  "country": "BA",
  "name": "Bosna in Hercegovina",
  "flag": "🇧🇦",
  "eur": 1.63,
  "local": "3,180 BAM",
  "date": "2. 6. 2026"
 },
 {
  "country": "RS",
  "name": "Srbija",
  "flag": "🇷🇸",
  "eur": 1.89,
  "local": "221,680 RSD",
  "date": "2. 6. 2026"
 },
 {
  "country": "ME",
  "name": "Črna gora",
  "flag": "🇲🇪",
  "eur": 1.69,
  "local": "",
  "date": "25. 5. 2026"
 },
 {
  "country": "MK",
  "name": "Severna Makedonija",
  "flag": "🇲🇰",
  "eur": 1.49,
  "local": "92,000 MKD",
  "date": "2. 6. 2026"
 }
];
