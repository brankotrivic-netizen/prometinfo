// SAMODEJNO ZAJETO: BIHAMK stanje na cestah (BiH, bihamk.ba/spi).
export interface BihReportGroup { label: string; items: { title: string; text: string }[] }
export const BIHAMK_REPORTS: BihReportGroup[] = [
 {
  "label": "Autoceste",
  "items": [
   {
    "title": "Kakanj-Lašva",
    "text": "Zbog izvođenja radova na sanaciji kolovoza na dionici autoceste A-1 Kakanj-Lašva, u dužini od 3 km zatvorena je lijeva strana autoceste. Za vrijeme radova vozila se usmjeravaju dvosmjerno-desnom stranom, smjer Lašva-Kakanj."
   },
   {
    "title": "Sarajevo zapad-Lepenica",
    "text": "Zbog izvođenja neophodnih radova na A-1 Sarajevo zapad-Lepenica, saobraćaj je preusmjeren u preticajnu traku."
   }
  ]
 },
 {
  "label": "Magistralne ceste",
  "items": [
   {
    "title": "Tuzla-Bijeljina (Banj brdo)",
    "text": "Na dionici Simin Han-Lopare (Banj brdo) zbog sanacionih radova putnička vozila saobraćaju naizmjenično, jednom trakom, dok teretna vozila preko 3,5 t i autobusi saobraćaju pravcem Simin Han-Lopare-Priboj."
   },
   {
    "title": "Ozimica-Topčić Polje (Papratnica)",
    "text": "Zbog radova na rekonstrukciji raskrsnice na M-17 Ozimica-Topčić Polje na lokalitetu Papratnica svaki dan, osim nedjelje) od 07 do 16:30 sati saobraća se jednom trakom, naizmjenično."
   },
   {
    "title": "Podromanija-Sumbulovac (prevoj Romanija)",
    "text": "Zbog radova na izgradnji dodatne trake za spora vozila na magistralnom putu Podromanija-Sumbulovac, prevoj Romanija (uspon iz pravca Podromanije) dolazit će do povremenih obustava saobraćaja."
   },
   {
    "title": "Crna Rijeka- Jajce (Podmilačje)",
    "text": "Zbog izvođenja radova obustavljen je saobraćaj za sva vozila na magistralnoj cesti Jajce–Crna Rijeka, u naselju Podmilačje. Za vrijeme obustave, vozila će biti preusmjeravana alternativnim pravcem preko Mrkonjić Grada."
   },
   {
    "title": "Bugojno-Novi Travnik",
    "text": "U toku su sanacioni radovi na Rostovu, zbog čega se svakim radnim danom od 07 do 16:30 sati saobraća usporeno, naizmjeničnim propuštanjem vozila."
   },
   {
    "title": "Jablanica-Blidinje",
    "text": "Dozvoljen je saobraćaj za vozila do 3,5 tone, dok je za vozila preko 3,5 t saobraćaj i dalje obustavljen."
   },
   {
    "title": "Dobro Polje-Miljevina",
    "text": "15. 05. 2026. godine - Kako smo upravo obaviješteni, od danas je počelo saobraćanje vozila do 3,5 tone na magistralnoj cesti Dobro Polje-Miljevina. Za vozila preko 3,5 tone i dalje je na snazi zabrana, pa moraju i dalje koristiti alternativne pravce."
   },
   {
    "title": "Brod na Drini-GP Hum/Šćepan Polje",
    "text": "Zbog brojnih odrona i opasnosti od klizišta na magistralnom putu Brod na Drini-GP Hum/Šćepan Polje putnička vozila saobraćaju otežano, dok teretna ne mogu proći."
   },
   {
    "title": "Bileća-Trebinje",
    "text": "Na lokalitetu Žudojevići u toku su radovi na sananaciji kosina, zbog čega se saobraća usporeno, jednom trakom (u dužini 300 m)."
   }
  ]
 },
 {
  "label": "Regionalne ceste",
  "items": [
   {
    "title": "Zenica-Lašva",
    "text": "Zbog sanacionih radova na regionalnoj cesti Zenica-Lašva od 08 do 17 sati, svaki dan osim nedjelje, saobraća se usporeno, jednom trakom."
   },
   {
    "title": "Svatovac-Živinice (Poljice)",
    "text": "Na regionalnoj cesti R-455a Svatovac-Živinice (u mjestu Poljice, od stadiona do Svatovca), za vrijeme radova moguće su kraće obustave saobraćaja."
   },
   {
    "title": "Kalesija-Sapna",
    "text": "Na regionalnoj cesti R-456a Kalesija-Sapna zbog sanacionih radova svakog dana (osim nedjelje) u vremenu od 7 do 17 sati saobraća se usporeno, naizmjeničnim propuštanjem vozila."
   },
   {
    "title": "Gračanica-Srnice",
    "text": "U mjestu Bukva izvode se radovi zbog čega se u vremenu od 7 do 17 sati saobraća usporeno, jednom trakom."
   },
   {
    "title": "Šibošnica-Lovački dom",
    "text": "Na regionalnoj cesti R-459 Šibošnica-Lovački dom zbog sanacionih radova od 07 do 17 sati saobraća se usporeno, jednom trakom svaki dan osim nedjelje."
   },
   {
    "title": "Priboj–Sapna",
    "text": "Na regionalnoj cesti R-456 Priboj–Sapna zbog sanacionih radova svakog dana (osim nedjelje) u vremenu od 7 do 17 sati saobraća se usporeno, naizmjeničnim propuštanjem vozila."
   },
   {
    "title": "Hadžići-Donja Grkarica",
    "text": "Na regionalnoj cesti R-442a Hadžići-Donja Grkarica (dionica od spoja sa lokalnom cestom za Igmansku džamiju do kružne raskrsnice kod Doma policije), zbog sanacionih radova saobraća se usporeno, jednom trakom."
   },
   {
    "title": "Bare-Hrenovica",
    "text": "Na regionalnoj cesti R-448 Goražde-Hrenovica (Bare-Hrenovica), zbog asfaltiranje od 08 do 18 sati vozila će saobraćati uspotreno, jednom trakom, uz moguće obustave ne duže od 1 sat. Dana 21.08. biće na snazi potpuna obustava za teretni saobraćaj."
   },
   {
    "title": "Tomislavgrad-Blidinje",
    "text": "Danas i naredna dva dana (26., 27. i 28.08.) zbog sanacionih radova obustavljen je saobraćaj na regionalnoj cesti Tomislavgrad-Blidinje."
   },
   {
    "title": "Obustava saobraćaja na Bjelašnici, zbog auto-trke",
    "text": "Zbog održavanja auto trke na regionalnoj cesti R-442b (od skretanja prema Bjelašnici sa regionalne ceste koja vodi prema Dejčićima parkinga ispred hotela Maršal), obustavit će se saobraćaj u vremenu od 10 do 17:30 sati."
   },
   {
    "title": "Rudo-Granični prelaz Uvac",
    "text": "Zbog oštećenja mosta, zabranjen je saobraćaj za teretna vozila i autobuse, dok je za putnička vozila brzina kretanja na mostu ograničena na 20 km/h."
   }
  ]
 }
];
