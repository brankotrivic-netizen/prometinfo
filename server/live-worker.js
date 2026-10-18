// PrometInfo — zive cakalne dobe (Cloudflare Worker, brezplacni plan).
// GET /waits -> { ts, hak:{ok,items}, bihamk:{ok,items}, amss:{ok,items} }
// Vire pobere v zivo (HAK/MUP, BIHAMK, AMSS) in rezultat predpomni 90 s,
// da aplikacija dobi podatke, stare nekaj minut namesto 3–5 ur (GitHub cron).
// Razclemba je ista kot v scripts/build-hak-waits.mjs, build-amss-waits.mjs in lib/scrapers/bihamk.ts.

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const CACHE_S = 90;

const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&scaron;/gi, "š").replace(/&amp;/g, "&").replace(/&#?[a-z0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const deacc = (s) => strip(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "dj");
const levelOf = (m) => m == null ? "unknown" : m <= 0 ? "none" : m <= 30 ? "low" : m <= 60 ? "moderate" : m <= 120 ? "high" : "severe";

async function get(url, extra) {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "hr,bs,sr;q=0.8,en;q=0.5", ...(extra || {}) }, cf: { cacheTtl: 0 } });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.text();
}

// ---------- HAK / MUP (HR) ----------
const HAK_NAME2ID = {
  "jasenovac": "ba-gradina", "donja gradina": "ba-gradina",
  "stara gradiska": "ba-gradiska", "gornji varos": "ba-gradiska",
  "bajakovo": "hr-bajakovo", "batina": "hr-batina", "erdut": "hr-erdut",
  "ilok": "hr-ilok", "tovarnik": "hr-tovarnik",
  "gunja": "ba-brcko", "zupanja": "ba-orasje", "slavonski samac": "ba-samac",
  "svilaj": "ba-svilaj", "slavonski brod": "ba-brod",
  "hrvatska kostajnica": "ba-kostajnica", "maljevac": "ba-velika-kladusa",
  "licko petrovo selo": "ba-izacic", "kamensko": "ba-kamensko",
  "nova sela": "ba-bijaca", "metkovic": "ba-doljani", "klek": "ba-neum-i",
  "hrvatska dubica": "ba-kozarska-dubica", "bosanska dubica": "ba-kozarska-dubica",
  "dvor": "ba-novi-grad", "bosanski novi": "ba-novi-grad",
};
function hakMin(txt) {
  const t = deacc(txt);
  if (!t || t === "-" || /nema|bez podat/.test(t)) return null;
  let h = 0, m = 0;
  const mh = /(\d+)\s*h/.exec(t); if (mh) h = +mh[1];
  const mm = /(\d+)\s*min/.exec(t); if (mm) m = +mm[1];
  if (!mh && !mm) { const n = /(\d+)/.exec(t); if (n) m = +n[1]; }
  return h * 60 + m;
}
function hakISO(ts) {
  const m = /(\d{1,2})\.(\d{1,2})\.(\d{4})\.?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(String(ts || ""));
  if (!m) return "";
  const p = (n) => String(n).padStart(2, "0");
  // HR lokalni cas -> pravi zamik (poletni/zimski) za ta datum
  const [, d, mo, y, h, mi, s] = m;
  const off = cetOffset(+y, +mo, +d);
  return `${y}-${p(mo)}-${p(d)}T${p(h)}:${p(mi)}:${p(s || "00")}${off}`;
}
function cetOffset(y, mo, d) {
  // poletni cas EU: zadnja nedelja marca -> zadnja nedelja oktobra
  const lastSun = (month) => { const dt = new Date(Date.UTC(y, month, 0)); return dt.getUTCDate() - dt.getUTCDay(); };
  const t = mo * 100 + d, start = 300 + lastSun(3), end = 1000 + lastSun(10);
  return t >= start && t < end ? "+02:00" : "+01:00";
}
function hakId(name) {
  const base = deacc(name).replace(/\bgp\b/g, "").replace(/\(.*?\)/g, "").trim();
  const paren = (/\((.*?)\)/.exec(strip(name)) || [])[1];
  for (const k of [base, deacc(paren || "")]) if (k && HAK_NAME2ID[k]) return HAK_NAME2ID[k];
  for (const k of Object.keys(HAK_NAME2ID)) if (base && (base.includes(k) || k.includes(base))) return HAK_NAME2ID[k];
  return "";
}
async function hak() {
  const html = await get("https://www.hak.hr/info/stanje-na-cestama");
  const rowRe = /<td class="gpime">([\s\S]*?)<\/td>\s*((?:<td class="gpUnos"[^>]*>[\s\S]*?<\/td>\s*){4})/g;
  const items = [];
  let m;
  while ((m = rowRe.exec(html))) {
    const name = strip(m[1]);
    const cells = [...m[2].matchAll(/<td class="gpUnos"[^>]*>([\s\S]*?)<\/td>/g)].map((c) => ({
      val: strip(c[1].replace(/<span[\s\S]*?<\/span>/g, "")),
      ts: strip((/<span[^>]*>([\s\S]*?)<\/span>/.exec(c[1]) || [])[1] || "").replace(/^T:\s*/i, ""),
    }));
    if (cells.length < 4) continue;
    const [u, tu, i, ti] = cells;
    const it = {
      id: hakId(name), name,
      ulazMin: hakMin(u.val), izlazMin: hakMin(i.val), ulazTxt: u.val, izlazTxt: i.val,
      truckUlazMin: hakMin(tu.val), truckIzlazMin: hakMin(ti.val), truckUlazTxt: tu.val, truckIzlazTxt: ti.val,
      ulazTs: u.ts, izlazTs: i.ts, ulazTsISO: hakISO(u.ts), izlazTsISO: hakISO(i.ts),
    };
    if (it.ulazMin == null && it.izlazMin == null && it.truckUlazMin == null && it.truckIzlazMin == null) continue;
    it.tsISO = it.ulazTsISO || it.izlazTsISO;
    items.push(it);
  }
  return items;
}

