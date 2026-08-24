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
    "title": "Čajdraš-Ovnak",
    "text": "Na lokalitetu Jagodića u toku su sanacioni radovi, zbog čega se u vremenu od 7 do 16 sati saobraća usporeno, jednom trakom."
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
    "title": "Zavidovići-Kamenica",
    "text": "Zbog sanacije kolovoza svakog radnog dana od 7 do 16 sati saobraća se usporeno, uz povremene obustave."
   },
   {
    "title": "Bare-Hrenovica",
    "text": "Na regionalnoj cesti R-448 Goražde-Hrenovica (Bare-Hrenovica), zbog asfaltiranje od 08 do 18 sati vozila će saobraćati uspotreno, jednom trakom, uz moguće obustave ne duže od 1 sat. Dana 21.08. biće na snazi potpuna obustava za teretni saobraćaj."
   },
   {
    "title": "Rudo-Granični prelaz Uvac",
    "text": "Zbog oštećenja mosta, zabranjen je saobraćaj za teretna vozila i autobuse, dok je za putnička vozila brzina kretanja na mostu ograničena na 20 km/h."
   }
  ]
 }
];
