// SAMODEJNO ZAJETO s HAK (m.hak.hr, windows-1250) + geokodirano (OSM/Nominatim).
// Globoka povezava: https://m.hak.hr/kamera.asp?g=<g>&k=<k>. Koordinate PRIBLIZNE.
export interface RoadCam { k: number; name: string; lat: number | null; lng: number | null }
export interface RoadGroup { g: number; name: string; cams: RoadCam[] }
export const hakRoadLink = (g: number, k: number) => `https://m.hak.hr/kamera.asp?g=${g}&k=${k}`;
export const HAK_ROADS: RoadGroup[] = [
 {
  "g": 1,
  "name": "A1 Zagreb–Split–Dubrovnik",
  "cams": [
   {
    "k": 15,
    "name": "Lučko",
    "lat": 45.76109,
    "lng": 15.88395
   },
   {
    "k": 53,
    "name": "Demerje",
    "lat": 45.73188,
    "lng": 15.88288
   },
   {
    "k": 161,
    "name": "Zdenčina",
    "lat": 45.68396,
    "lng": 15.75096
   },
   {
    "k": 54,
    "name": "Jastrebarsko",
    "lat": 45.67166,
    "lng": 15.65039
   },
   {
    "k": 12,
    "name": "Karlovac",
    "lat": 45.48925,
    "lng": 15.54863
   },
   {
    "k": 51,
    "name": "Drežnik",
    "lat": 45.29166,
    "lng": 17.47007
   },
   {
    "k": 50,
    "name": "Dobra",
    "lat": 45.34613,
    "lng": 15.28925
   },
   {
    "k": 61,
    "name": "Novigrad",
    "lat": 45.31592,
    "lng": 13.56303
   },
   {
    "k": 63,
    "name": "Vukova Gorica",
    "lat": 45.44942,
    "lng": 15.33927
   },
   {
    "k": 70,
    "name": "Bosiljevo 1",
    "lat": 45.41169,
    "lng": 15.28941
   },
   {
    "k": 257,
    "name": "Ogulin",
    "lat": 45.26586,
    "lng": 15.22552
   },
   {
    "k": 130,
    "name": "Modruš",
    "lat": 45.14894,
    "lng": 15.24674
   },
   {
    "k": 71,
    "name": "Mala Kapela",
    "lat": 44.83333,
    "lng": 15.38333
   },
   {
    "k": 72,
    "name": "Brinje",
    "lat": 44.99981,
    "lng": 15.13127
   },
   {
    "k": 73,
    "name": "Žuta Lokva",
    "lat": 44.97023,
    "lng": 15.06411
   },
   {
    "k": 247,
    "name": "Otočac",
    "lat": 44.8688,
    "lng": 15.23587
   },
   {
    "k": 81,
    "name": "Perušić",
    "lat": 44.65002,
    "lng": 15.38326
   },
   {
    "k": 79,
    "name": "Gospić",
    "lat": 44.5464,
    "lng": 15.37542
   },
   {
    "k": 80,
    "name": "Gornja Ploča",
    "lat": 44.46051,
    "lng": 15.64922
   },
   {
    "k": 94,
    "name": "Sveti Rok čvor",
    "lat": null,
    "lng": null
   },
   {
    "k": 258,
    "name": "Krpani",
    "lat": 44.54223,
    "lng": 15.39936
   },
   {
    "k": 34,
    "name": "Sveti Rok sjever",
    "lat": 44.36146,
    "lng": 15.65363
   },
   {
    "k": 268,
    "name": "Sveti Rok jug",
    "lat": 44.36146,
    "lng": 15.65363
   },
   {
    "k": 248,
    "name": "Baričević",
    "lat": 44.25134,
    "lng": 15.60282
   },
   {
    "k": 249,
    "name": "Serpentina",
    "lat": null,
    "lng": null
   },
   {
    "k": 250,
    "name": "Božići 1",
    "lat": 45.95445,
    "lng": 15.79091
   },
   {
    "k": 251,
    "name": "Božići 2",
    "lat": 45.95445,
    "lng": 15.79091
   },
   {
    "k": 235,
    "name": "Rovanjska (Maslenica)",
    "lat": 44.25158,
    "lng": 15.53905
   },
   {
    "k": 74,
    "name": "Maslenica",
    "lat": 44.22144,
    "lng": 15.54514
   },
   {
    "k": 75,
    "name": "Posedarje",
    "lat": 44.21117,
    "lng": 15.4777
   },
   {
    "k": 236,
    "name": "Zadar centar (Zadar 1)",
    "lat": 44.18932,
    "lng": 15.43434
   },
   {
    "k": 237,
    "name": "Zadar istok (Zadar 2)",
    "lat": 44.11686,
    "lng": 15.23533
   },
   {
    "k": 78,
    "name": "Benkovac",
    "lat": 44.03336,
    "lng": 15.61285
   },
   {
    "k": 131,
    "name": "Pirovac",
    "lat": 43.81694,
    "lng": 15.66787
   },
   {
    "k": 244,
    "name": "Prokljan",
    "lat": 43.83661,
    "lng": 15.85657
   },
   {
    "k": 238,
    "name": "Mokrice",
    "lat": 45.99628,
    "lng": 15.89812
   },
   {
    "k": 84,
    "name": "Skradin",
    "lat": 43.81785,
    "lng": 15.92332
   },
   {
    "k": 259,
    "name": "Krka",
    "lat": 45.0902,
    "lng": 14.54967
   },
   {
    "k": 260,
    "name": "Draga",
    "lat": 45.43897,
    "lng": 17.62616
   },
   {
    "k": 83,
    "name": "Šibenik",
    "lat": 43.73406,
    "lng": 15.89448
   },
   {
    "k": 239,
    "name": "Dubrava",
    "lat": 45.83744,
    "lng": 16.53816
   },
   {
    "k": 240,
    "name": "Dabar",
    "lat": 43.83196,
    "lng": 16.55467
   },
   {
    "k": 85,
    "name": "Vrpolje",
    "lat": 45.21024,
    "lng": 18.40528
   },
   {
    "k": 261,
    "name": "Pištet",
    "lat": 43.68636,
    "lng": 16.06996
   },
   {
    "k": 262,
    "name": "Ljubeč",
    "lat": 43.62555,
    "lng": 16.22603
   },
   {
    "k": 263,
    "name": "Kesića Draga",
    "lat": 43.62613,
    "lng": 16.23663
   },
   {
    "k": 264,
    "name": "Gajina",
    "lat": 44.19239,
    "lng": 15.55771
   },
   {
    "k": 265,
    "name": "Bejići",
    "lat": 43.60407,
    "lng": 16.32117
   },
   {
    "k": 266,
    "name": "Rodine Glavice",
    "lat": 43.59329,
    "lng": 16.35047
   },
   {
    "k": 234,
    "name": "Vučevica",
    "lat": 43.60127,
    "lng": 16.40842
   },
   {
    "k": 103,
    "name": "Dugopolje",
    "lat": 44.33464,
    "lng": 16.1997
   },
   {
    "k": 104,
    "name": "Bisko",
    "lat": 43.58125,
    "lng": 16.6816
   },
   {
    "k": 232,
    "name": "Blato na Cetini",
    "lat": 43.48004,
    "lng": 16.84473
   },
   {
    "k": 105,
    "name": "Šestanovac",
    "lat": 43.45362,
    "lng": 16.91205
   },
   {
    "k": 86,
    "name": "Zagvozd",
    "lat": 43.39733,
    "lng": 17.05613
   },
   {
    "k": 142,
    "name": "Ravča",
    "lat": 43.2113,
    "lng": 17.29863
   },
   {
    "k": 143,
    "name": "Vrgorac",
    "lat": 43.20504,
    "lng": 17.37236
   },
   {
    "k": 144,
    "name": "Lučka",
    "lat": 43.18189,
    "lng": 17.39831
   },
   {
    "k": 145,
    "name": "Veliki Prolog",
    "lat": 43.17802,
    "lng": 17.42973
   },
   {
    "k": 149,
    "name": "Ploče.",
    "lat": 43.05243,
    "lng": 17.43607
   },
   {
    "k": 150,
    "name": "Mali Prolog",
    "lat": 43.1452,
    "lng": 17.48361
   },
   {
    "k": 153,
    "name": "Kobiljača",
    "lat": 43.135,
    "lng": 17.48095
   },
   {
    "k": 168,
    "name": "Struge Brečići",
    "lat": 43.11806,
    "lng": 17.48328
   },
   {
    "k": 151,
    "name": "Puljani",
    "lat": 43.11363,
    "lng": 17.48088
   },
   {
    "k": 152,
    "name": "Karamatići",
    "lat": 43.09113,
    "lng": 17.49768
   },
   {
    "k": 273,
    "name": "Duboka",
    "lat": 43.02495,
    "lng": 16.14271
   },
   {
    "k": 281,
    "name": "Komarna",
    "lat": 42.94552,
    "lng": 17.53378
   },
   {
    "k": 272,
    "name": "Pelješac",
    "lat": 42.90457,
    "lng": 17.47521
   },
   {
    "k": 274,
    "name": "Blaca",
    "lat": 43.5738,
    "lng": 16.46193
   },
   {
    "k": 275,
    "name": "Brijesta",
    "lat": 42.90573,
    "lng": 17.53571
   },
   {
    "k": 276,
    "name": "Kamenice sjever",
    "lat": 44.57941,
    "lng": 15.26541
   },
   {
    "k": 277,
    "name": "Kamenice jug",
    "lat": 44.57941,
    "lng": 15.26541
   }
  ]
 },
 {
  "g": 13,
  "name": "A2 Zagreb–Macelj",
  "cams": [
   {
    "k": 134,
    "name": "Zaprešić",
    "lat": 45.85727,
    "lng": 15.80504
   },
   {
    "k": 132,
    "name": "Krapina",
    "lat": 46.16403,
    "lng": 15.87006
   },
   {
    "k": 133,
    "name": "Trakoščan",
    "lat": 46.25898,
    "lng": 15.9482
   },
   {
    "k": 16,
    "name": "Macelj",
    "lat": 46.26306,
    "lng": 15.85631
   }
  ]
 },
 {
  "g": 7,
  "name": "A3 Bregana–Zagreb–Lipovac",
  "cams": [
   {
    "k": 3,
    "name": "Bregana",
    "lat": 45.8383,
    "lng": 15.68815
   },
   {
    "k": 229,
    "name": "Samobor",
    "lat": 45.80186,
    "lng": 15.70971
   },
   {
    "k": 118,
    "name": "Sveta Nedelja",
    "lat": 45.79681,
    "lng": 15.77691
   },
   {
    "k": 231,
    "name": "Zagreb-zapad (Jankomir)",
    "lat": 45.8131,
    "lng": 15.97728
   },
   {
    "k": 269,
    "name": "Zagreb-zapad",
    "lat": 45.8131,
    "lng": 15.97728
   },
   {
    "k": 121,
    "name": "Buzin",
    "lat": 45.74987,
    "lng": 15.99532
   },
   {
    "k": 227,
    "name": "Jakuševec",
    "lat": 45.76055,
    "lng": 16.01628
   },
   {
    "k": 228,
    "name": "Kosnica",
    "lat": 45.74396,
    "lng": 16.11873
   },
   {
    "k": 107,
    "name": "Sava",
    "lat": 45.16084,
    "lng": 17.44367
   },
   {
    "k": 112,
    "name": "Rugvica",
    "lat": 45.74395,
    "lng": 16.23291
   },
   {
    "k": 1,
    "name": "Bajakovo",
    "lat": 45.04859,
    "lng": 19.09928
   },
   {
    "k": 213,
    "name": "Dugo Selo",
    "lat": 45.80604,
    "lng": 16.23777
   },
   {
    "k": 194,
    "name": "Zagreb - istok",
    "lat": 45.8131,
    "lng": 15.97728
   },
   {
    "k": 267,
    "name": "NP Zagreb-istok",
    "lat": null,
    "lng": null
   },
   {
    "k": 212,
    "name": "Ivanić Grad",
    "lat": 45.70568,
    "lng": 16.39201
   },
   {
    "k": 110,
    "name": "Križ",
    "lat": 45.66321,
    "lng": 16.52046
   },
   {
    "k": 113,
    "name": "Popovača",
    "lat": 45.57105,
    "lng": 16.62714
   },
   {
    "k": 114,
    "name": "Kutina",
    "lat": 45.4831,
    "lng": 16.77559
   },
   {
    "k": 241,
    "name": "Novska",
    "lat": 45.34154,
    "lng": 16.97709
   },
   {
    "k": 115,
    "name": "Okučani",
    "lat": 45.26022,
    "lng": 17.19975
   },
   {
    "k": 116,
    "name": "Nova Gradiška",
    "lat": 45.25992,
    "lng": 17.38269
   },
   {
    "k": 242,
    "name": "Lužani",
    "lat": 45.16708,
    "lng": 17.70232
   },
   {
    "k": 126,
    "name": "Slavonski Brod zapad",
    "lat": 45.15843,
    "lng": 18.01256
   },
   {
    "k": 127,
    "name": "Slavonski Brod istok",
    "lat": 45.15843,
    "lng": 18.01256
   },
   {
    "k": 129,
    "name": "Velika Kopanica",
    "lat": 45.15575,
    "lng": 18.3945
   },
   {
    "k": 92,
    "name": "Babina Greda",
    "lat": 45.11612,
    "lng": 18.53696
   },
   {
    "k": 128,
    "name": "Županja A3",
    "lat": 45.07237,
    "lng": 18.69436
   },
   {
    "k": 93,
    "name": "Spačva",
    "lat": 45.07884,
    "lng": 18.97233
   },
   {
    "k": 90,
    "name": "Lipovac",
    "lat": 45.01835,
    "lng": 15.68104
   }
  ]
 },
 {
  "g": 12,
  "name": "A4 Zagreb–Goričan",
  "cams": [
   {
    "k": 226,
    "name": "Zagreb-istok",
    "lat": 45.8131,
    "lng": 15.97728
   },
   {
    "k": 225,
    "name": "Sesvete",
    "lat": 45.82726,
    "lng": 16.11009
   },
   {
    "k": 223,
    "name": "Popovec",
    "lat": 45.84984,
    "lng": 16.13962
   },
   {
    "k": 108,
    "name": "Sveta Helena",
    "lat": 45.90283,
    "lng": 16.2628
   },
   {
    "k": 122,
    "name": "Paka",
    "lat": 45.2902,
    "lng": 18.05996
   },
   {
    "k": 222,
    "name": "Komin",
    "lat": 46.00335,
    "lng": 16.28486
   },
   {
    "k": 221,
    "name": "Breznički Hum",
    "lat": 46.10758,
    "lng": 16.27892
   },
   {
    "k": 123,
    "name": "Novi Marof",
    "lat": 46.16438,
    "lng": 16.33486
   },
   {
    "k": 124,
    "name": "Varaždin",
    "lat": 46.30796,
    "lng": 16.33782
   },
   {
    "k": 214,
    "name": "Ludbreg",
    "lat": 46.24952,
    "lng": 16.61809
   },
   {
    "k": 125,
    "name": "Čakovec",
    "lat": 46.38923,
    "lng": 16.43686
   }
  ]
 },
 {
  "g": 11,
  "name": "A5 Beli Manastir–Osijek",
  "cams": [
   {
    "k": 245,
    "name": "Svilaj",
    "lat": 45.12395,
    "lng": 18.29618
   },
   {
    "k": 102,
    "name": "Sredanci",
    "lat": 45.15497,
    "lng": 18.28547
   },
   {
    "k": 101,
    "name": "Andrijevci",
    "lat": 45.19071,
    "lng": 18.29282
   },
   {
    "k": 100,
    "name": "Ivandvor",
    "lat": 45.32818,
    "lng": 18.37099
   },
   {
    "k": 99,
    "name": "Đakovo",
    "lat": 45.30807,
    "lng": 18.41164
   },
   {
    "k": 95,
    "name": "Čepin",
    "lat": 45.5236,
    "lng": 18.57372
   },
   {
    "k": 96,
    "name": "Osijek",
    "lat": 45.55488,
    "lng": 18.69537
   },
   {
    "k": 271,
    "name": "Sudaraž",
    "lat": 45.74911,
    "lng": 18.56864
   },
   {
    "k": 270,
    "name": "Beli Manastir",
    "lat": 45.7697,
    "lng": 18.60583
   }
  ]
 },
 {
  "g": 10,
  "name": "A6 Rijeka–Zagreb",
  "cams": [
   {
    "k": 15,
    "name": "Lučko",
    "lat": 45.76109,
    "lng": 15.88395
   },
   {
    "k": 53,
    "name": "Demerje",
    "lat": 45.73188,
    "lng": 15.88288
   },
   {
    "k": 161,
    "name": "Zdenčina",
    "lat": 45.68396,
    "lng": 15.75096
   },
   {
    "k": 54,
    "name": "Jastrebarsko",
    "lat": 45.67166,
    "lng": 15.65039
   },
   {
    "k": 12,
    "name": "Karlovac",
    "lat": 45.48925,
    "lng": 15.54863
   },
   {
    "k": 51,
    "name": "Drežnik",
    "lat": 45.29166,
    "lng": 17.47007
   },
   {
    "k": 50,
    "name": "Dobra",
    "lat": 45.34613,
    "lng": 15.28925
   },
   {
    "k": 61,
    "name": "Novigrad",
    "lat": 45.31592,
    "lng": 13.56303
   },
   {
    "k": 63,
    "name": "Vukova Gorica",
    "lat": 45.44942,
    "lng": 15.33927
   },
   {
    "k": 70,
    "name": "Bosiljevo 1",
    "lat": 45.41169,
    "lng": 15.28941
   },
   {
    "k": 59,
    "name": "Severinske Drage",
    "lat": 45.39854,
    "lng": 15.21227
   },
   {
    "k": 252,
    "name": "Veliki Gložac",
    "lat": 45.37847,
    "lng": 15.1674
   },
   {
    "k": 58,
    "name": "Zečeve Drage",
    "lat": 45.37671,
    "lng": 15.1273
   },
   {
    "k": 57,
    "name": "Rožman Brdo",
    "lat": 45.36843,
    "lng": 15.08763
   },
   {
    "k": 49,
    "name": "Vrbovsko",
    "lat": 45.374,
    "lng": 15.07811
   },
   {
    "k": 5,
    "name": "Čardak",
    "lat": 44.55835,
    "lng": 15.57106
   },
   {
    "k": 187,
    "name": "Zalesina",
    "lat": 45.38231,
    "lng": 14.8737
   },
   {
    "k": 253,
    "name": "Javorova Kosa",
    "lat": 45.38667,
    "lng": 14.95172
   },
   {
    "k": 56,
    "name": "Vršek",
    "lat": 45.38587,
    "lng": 14.85882
   },
   {
    "k": 254,
    "name": "Lučice",
    "lat": 45.3737,
    "lng": 14.79783
   },
   {
    "k": 256,
    "name": "Sopač",
    "lat": 45.35762,
    "lng": 14.77172
   },
   {
    "k": 48,
    "name": "Delnice",
    "lat": 45.39811,
    "lng": 14.80093
   },
   {
    "k": 255,
    "name": "Sleme",
    "lat": 45.34948,
    "lng": 14.75271
   },
   {
    "k": 27,
    "name": "Vrata",
    "lat": 45.31675,
    "lng": 14.72887
   },
   {
    "k": 29,
    "name": "Bajer",
    "lat": 45.87231,
    "lng": 16.15461
   },
   {
    "k": 35,
    "name": "Tuhobić",
    "lat": 45.32295,
    "lng": 14.64167
   },
   {
    "k": 188,
    "name": "Hreljin.",
    "lat": 45.28404,
    "lng": 14.59893
   },
   {
    "k": 42,
    "name": "Oštrovica",
    "lat": 43.95946,
    "lng": 15.79618
   },
   {
    "k": 65,
    "name": "Orehovica",
    "lat": 46.3322,
    "lng": 16.50632
   }
  ]
 },
 {
  "g": 9,
  "name": "A7 Rupa–Rijeka–Križišće",
  "cams": [
   {
    "k": 28,
    "name": "Rupa",
    "lat": 45.48016,
    "lng": 14.28394
   },
   {
    "k": 69,
    "name": "Rupa A7",
    "lat": 45.48016,
    "lng": 14.28394
   },
   {
    "k": 68,
    "name": "Jurdani",
    "lat": 45.38512,
    "lng": 14.31555
   },
   {
    "k": 26,
    "name": "Rijeka",
    "lat": 45.3268,
    "lng": 14.44221
   },
   {
    "k": 160,
    "name": "Rujevica",
    "lat": 45.34608,
    "lng": 14.40793
   },
   {
    "k": 158,
    "name": "Škurinje",
    "lat": 45.35061,
    "lng": 14.42147
   },
   {
    "k": 159,
    "name": "Mihačeva Draga",
    "lat": 45.34238,
    "lng": 14.43415
   },
   {
    "k": 157,
    "name": "Katarina",
    "lat": 45.33631,
    "lng": 14.45362
   },
   {
    "k": 156,
    "name": "Rječina",
    "lat": 45.37484,
    "lng": 14.44029
   },
   {
    "k": 155,
    "name": "Trsat",
    "lat": 45.33084,
    "lng": 14.46446
   },
   {
    "k": 66,
    "name": "Draga",
    "lat": 45.43897,
    "lng": 17.62616
   },
   {
    "k": 67,
    "name": "Sveti Kuzam",
    "lat": 45.31296,
    "lng": 14.52367
   },
   {
    "k": 163,
    "name": "Burlica",
    "lat": 45.28152,
    "lng": 14.59165
   }
  ]
 },
 {
  "g": 6,
  "name": "A8 Kanfanar–Matulji",
  "cams": [
   {
    "k": 36,
    "name": "Učka",
    "lat": 45.23828,
    "lng": 14.21417
   }
  ]
 },
 {
  "g": 8,
  "name": "A10 Ploče–BiH",
  "cams": [
   {
    "k": 147,
    "name": "Pojezerje",
    "lat": 43.14115,
    "lng": 17.48602
   },
   {
    "k": 146,
    "name": "Čarapine",
    "lat": 43.11697,
    "lng": 17.55192
   },
   {
    "k": 137,
    "name": "Nova Sela/Bijača",
    "lat": null,
    "lng": null
   },
   {
    "k": 149,
    "name": "Ploče.",
    "lat": 43.05243,
    "lng": 17.43607
   }
  ]
 },
 {
  "g": 15,
  "name": "A11 Zagreb–Sisak",
  "cams": [
   {
    "k": 216,
    "name": "Veliko Polje",
    "lat": 45.73823,
    "lng": 16.01607
   },
   {
    "k": 220,
    "name": "Velika Gorica (sjever)",
    "lat": 45.71557,
    "lng": 16.07172
   },
   {
    "k": 219,
    "name": "Velika Gorica (jug)",
    "lat": 45.71557,
    "lng": 16.07172
   },
   {
    "k": 217,
    "name": "Buševec",
    "lat": 45.63394,
    "lng": 16.11575
   },
   {
    "k": 218,
    "name": "Lekenik",
    "lat": 45.58427,
    "lng": 16.21062
   }
  ]
 },
 {
  "g": 14,
  "name": "Državne ceste",
  "cams": [
   {
    "k": 154,
    "name": "Sveti Ilija",
    "lat": 46.24635,
    "lng": 16.32331
   },
   {
    "k": 150,
    "name": "Mali Prolog",
    "lat": 43.1452,
    "lng": 17.48361
   },
   {
    "k": 153,
    "name": "Kobiljača",
    "lat": 43.135,
    "lng": 17.48095
   },
   {
    "k": 151,
    "name": "Puljani",
    "lat": 43.11363,
    "lng": 17.48088
   },
   {
    "k": 152,
    "name": "Karamatići",
    "lat": 43.09113,
    "lng": 17.49768
   },
   {
    "k": 273,
    "name": "Duboka",
    "lat": 43.02495,
    "lng": 16.14271
   },
   {
    "k": 281,
    "name": "Komarna",
    "lat": 42.94552,
    "lng": 17.53378
   },
   {
    "k": 274,
    "name": "Blaca",
    "lat": 43.5738,
    "lng": 16.46193
   },
   {
    "k": 275,
    "name": "Brijesta",
    "lat": 42.90573,
    "lng": 17.53571
   },
   {
    "k": 276,
    "name": "Kamenice sjever",
    "lat": 44.57941,
    "lng": 15.26541
   },
   {
    "k": 277,
    "name": "Kamenice jug",
    "lat": 44.57941,
    "lng": 15.26541
   }
  ]
 }
];