// ---------- BIHAMK (BiH) ----------
const WORDN = { jedan: 1, jedna: 1, dva: 2, dvije: 2, dve: 2, tri: 3, cetiri: 4, pet: 5, sest: 6, sedam: 7, osam: 8, devet: 9, deset: 10, pola: 0.5, pol: 0.5 };
function parseWait(raw) {
  const t = String(raw || "").toLowerCase().replace(/č|ć/g, "c").replace(/š/g, "s").replace(/ž/g, "z").replace(/đ/g, "dj").replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (/\b(nema|bez)\b.*(zadrz|guzv|gnjav|kolon)/.test(t) || /nesmetan|tece nesmetano|protocan|protocno|\bprazan\b|\bprazno\b|normalan protok|bez zastoja/.test(t)) return 0;
  let tot = 0, found = false, m;
  const hr = /(\d+(?:[.,]\d+)?|jedan|jedna|dva|dvije|dve|tri|cetiri|pet|sest|sedam|osam|devet|deset|pola|pol)\s*(?:sat|sata|sati|h\b)/g;
  while ((m = hr.exec(t))) { const v = isNaN(parseFloat(m[1].replace(",", "."))) ? WORDN[m[1]] : parseFloat(m[1].replace(",", ".")); if (v != null) { tot += v * 60; found = true; } }
  const mr = /(\d+)\s*(?:minut|min\b)/g;
  while ((m = mr.exec(t))) { tot += parseInt(m[1], 10); found = true; }
  if (!found && /pola sata|pol sata/.test(t)) { tot = 30; found = true; }
  return found ? Math.round(tot) : null;
}
const bslug = (s) => s.toLowerCase().replace(/č|ć/g, "c").replace(/š/g, "s").replace(/ž/g, "z").replace(/đ/g, "dj").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
async function bihamk() {
  const html = await get("https://bihamk.ba/spi/stanje-na-cesti-u-bih/granicni-prijelazi");
  const items = [], seen = new Set();
  for (const a of html.split(/<article\b/i).slice(1)) {
    const body = a.slice(a.indexOf(">") + 1).split(/<\/article>/i)[0];
    const h3 = (/<h3[^>]*>([\s\S]*?)<\/h3>/i.exec(body) || [])[1];
    const rawName = strip(h3);
    if (!/^GP\b/i.test(rawName)) continue;
    const crossing = rawName.replace(/^GP\s+/i, "").trim();
    let id = "ba-" + bslug(crossing);
    // BIHAMK: "Gradiška" = stari most, "Gradiška novi most" = nas ba-gradiska (Gornji Varos)
    if (id === "ba-gradiska") id = "ba-gradiska-stari-most";
    else if (id === "ba-gradiska-novi-most") id = "ba-gradiska";
    if (!crossing || seen.has(id)) continue;
    seen.add(id);
    const status = strip(body.replace(/<h3[\s\S]*?<\/h3>/i, "")) || "Ni podatka o cakanju.";
    const min = parseWait(status);
    items.push({ id, name: crossing, waitMinutes: min, level: levelOf(min), status: status.slice(0, 300) });
  }
  return items;
}

