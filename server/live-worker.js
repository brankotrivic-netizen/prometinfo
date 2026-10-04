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
    if (url.pathname !== "/waits") return new Response("PrometInfo live: /waits", { headers: h });
    const cache = caches.default, key = new Request(url.origin + "/waits");
    let res = url.searchParams.has("fresh") ? null : await cache.match(key);
    if (!res) {
      const [H, B, A] = await Promise.all([wrap(hak()), wrap(bihamk()), wrap(amss())]);
      const body = JSON.stringify({ ts: new Date().toISOString(), hak: H, bihamk: B, amss: A });
      res = new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": `public, max-age=${CACHE_S}` } });
      ctx.waitUntil(cache.put(key, res.clone()));
    }
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(h)) out.headers.set(k, v);
    return out;
  },
};
