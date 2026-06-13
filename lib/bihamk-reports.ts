// SAMODEJNO ZAJETO: BIHAMK stanje na cestah (BiH, bihamk.ba/spi).
export interface BihReportGroup { label: string; items: { title: string; text: string }[] }
export const BIHAMK_REPORTS: BihReportGroup[] = [
 {
  "label": "Autoceste",
  "items": [
   {
    "title": "Podlugovi-Sarajevo sjever",
    "text": "Zbog izgradnje bukobrana na mjestu radova saobraća se preticajnom trakom."
   },
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
    "title": "Dobro Polje-Miljevina",
    "text": "15. 05. 2026. godine - Kako smo upravo obaviješteni, od danas je počelo saobraćanje vozila do 3,5 tone na magistralnoj cesti Dobro Polje-Miljevina. Za vozila preko 3,5 tone i dalje je na snazi zabrana, pa moraju i dalje koristiti alternativne pravce."
   },
   {
    "title": "Jablanica-Blidinje",
    "text": "Dozvoljen je saobraćaj za vozila do 3,5 tone, dok je za vozila preko 3,5 t saobraćaj i dalje obustavljen."
   },
   {
    "title": "Bihać-Cazin (u gradu Bihać)",
    "text": "Zbog radova na izgradnji pješačke staze,saobraća se usporeno, naizmjeničnim propuštanjem vozila uz ručnu regulaciju saobraćaja."
   },
   {
    "title": "M-4.3 Bužim-Brigovi",
    "text": "Zbog radova na sanaciji klizišta saobraća se usporeno, jednom trakom naizmjenično."
   },
   {
    "title": "Granični prijelaz Izačić- Bihać",
    "text": "Izvode se radovi na rekonstrukciji mosta preko potoka Mrižnica. Vozila se preusmjeravaju na privremenu obilazinicu (bajpas) u neposrednoj blizini radova, naizmjeničnim propuštanjem."
   },
   {
    "title": "Tuzla-Bijeljina (Banj brdo)",
    "text": "Na dionici Simin Han-Lopare (Banj brdo) zbog sanacionih radova putnička vozila saobraćaju naizmjenično, jednom trakom, dok teretna vozila preko 3,5 t i autobusi saobraćaju pravcem Simin Han-Lopare-Priboj."
   },
   {
    "title": "Ozimica-Topčić Polje (Papratnica",
    "text": "Zbog radova na rekonstrukciji raskrsnice na M-17 Ozimica-Topčić Polje na lokalitetu Papratnica svaki dan, osim nedjelje) od 07 do 16:30 sati saobraća se jednom trakom, naizmjenično."
   },
   {
    "title": "Kupres",
    "text": "Zbog radova na izgradnji kružne raskrsnice na M-16 u Kupresu, na spoju ulica Slavonske i Splitske, saobraća se usporeno, jednom trakom."
   },
   {
    "title": "Srbac-Derventa",
    "text": "U toku su sanacioni radovi, zbog čega je do kraja juna planirana obustava saobraćaja. Za vrijeme obustave vozila se preusmjeravaju na alternativni pravac Srbac-Prnjavor-Derventa."
   },
   {
    "title": "Konjic-Jablanica",
    "text": "U toku su radovi na zamjeni dilatacije na Ribićkom mostu, u dužini od 20m saobraća se usporeno-jednom trakom"
   },
   {
    "title": "Bihać-Ripač (Orljani)",
    "text": "Zbog radova na sanaciji nadvožnjaka na lokalitetu Orljani na magistralnoj cesti Bihać-Ripač, zatvoreno je skretanje sa magistralne ceste prema naselju Ribić-Orljani."
   },
   {
    "title": "Lanište (Ključ-Bosanski Petrovac",
    "text": "Zbog radova na redovnom održavanju na području Laništa na magistralnoj cesti Ključ-Bosanski Petrovac, na mjestu radova od 07 do 07 sati (osim vikenda) vozila saobraćaju naizmjenično, jednom trakom."
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
    "title": "Gračanica-Srnice",
    "text": "Zbog sanacije kolovoza, saobraća se usporeno, jednom trakom uz postavljenu signalizaciju. Zbog održavanja sportske manifestacije danas 22.05.u vremenu od 16:45 do 17:30 sati, doći će do obustave saobraćaja na regionalnoj cesti Gračanica-Srnice (od raskrsnice do Šumarije)."
   },
   {
    "title": "Ulaz u naselje Lokve",
    "text": "Zbog sanacije kolovoza, saobraća se usporeno, jednom trakom uz postavljenu signalizaciju u vremenu od 07:00 do 16:00 sati."
   },
   {
    "title": "Čajdraš-Ovnak (Pojske)",
    "text": "Zbog radova na asfaltiranju danas (13.06.) od 07 do 18 sati saobraćaj će biti obustavljen na regionalnoj cesti Čajdraš-Ovnak (lokalitet Pojske). Putnička vozila mogu koristiti lokalni put preko naselja Konjevići, a teretna regionalnu cestu Zenica-Vjetrenice-Vitez."
   },
   {
    "title": "Rudo-Granični prelaz Uvac",
    "text": "Zbog oštećenja mosta, zabranjen je saobraćaj za teretna vozila i autobuse, dok je za putnička vozila brzina kretanja na mostu ograničena na 20 km/h."
   }
  ]
 }
];