// ---------- AMSS (Srbija) ----------
const AMSS_MATCH = [
  ["batrovci", "hr-bajakovo"], ["sid", "hr-tovarnik"], ["bezdan", "hr-batina"],
  ["backa palanka", "hr-ilok"], ["bogojevo", "hr-erdut"], ["sremska raca", "ba-raca"],
  ["horgos ii", "rs-horgos"], ["horgos", "rs-horgos"], ["kelebija", "rs-kelebija"],
  ["vatin", "rs-vatin"], ["presevo", "rs-presevo"], ["gostun", "rs-gostun"],
  ["mali zvornik", "ba-karakaj"], ["kotroman", "ba-vardiste"], ["ljubovija", "ba-bratunac"],
  ["trbusnica", "ba-sepak"], ["uvac", "ba-uvac"], ["bajina basta", "ba-skelani"],
  ["badovinci", "ba-popovi"],
];
function amssMin(seg) {
  if (!seg) return null;
  const t = seg.toLowerCase();
  let h = 0, m = 0;
  const mh = /(\d+)\s*(sat|sata|sati|čas|cas|h)\b/.exec(t); if (mh) h = +mh[1];
  const mm = /(\d+)\s*min/.exec(t); if (mm) m = +mm[1];
  if (!mh && !mm) { const n = /(\d+)/.exec(t); if (n) m = +n[1]; }
  return h * 60 + m;
}
async function amss() {
  const html = await get("https://www.amss.org.rs/stanje-na-putu/strana/mapa", { Referer: "https://www.amss.org.rs/" });
  const items = [], seen = new Set(), now = new Date().toISOString();
  const fm = (v) => v != null ? (v >= 60 ? "~" + Math.round(v / 60 * 10) / 10 + " h" : "~" + v + " min") : "-";
  for (const b of html.matchAll(/<div class="single-marker-info[^"]*">\s*<h4[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)<\/div>/g)) {
    const title = strip(b[1]), body = strip(b[2]);
    if (!/grani[čc]nim prelaz/i.test(body)) continue;
    const t = deacc(title);
    const hit = AMSS_MATCH.find(([k]) => t.includes(k));
    if (!hit || seen.has(hit[1])) continue;
    const ti = body.search(/TERETNIM/i);
    const pax = ti >= 0 ? body.slice(0, ti) : body, trk = ti >= 0 ? body.slice(ti) : "";
    const grab = (part, re) => (re.exec(part) || [])[1] || "";
    const OUT = /Izlaz iz Srbije[^.]*?(\d+\s*(?:min|sat|h|čas|cas)[^.]*)/i, IN = /Ulaz u Srbiju[^.]*?(\d+\s*(?:min|sat|h|čas|cas)[^.]*)/i;
    const it = { id: hit[1], name: title.replace(/^\s*\d*\s*GP\s*/i, "").slice(0, 60),
      izlazMin: amssMin(grab(pax, OUT)), ulazMin: amssMin(grab(pax, IN)),
      truckIzlazMin: amssMin(grab(trk, OUT)), truckUlazMin: amssMin(grab(trk, IN)), ts: now };
    if (it.izlazMin == null && it.ulazMin == null && it.truckIzlazMin == null && it.truckUlazMin == null) continue;
    it.ulazTxt = fm(it.ulazMin); it.izlazTxt = fm(it.izlazMin); it.truckUlazTxt = fm(it.truckUlazMin); it.truckIzlazTxt = fm(it.truckIzlazMin);
    seen.add(hit[1]);
    items.push(it);
  }
  return items;
}

