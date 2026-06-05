/**
 * Register Facebook virov (strani + skupine), kjer ljudje objavljajo stanje
 * na mejnih prehodih. URL-ji so vhod za Apify scraperje.
 *
 * type "page"  -> uradna/portalna stran (admin objavlja, pogosto ze strukturirano)
 * type "group" -> skupnost (uporabniki pisejo; vec suma -> filter + Claude izvlecek)
 *
 * crossingIds: na katere prehode se vir veze ("multi" = vec, doloci se iz besedila).
 */
export interface FbSource {
  name: string;
  url: string;
  type: "page" | "group";
  crossingIds: string[] | "multi";
}

export const FB_SOURCES: FbSource[] = [
  {
    name: "GP Maljevac",
    url: "https://www.facebook.com/GPMaljevac/",
    type: "page",
    crossingIds: ["ba-velika-kladusa"], // Maljevac = HR stran Velike Kladuse
  },
  {
    name: "Granični prelazi: trenutno stanje i ostale nedoumice",
    url: "https://www.facebook.com/groups/1028137413990612/",
    type: "group",
    crossingIds: "multi",
  },
  {
    name: "STANJE NA GRANIČNIM PRELAZIMA",
    url: "https://www.facebook.com/groups/216531478931507/",
    type: "group",
    crossingIds: "multi",
  },
  {
    name: "Zadržavanje na graničnim prelazima Horgoš, Kelebija",
    url: "https://www.facebook.com/groups/720441385070741/",
    type: "group",
    crossingIds: ["rs-horgos", "rs-kelebija"],
  },
];

/** Kljucne besede za filtriranje relevantnih objav v skupinah (proti sumu). */
export const FB_KEYWORDS = [
  "granic", "prelaz", "prijelaz", "gužv", "guzv", "kolon", "čeka", "ceka",
  "zadržav", "zadrzav", "sat", "minut", "ulaz", "izlaz", "carina",
];
