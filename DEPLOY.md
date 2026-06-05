# Objava PrometInfo + samodejno osveževanje

Aplikacija je samostojna statična stran: **`dist/index.html`**.
Žive slike kamer in prometni sloj se nalagajo v brskalniku, podatki (cene goriv,
čakanja, poročila) pa se **samodejno osvežujejo prek GitHub Action (cron)**.

---

## 1) Postavitev na GitHub (enkratno)

Najlažje z GitHub CLI (`gh`):

```powershell
winget install --id GitHub.cli -e        # namesti gh (če ga še ni)
# zapri in znova odpri terminal, da se gh doda v PATH
gh auth login                            # prijava prek brskalnika
cd C:\Users\brank\AI_projekti\prometinfo
gh repo create prometinfo --private --source=. --remote=origin --push
```

Brez `gh` (ročno): ustvari prazen repo na github.com, nato:

```powershell
cd C:\Users\brank\AI_projekti\prometinfo
git remote add origin https://github.com/<UPORABNIK>/prometinfo.git
git push -u origin main
```

## 2) Vklop GitHub Pages (enkratno, v brskalniku)

V repozitoriju: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
(Workflow `.github/workflows/refresh.yml` poskrbi za objavo.)

Javni naslov bo: `https://<UPORABNIK>.github.io/prometinfo/`

## 3) TomTom ključ — dodaj domeno (enkratno)

Prometni sloj (TomTom) je vezan na dovoljene domene. Po objavi:
1. **developer.tomtom.com** → tvoj ključ → **Domain restrictions / referrers**
2. Dodaj `https://<UPORABNIK>.github.io/*`
3. Sicer se naloži vse razen prometnega sloja.

---

## Kako deluje samodejno osveževanje

Workflow `.github/workflows/refresh.yml` se zažene:
- **vsak dan ob ~06:30 in ~15:30** (cron),
- ob **ročnem kliku** (Actions → Osvežitev podatkov → Run workflow),
- ob vsaki **spremembi kode** na `main`.

Ob zagonu: `npm run refresh` → pobere sveže cene (AMZS) + poročila (HAK, AMSS,
BIHAMK) → znova zgradi `dist/index.html` → shrani podatke v repo → objavi na Pages.

**Varovalo:** če kak vir vrne premalo podatkov (npr. zavrne strežniški IP),
se obstoječi podatki **obdržijo** (tabela se ne izprazni). Glej `scripts/_safewrite.mjs`.

## Ročna osvežitev (lokalno)

```powershell
npm run refresh
```
Posodobi podatke in `dist/`. Če je repo povezan z GitHubom, lahko nato:
`git add -A; git commit -m "osvežitev"; git push` (Action objavi samodejno).

## Alternativni gostitelj (Netlify / Vercel)

Cron že shrani sveže podatke v repo, zato lahko namesto Pages povežeš repo z
Netlify ali Vercel (build ni potreben — objavi se mapa `dist`). Pages korak v
workflowu lahko v tem primeru pustiš ali odstraniš.