const wrap = (p) => p.then((items) => ({ ok: true, items }), (e) => ({ ok: false, error: String(e && e.message || e), items: [] }));

async function snapshot() {
  const [H, B, A] = await Promise.all([wrap(hak()), wrap(bihamk()), wrap(amss())]);
  return { ts: new Date().toISOString(), hak: H, bihamk: B, amss: A };
}

// ---------- ZGODOVINA (D1) ----------
// "do 30 min" / "nisu duza od 30 minuta" je splosna zgornja meja, ne meritev.
const isGenericTxt = (t) => /\bdo\s*30\b|nisu\s+du[žz]a\s+od\s+30|ne\s+du[žz]e\s+od\s+30/i.test(String(t || ""));
// BIHAMK: "Duga je kolona putnickih vozila na izlazu iz BiH" -> smer kolone (BiH stran)
function bihQueueDir(status) {
  let hit = null;
  for (const sn of String(status || "").toLowerCase().split(/[.]/)) {
    if (/(dug|velik|duz)[a-zčšž]* +(je +)?kolon|guzv|gužv/.test(sn) && /putni/.test(sn)) {
      hit = hit || (/izlaz/.test(sn) ? "izlaz" : /ulaz/.test(sn) ? "ulaz" : "oba");
    }
  }
  return hit;
}
function localDH(ms) {
  const d = new Date(ms), off = cetOffset(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()) === "+02:00" ? 2 : 1;
  const l = new Date(ms + off * 3600000);
  return [l.getUTCDay(), l.getUTCHours()];
}
// En zapis na prehod: s = tja (jug), n = nazaj (sever).
// BiH prehodi: tja = izlaz iz HR (HAK) + ulaz u BiH (BIHAMK); nazaj = izlaz iz BiH + ulaz u HR.
function histRows(snap) {
  const now = Date.now(), fresh = (iso) => iso && now - Date.parse(iso) <= 90 * 60000;
  const acc = {};
  const put = (id, dir, min, gen) => { if (!id || min == null) return; (acc[id] = acc[id] || { s: [], n: [] })[dir].push([min, !!gen]); };
  if (snap.hak.ok) for (const w of snap.hak.items) {
    if (fresh(w.izlazTsISO)) put(w.id, "s", w.izlazMin, isGenericTxt(w.izlazTxt));
    if (fresh(w.ulazTsISO)) put(w.id, "n", w.ulazMin, isGenericTxt(w.ulazTxt));
  }
  if (snap.bihamk.ok) for (const b of snap.bihamk.items) {
    const q = bihQueueDir(b.status);
    if (b.waitMinutes == null && !q) continue;
    const gen = isGenericTxt(b.status);
    const qs = q === "ulaz" || q === "oba", qn = q === "izlaz" || q === "oba";
    put(b.id, "s", qs ? 75 : b.waitMinutes, gen && !qs);
    put(b.id, "n", qn ? 75 : b.waitMinutes, gen && !qn);
  }
  if (snap.amss.ok) for (const a of snap.amss.items) {
    put(a.id, "s", a.ulazMin, a.ulazMin === 30);
    put(a.id, "n", a.izlazMin, a.izlazMin === 30);
  }
  const [dw, hr] = localDH(now), rows = [];
  for (const [id, v] of Object.entries(acc)) {
    // vec virov za isto smer: vzemi najslabsega; "splosno" le, ce so vsi splosni
    const pick = (arr) => arr.length ? [Math.max(...arr.map((x) => x[0])), arr.every((x) => x[1])] : [null, false];
    const [s, sg] = pick(v.s), [n, ng] = pick(v.n);
    if (s == null && n == null) continue;
    rows.push([id, now, dw, hr, s, n, (sg ? 1 : 0) | (ng ? 2 : 0)]);
  }
  return rows;
}
async function collect(env) {
  const rows = histRows(await snapshot());
  if (!rows.length) return 0;
  const st = env.DB.prepare("INSERT INTO w (i,t,dw,hr,s,n,g) VALUES (?,?,?,?,?,?,?)");
  await env.DB.batch(rows.map((r) => st.bind(...r)));
  await env.DB.prepare("DELETE FROM w WHERE t < ?").bind(Date.now() - 120 * 86400000).run(); // hrani 120 dni
  return rows.length;
}
// Statistika za izbrane prehode zadnjih 8 tednov po dnevu v tednu in uri (lokalni cas).
// Vrstica: [dw, hr, cs, avs, qs, gs, cn, avn, qn, gn] — c=stevilo, av=povprecje, q=koliko >=60 min, g=koliko splosnih ocen.
async function stats(env, ids) {
  const since = Date.now() - 56 * 86400000;
  const q = "SELECT i, dw, hr, COUNT(s) cs, ROUND(AVG(s)) avs, SUM(CASE WHEN s>=60 THEN 1 ELSE 0 END) qs, SUM(CASE WHEN s IS NOT NULL AND (g&1)=1 THEN 1 ELSE 0 END) gs, "
    + "COUNT(n) cn, ROUND(AVG(n)) avn, SUM(CASE WHEN n>=60 THEN 1 ELSE 0 END) qn, SUM(CASE WHEN n IS NOT NULL AND (g&2)=2 THEN 1 ELSE 0 END) gn "
    + "FROM w WHERE t > ? AND i IN (" + ids.map(() => "?").join(",") + ") GROUP BY i, dw, hr";
  const r = await env.DB.prepare(q).bind(since, ...ids).all();
  const out = {};
  for (const x of r.results || []) (out[x.i] = out[x.i] || []).push([x.dw, x.hr, x.cs, x.avs, x.qs, x.gs, x.cn, x.avn, x.qn, x.gn]);
  const first = await env.DB.prepare("SELECT MIN(t) t, COUNT(*) c FROM w").first();
  return { ts: new Date().toISOString(), since: first && first.t ? new Date(first.t).toISOString() : null, rows: first ? first.c : 0, ids: out };
}

