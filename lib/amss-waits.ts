// SAMODEJNO ZAJETO: AMSS čakanja na graničnih prelazih (Srbija, amss.org.rs).
// ulaz = vstop v Srbijo, izlaz = izstop iz Srbije. Pogosto splošna MUP ocena.
export interface AmssWait { id: string; name: string; ulazMin: number | null; izlazMin: number | null; ulazTxt: string; izlazTxt: string; text: string; ts: string }
export const AMSS_WAITS: AmssWait[] = [
 {
  "id": "hr-bajakovo",
  "name": "BATROVCI sa Hrvatske strane GP BAJAKOVO Lipovac, na AP E70",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 minuta. 2. Ulaz u Srbiju - oko 30 minuta. Podsećamo da je ovom vremenu zadržavanja potrebno dodati i vreme koje se provodi na hrva",
  "ts": "2026-07-01T20:17:32.775Z"
 },
 {
  "id": "hr-tovarnik",
  "name": "ŠID sa hrvatske strane GP Tovarnik",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - oko 30 min . Podsećamo da je ovom vremenu zadržavanja potrebno dodati i vreme koje se provodi na hrvatskim",
  "ts": "2026-07-01T20:17:32.775Z"
 },
 {
  "id": "hr-batina",
  "name": "BEZDAN ( Srbija- Hrvatska ) M-18",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 minuta. 2. Ulaz u Srbiju - oko 30 minuta. Na TERETNIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - oko 30 min.",
  "ts": "2026-07-01T20:17:32.775Z"
 },
 {
  "id": "ba-raca",
  "name": "SREMSKA RAČA",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama Uprave granične policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - od 30 min. Na TERETNIM terminalima: 1. Izlaz iz Srbije - oko 60 minuta. 2. Ul",
  "ts": "2026-07-01T20:17:32.775Z"
 },
 {
  "id": "rs-kelebija",
  "name": "KELEBIJA Srbija-Mađarska",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije -oko 30 minuta. 2. Ulaz u Srbiju - oko 30 minuta. Podsećamo da je ovom vremenu zadržavanja potrebno dodati i vreme koje se provodi na mađar",
  "ts": "2026-07-01T20:17:32.775Z"
 },
 {
  "id": "rs-horgos",
  "name": "HORGOŠ SRBIJA MAĐARSKA AP A1, E-75",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 minuta. 2. Ulaz u Srbiju - oko 30 minuta. Na TERETNIM terminalima : 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - oko 30 min",
  "ts": "2026-07-01T20:17:32.775Z"
 },
 {
  "id": "rs-presevo",
  "name": "PREŠEVO Srbija - Severna Makedonija AP E 75 M1",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama Uprave granične policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - oko 30 min. Na TERETNIM terminalima 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz ",
  "ts": "2026-07-01T20:17:32.775Z"
 },
 {
  "id": "rs-gostun",
  "name": "GOSTUN Srbija Crna Gora",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama Uprave granične policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije: oko 30 minuta. 2. Ulaz u Srbiju: oko 30 minuta Na TERETNIM terminalima: 1. Izlaz iz Srbije- oko 30 min. 2. Ul",
  "ts": "2026-07-01T20:17:32.775Z"
 },
 {
  "id": "hr-ilok",
  "name": "BAČKA PALANKA sa Hrvatske strane ILOK",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 minuta. 2. Ulaz u Srbiju - oko 30 minuta . Na TERETNIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - oko 30 min",
  "ts": "2026-07-01T20:17:32.775Z"
 },
 {
  "id": "ba-popovi",
  "name": "BADOVINCI (PAVLOVIĆA ĆUPRIJA)",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama Uprave granične policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - oko 30 min. Na TERETNIM terminalima: 1. Izlaz iz Srbije - oko 30 minuta. 2. U",
  "ts": "2026-07-01T20:17:32.775Z"
 },
 {
  "id": "rs-vatin",
  "name": "VATIN",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama Uprave granične Policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 minuta 2. Ulaz u Srbiju - oko 30 minuta. Na TERETNIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2.",
  "ts": "2026-07-01T20:17:32.776Z"
 },
 {
  "id": "hr-erdut",
  "name": "BOGOJEVO, sa hrvatske strane (GP ERDUT)",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 minuta. 2. Ulaz u Srbiju - oko 30 minuta. Na TERETNIM terminalima: 1. Izlaz iz Srbije- oko 30 min. 2. Ulaz u Srbiju- oko 30 min. D",
  "ts": "2026-07-01T20:17:32.777Z"
 },
 {
  "id": "ba-sepak",
  "name": "TRBUŠNICA - LOZNICA",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama Uprave granične policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - oko 30 min. PRIVREMENI TERETNI terminal otvoren je od 9-13h i od 22-6h radnim",
  "ts": "2026-07-01T20:17:32.778Z"
 },
 {
  "id": "ba-karakaj",
  "name": "MALI ZVORNIK",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama Uprave granične policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - oko 30 min. Na TERETNIM terminalima : 1. Izlaz iz Srbije -oko 30 minuta. 2. U",
  "ts": "2026-07-01T20:17:32.778Z"
 },
 {
  "id": "ba-uvac",
  "name": "UVAC - između Srbije (Priboj) i BIH (Rudo-Višegrad)",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama Uprave granične policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - oko 30 min. Radno vreme ovog graničnog prelaza je 00-24č. Novo vreme zadržava",
  "ts": "2026-07-01T20:17:32.778Z"
 },
 {
  "id": "ba-skelani",
  "name": "BAJINA BAŠTA - između Srbije (Bajina Bašta) i BIH (Skelani)",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama Uprave granične policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 30 min. 2. Ulaz u Srbiju - oko 30 min. Na TERETNIM terminalima: 1. Izlaz iz Srbije - oko 30 minuta. 2. U",
  "ts": "2026-07-01T20:17:32.778Z"
 },
 {
  "id": "ba-bratunac",
  "name": "Ljubovija - GP Bratunac, Bratoljub",
  "ulazMin": 15,
  "izlazMin": 15,
  "ulazTxt": "~15 min",
  "izlazTxt": "~15 min",
  "text": "Prema poslednjim informacijama Uprave granične policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije - oko 15 min. 2. Ulaz u Srbiju - oko 15 min. Na TERETNIM terminalima: 1. GP Ljubovija na izlazu - zastoj u odv",
  "ts": "2026-07-01T20:17:32.778Z"
 },
 {
  "id": "ba-vardiste",
  "name": "KOTROMAN - između Srbije i BIH",
  "ulazMin": 30,
  "izlazMin": 30,
  "ulazTxt": "~30 min",
  "izlazTxt": "~30 min",
  "text": "Prema poslednjim informacijama Uprave granične policije RS, zadržavanja na našim graničnim prelazima su: Na PUTNIČKIM terminalima: 1. Izlaz iz Srbije -oko 30 minuta. 2. Ulaz u Srbiju - oko 30 minuta. Na TERETNIM terminalima: 1. Izlaz iz Srbije - oko 30 minuta.",
  "ts": "2026-07-01T20:17:32.778Z"
 }
];
