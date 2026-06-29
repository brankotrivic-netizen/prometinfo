// Socialni signali — VARNO: brez scrapinga Facebooka. Samo generiranje iskalnih
// povezav (uporabnik odpre ročno) + ročni vnos + staranje. Brez tokenov, brez
// osebnih podatkov. Uradni viri imajo prednost; socialni signal je le namig.

export const SOCIAL_KEYWORDS = [
  "gužva", "zastoj", "granica", "granični prelaz", "čeka se", "kolona",
  "kilometarska kolona", "zadržavanje", "ulaz u Hrvatsku", "izlaz iz Hrvatske",
  "ulaz u BiH", "izlaz iz BiH", "vstop v Slovenijo", "izstop iz Slovenije",
  "zastoji na meji",
];

// Znane FB strani/skupine (odpre se ročno). Uporabnik lahko doda svoje v Nastavitvah.
export const SOCIAL_PAGES: { name: string; url: string }[] = [
  { name: "FB iskanje: gužve na granicama", url: "https://www.facebook.com/search/posts/?q=gu%C5%BEve%20na%20granici" },
  { name: "FB iskanje: stanje na granicama", url: "https://www.facebook.com/search/posts/?q=stanje%20na%20granicama" },
];

// Posebne poizvedbe na prehod (po želji); sicer se generirajo iz imena + ključnih besed.
export const SOCIAL_QUERIES: Record<string, string[]> = {
  "ba-gradiska": ["Gradiška granica gužva", "Stara Gradiška granični prelaz čeka se", "Gradiška novi most zastoj", "ulaz u BiH Gradiška"],
  "ba-brod": ["Brod granica gužva", "Slavonski Brod granični prelaz kolona", "ulaz u BiH Brod"],
  "hr-bajakovo": ["Bajakovo granica gužva", "Batrovci kolona", "ulaz u Hrvatsku Bajakovo"],
  "ba-izacic": ["Izačić granica gužva", "Ličko Petrovo Selo kolona"],
  "si-obrezje": ["Obrežje gužva", "Bregana kolona", "izstop iz Slovenije Obrežje"],
  "si-karavanke": ["Karavanke zastoj", "predor Karavanke kolona"],
};