// ---------- GOOGLE ROUTES (podatki telefonov Android) ----------
// Zadnjih ~4 km do meje + 1 km za njo, po smeri: s = tja (HR -> BiH), n = nazaj (BiH -> HR).
// Zamuda = duration (s prometom) - staticDuration (brez prometa); kolona = odseki TRAFFIC_JAM/SLOW na poti.
// Razred "Compute Routes Pro" (TRAFFIC_AWARE*): 5.000 brezplacnih klicev/mesec -> varovalo G_CAP.
// Kljuc: GOOGLE_ROUTES_KEY (wrangler secret put GOOGLE_ROUTES_KEY). Brez kljuca je ta del izklopljen.
// Google podatki se ne arhivirajo (le zadnja meritev na prehod in smer).
const G_CAP = 4500;
const GQ = {
  "ba-gradiska": { s: { o: [45.18177, 17.214], d: [45.13802, 17.20403] }, n: { o: [45.11305, 17.19212], d: [45.15675, 17.20474] } },
  "ba-gradina": { s: { o: [45.28533, 16.93351], d: [45.25762, 16.91575] }, n: { o: [45.22946, 16.90657], d: [45.26974, 16.9135] } },
  "ba-kozarska-dubica": { s: { o: [45.19788, 16.77065], d: [45.17539, 16.81084] }, n: { o: [45.15595, 16.79562], d: [45.18845, 16.80437] } },
};
function decodePolyline(str) {
  const pts = []; let i = 0, lat = 0, lng = 0;
  while (i < str.length) {
    for (const k of [0, 1]) {
      let b, shift = 0, res = 0;
      do { b = str.charCodeAt(i++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const v = res & 1 ? ~(res >> 1) : res >> 1;
      if (k === 0) lat += v; else lng += v;
    }
    pts.push([lat / 1e5, lng / 1e5]);
  }
  return pts;
}
const hav = (a, b) => { const x = (b[0] - a[0]) * Math.PI / 180, y = (b[1] - a[1]) * Math.PI / 180; const s = Math.sin(x / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(y / 2) ** 2; return 6371 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)); };
async function gEnsure(env) {
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS gq (i TEXT NOT NULL, dir TEXT NOT NULL, t INTEGER NOT NULL, delay INTEGER, jam REAL, slow REAL, PRIMARY KEY (i, dir))"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS gusage (m TEXT PRIMARY KEY, n INTEGER NOT NULL)"),
  ]);
}
const gMonth = () => new Date().toISOString().slice(0, 7);
async function gUsed(env) { const r = await env.DB.prepare("SELECT n FROM gusage WHERE m=?").bind(gMonth()).first(); return r ? r.n : 0; }
async function gMeasure(env, id, dir) {
  const seg = GQ[id] && GQ[id][dir]; if (!seg) return null;
  const ll = (p) => ({ location: { latLng: { latitude: p[0], longitude: p[1] } } });
  await env.DB.prepare("INSERT INTO gusage (m,n) VALUES (?,1) ON CONFLICT(m) DO UPDATE SET n=n+1").bind(gMonth()).run();
  const r = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": env.GOOGLE_ROUTES_KEY, "X-Goog-FieldMask": "routes.duration,routes.staticDuration,routes.polyline.encodedPolyline,routes.travelAdvisory.speedReadingIntervals" },
    body: JSON.stringify({ origin: ll(seg.o), destination: ll(seg.d), travelMode: "DRIVE", routingPreference: "TRAFFIC_AWARE_OPTIMAL", extraComputations: ["TRAFFIC_ON_POLYLINE"] }),
  });
  if (!r.ok) throw new Error("Google HTTP " + r.status + " " + (await r.text()).slice(0, 160));
  const rt = ((await r.json()).routes || [])[0]; if (!rt) return null;
  const sec = (x) => parseInt(String(x || "0").replace("s", ""), 10) || 0;
  const pts = rt.polyline && rt.polyline.encodedPolyline ? decodePolyline(rt.polyline.encodedPolyline) : [];
  let jam = 0, slow = 0;
  for (const iv of (rt.travelAdvisory && rt.travelAdvisory.speedReadingIntervals) || []) {
    const a = iv.startPolylinePointIndex || 0, b = iv.endPolylinePointIndex || 0;
    let km = 0; for (let k = a; k < b && k + 1 < pts.length; k++) km += hav(pts[k], pts[k + 1]);
    if (iv.speed === "TRAFFIC_JAM") jam += km; else if (iv.speed === "SLOW") slow += km;
  }
  const row = { i: id, dir, t: Date.now(), delay: Math.max(0, sec(rt.duration) - sec(rt.staticDuration)), jam: Math.round(jam * 10) / 10, slow: Math.round(slow * 10) / 10 };
  await env.DB.prepare("INSERT INTO gq (i,dir,t,delay,jam,slow) VALUES (?,?,?,?,?,?) ON CONFLICT(i,dir) DO UPDATE SET t=excluded.t, delay=excluded.delay, jam=excluded.jam, slow=excluded.slow")
    .bind(row.i, row.dir, row.t, row.delay, row.jam, row.slow).run();
  return row;
}
// osvezi meritve, ki so starejse od maxAgeMin (najvec "limit" klicev naenkrat, nikoli cez mesecno varovalo)
async function gRefresh(env, ids, maxAgeMin, limit) {
  if (!env.GOOGLE_ROUTES_KEY) return 0;
  await gEnsure(env);
  const have = await env.DB.prepare("SELECT i,dir,t FROM gq WHERE i IN (" + ids.map(() => "?").join(",") + ")").bind(...ids).all();
  const age = {}; for (const x of have.results || []) age[x.i + "|" + x.dir] = x.t;
  let used = await gUsed(env), n = 0;
  for (const id of ids) for (const dir of ["s", "n"]) {
    if (!GQ[id] || n >= limit || used >= G_CAP) continue;
    if (age[id + "|" + dir] && Date.now() - age[id + "|" + dir] < maxAgeMin * 60000) continue;
    try { await gMeasure(env, id, dir); } catch (e) { console.log("google", id, dir, e.message); }
    n++; used++;
  }
  return n;
}
async function gRead(env, ids) {
  if (!env.GOOGLE_ROUTES_KEY) return { enabled: false };
  await gEnsure(env);
  const r = await env.DB.prepare("SELECT i,dir,t,delay,jam,slow FROM gq WHERE i IN (" + ids.map(() => "?").join(",") + ")").bind(...ids).all();
  const out = {}; for (const x of r.results || []) (out[x.i] = out[x.i] || {})[x.dir] = { t: x.t, delay: x.delay, jam: x.jam, slow: x.slow };
  return { enabled: true, used: await gUsed(env), cap: G_CAP, ids: out };
}

