# PrometInfo

Prometne informacije za države bivše Jugoslavije: **čakanje na mejnih prehodih**,
(kasneje) kamere, gostota prometa in novice. Skupni backend (Next.js API route-i)
streže spletni in kasneje mobilni aplikaciji.

## Stanje

**Hrbtenica = uradni viri (zanesljivi, zastonj).** FB je parkiran kot opcijski
dodatek (koda v `lib/fb-*`, privzeto izklopljen — drag in šumen, glej spodaj).

### Žive čakalne dobe (free)
- ✅ **BIHAMK (BA)** — 46 prehodov, scraper deluje

### Kamere — globoke povezave na točno kamero (free)
- ✅ **HAK (HR)** — vseh 36 mejnih kamer (`lib/hak-cameras.ts`)
- ✅ **AMS-RS (BA/Republika Srpska)** — 13 prehodov
- ✅ **AMSS (RS)** — 4 prehodi + odkriti živi HLS tokovi (`lib/amss-cameras.ts`)
- 🔵 **promet.si (SI)**, **AMSCG (ME)**, **roads.org.mk (MK)** — kamerne strani (page-level)

### Zaključki preverjanja virov
- RS žive čakalne dobe (AMSS stanje) = za JS/XHR → rabi headless worker.
- HR žive čakalne dobe niso čisto dostopne (HAK = kamere, MUP iframe = le statistika).
- SI je Schengen (brez kontrol); NAP odprti podatki rabijo brezplačno registracijo (token).
- FB: stran = večinoma novice; skupine = večinoma vprašanja (odgovori v komentarjih).
  → dodatek med konicami, ne hrbtenica.

## Arhitektura

```
lib/
  types.ts          # skupni tipi (WaitReport, SourceResult, Country)
  parse.ts          # opisno besedilo ("do 30 minuta") -> ocena v minutah + nivo
  cache.ts          # in-memory cache (TTL 5 min) + dedup vzporednih zahtevkov
  scrapers/
    index.ts        # register scraperjev, scrapeAll()
    bihamk.ts       # BiH scraper (cheerio)
app/
  page.tsx          # spletni prikaz (server component)
  api/borders/route.ts  # JSON API za web + mobile
scripts/
  test-scrape.ts    # hiter test scraperjev (npm run scrape)
```

## Zagon

```bash
npm install
npm run scrape   # test scraperja v terminalu (brez Next.js)
npm run dev      # http://localhost:3000  +  http://localhost:3000/api/borders
```

## Realnost virov (pomembno)

- Večina avto-moto zvez objavlja **opisne** statuse, ne čistih številk →
  `parse.ts` izlušči oceno, `rawStatus` pa vedno ohrani original.
- Nekateri viri (npr. **AMSS/RS**) blokirajo bote → potreben bo ločen
  always-on worker ali headless browser.
- Scraperji so krhki: vsak vir je izoliran, ena napaka ne podre odgovora
  (`Promise.allSettled` + `SourceResult.ok/error`).

## Naslednji koraki

1. Dodaj registre prehodov s koordinatami (`neighbor` državo, lat/lng) → zemljevid.
2. HR vir (MUP) in ostale države.
3. Ločen cron worker + trajna shramba (Vercel KV / Postgres) za zgodovino čakanj.
4. Kamere (JPEG/MJPEG posnetki), gostota prometa, novice (Telegram/RSS namesto FB).
5. Mobilna aplikacija (Expo) — uporabi isti `/api/borders`.
