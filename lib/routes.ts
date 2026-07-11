import type { Country } from "./types";

/**
 * Preseti poti ("Moja pot"): za vsako pot povemo, kateri mejni prehodi so
 * relevantni — priporoceni / alternativni / izogni se — ter drzave za gorivo.
 * ID-ji prehodov se ujemajo z lib/crossings.ts. Schengen poti (SI<->HR) nimajo
 * mejne kontrole, zato note in prazni prehodi.
 */
export interface RoutePreset {
  id: string;
  from: string;
  to: string;
  recommended: string[];   // crossingId
  alternative: string[];
  avoid: string[];
  fuelCountries: Country[]; // drzave na poti (za gorivo)
  note?: string;            // npr. Schengen / opomba o poti
}

export const ROUTE_PRESETS: RoutePreset[] = [
  {
    id: "kamnik-banja-luka", from: "Kamnik", to: "Banja Luka",
    // samo trije prehodi po zelenem vrstnem redu: Gradiška → Gradina → Dubica
    recommended: ["ba-gradiska"], alternative: ["ba-gradina", "ba-kozarska-dubica"], avoid: [],
    fuelCountries: ["HR", "BA"],
  },
  {
    id: "kamnik-sarajevo", from: "Kamnik", to: "Sarajevo",
    recommended: ["ba-brod"], alternative: ["ba-gradiska", "ba-samac"], avoid: ["ba-kostajnica"],
    fuelCountries: ["HR", "BA"],
  },
  {
    id: "kamnik-beograd", from: "Kamnik", to: "Beograd",
    recommended: ["hr-bajakovo"], alternative: ["hr-tovarnik"], avoid: [],
    fuelCountries: ["HR", "RS"],
  },
  {
    id: "kamnik-makarska", from: "Kamnik", to: "Makarska",
    recommended: [], alternative: [], avoid: [],
    fuelCountries: ["HR"], note: "Pot poteka po Hrvaški (Schengen) — ni mejne kontrole. Preveri le gostoto prometa na A1.",
  },
  {
    id: "kamnik-split", from: "Kamnik", to: "Split",
    recommended: [], alternative: [], avoid: [],
    fuelCountries: ["HR"], note: "Po Hrvaški (Schengen) — ni mejne kontrole. Preveri gostoto na A1.",
  },
  {
    id: "ljubljana-zagreb", from: "Ljubljana", to: "Zagreb",
    recommended: [], alternative: [], avoid: [],
    fuelCountries: ["HR"], note: "Obrežje/Bregana je v Schengnu — ni sistematične kontrole.",
  },
  {
    id: "ljubljana-beograd", from: "Ljubljana", to: "Beograd",
    recommended: ["hr-bajakovo"], alternative: ["hr-tovarnik"], avoid: [],
    fuelCountries: ["HR", "RS"],
  },
  {
    id: "ljubljana-split", from: "Ljubljana", to: "Split",
    recommended: [], alternative: [], avoid: [],
    fuelCountries: ["HR"], note: "Po Hrvaški (Schengen) — ni mejne kontrole.",
  },
  {
    id: "ljubljana-dubrovnik", from: "Ljubljana", to: "Dubrovnik",
    recommended: [], alternative: [], avoid: [],
    fuelCountries: ["HR"], note: "Pelješki most obide Neum — pot je po Hrvaški (Schengen), brez mejne kontrole.",
  },
  {
    id: "ljubljana-budva", from: "Ljubljana", to: "Budva",
    recommended: [], alternative: ["ba-klobuk", "ba-zupci"], avoid: [],
    fuelCountries: ["HR", "ME"], note: "Vstop v Črno goro pri Karasovićih/Debeli Brijeg (HR→ME); ta prehod še ni v bazi — preveri uradni vir.",
  },
  {
    id: "ljubljana-skopje", from: "Ljubljana", to: "Skopje",
    recommended: ["hr-bajakovo"], alternative: ["hr-tovarnik"], avoid: [],
    fuelCountries: ["HR", "RS", "MK"], note: "Prek Srbije; vstop v S. Makedonijo pri Preševu/Tabanovcih.",
  },
  {
    id: "ljubljana-ohrid", from: "Ljubljana", to: "Ohrid",
    recommended: ["hr-bajakovo"], alternative: ["hr-tovarnik"], avoid: [],
    fuelCountries: ["HR", "RS", "MK"], note: "Prek Srbije in S. Makedonije (Preševo/Tabanovce), nato proti Ohridu.",
  },
];