const json = (obj, maxAge) => new Response(JSON.stringify(obj), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=" + maxAge } });

function cors(req, env) {
  const o = req.headers.get("Origin") || "";
  const allow = (env.ALLOW_ORIGIN || "").split(",").map((s) => s.trim());
  const ok = allow.includes("*") || allow.includes(o) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
  return { "Access-Control-Allow-Origin": ok ? o || "*" : allow[0] || "", "Vary": "Origin" };
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const h = cors(req, env);
    if (req.method === "OPTIONS") return new Response(null, { headers: { ...h, "Access-Control-Allow-Methods": "GET", "Access-Control-Max-Age": "86400" } });
    const cache = caches.default;
    let res;
    if (url.pathname === "/waits") {
      const key = new Request(url.origin + "/waits");
      res = url.searchParams.has("fresh") ? null : await cache.match(key);
      if (!res) { res = json(await snapshot(), CACHE_S); ctx.waitUntil(cache.put(key, res.clone())); }
    } else if (url.pathname === "/stats") {
      const ids = (url.searchParams.get("ids") || "").split(",").map((x) => x.trim()).filter((x) => /^[a-z]{2}-[a-z0-9-]{2,40}$/.test(x)).slice(0, 12).sort();
      if (!ids.length) return new Response("ids?", { status: 400, headers: h });
      const key = new Request(url.origin + "/stats?ids=" + ids.join(","));
      res = await cache.match(key);
      if (!res) { res = json(await stats(env, ids), 900); ctx.waitUntil(cache.put(key, res.clone())); }
    } else if (url.pathname === "/gq") {
      // Google kolona pred mejo; ob odprtju aplikacije osvezi meritve, starejse od 15 min
      const ids = (url.searchParams.get("ids") || "").split(",").map((x) => x.trim()).filter((x) => GQ[x]).slice(0, 3).sort();
      if (!ids.length) return json({ enabled: !!env.GOOGLE_ROUTES_KEY, ids: {} }, 60);
      const key = new Request(url.origin + "/gq?ids=" + ids.join(","));
      res = await cache.match(key);
      if (!res) { await gRefresh(env, ids, 15, 6); res = json(await gRead(env, ids), 120); ctx.waitUntil(cache.put(key, res.clone())); }
    } else {
      return new Response("PrometInfo live: /waits, /stats?ids=, /gq?ids=", { headers: h });
    }
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(h)) out.headers.set(k, v);
    return out;
  },
  // vsakih 15 min (wrangler-live.toml [triggers]) zapise posnetek cakanj osebnih vozil v D1
  async scheduled(event, env, ctx) {
    ctx.waitUntil(collect(env).then((n) => console.log("zgodovina +" + n), (e) => console.log("zgodovina napaka", e && e.message)));
    // Google: enkrat na uro med 6. in 22. uro po lokalnem casu (~3.100 klicev/mesec), le ce je kljuc nastavljen
    const [, hr] = localDH(Date.now()), min = new Date().getUTCMinutes();
    if (env.GOOGLE_ROUTES_KEY && min < 15 && hr >= 6 && hr <= 22) ctx.waitUntil(gRefresh(env, Object.keys(GQ), 50, 6).then((n) => console.log("google +" + n), (e) => console.log("google napaka", e && e.message)));
  },
};
