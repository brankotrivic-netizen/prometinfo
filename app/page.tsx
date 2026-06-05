import { getBorders } from "@/lib/cache";
import { COUNTRY_NAMES, type WaitLevel, type Country, type WaitReport } from "@/lib/types";
import MapPanel from "./components/MapPanel";
import type { MapPoint } from "./components/LeafletMap";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LEVEL_LABEL: Record<WaitLevel, string> = {
  none: "Brez", low: "Kratko", moderate: "Zmerno", high: "Daljše", severe: "Dolgo", unknown: "Ni podatka",
};
const FLAG: Record<Country, string> = { HR: "🇭🇷", RS: "🇷🇸", ME: "🇲🇪", SI: "🇸🇮", MK: "🇲🇰", BA: "🇧🇦", XK: "🇽🇰" };
const ALL_COUNTRIES: Country[] = ["BA", "HR", "RS", "ME", "MK"];

function waitText(min: number | null): string {
  if (min == null) return "ni podatka";
  if (min <= 0) return "brez zadrževanja";
  if (min < 60) return `~${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `~${h} h ${m} min` : `~${h} h`;
}
function relTime(iso: string): string {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "pravkar";
  if (s < 3600) return `pred ${Math.round(s / 60)} min`;
  return `pred ${Math.round(s / 3600)} h`;
}

export default async function Home() {
  let payload;
  try {
    payload = await getBorders();
  } catch {
    payload = null;
  }

  const sources = payload?.reports ?? [];
  const active = sources.filter((s) => s.ok && s.reports.length > 0);
  const pending = sources.filter((s) => s.pending);
  const allReports: WaitReport[] = active.flatMap((s) => s.reports);

  // Povzetek po nivojih
  const counts: Record<WaitLevel, number> = { none: 0, low: 0, moderate: 0, high: 0, severe: 0, unknown: 0 };
  for (const r of allReports) counts[r.level]++;

  // Tocke za zemljevid (samo s koordinatami)
  const points: MapPoint[] = allReports
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) => ({
      id: r.id, crossing: r.crossing, neighbor: r.neighbor,
      lat: r.lat as number, lng: r.lng as number,
      level: r.level, waitMinutes: r.waitMinutes, rawStatus: r.rawStatus,
    }));

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>Promet<span>Info</span></h1>
          <p className="subtitle">Čakanje na mejnih prehodih · bivša Jugoslavija</p>
        </div>
        {payload && (
          <span className={`meta ${payload.stale ? "stale" : ""}`}>
            ⟳ osveženo {relTime(payload.cachedAt)}{payload.stale ? " · zastarelo" : ""}
          </span>
        )}
      </header>

      {/* Povzetek */}
      <div className="stats">
        <div className="stat"><b>{allReports.length}</b><span>prehodov</span></div>
        <div className="stat ok"><b>{counts.none + counts.low}</b><span>prevozno</span></div>
        <div className="stat warn"><b>{counts.moderate + counts.high}</b><span>zastoji</span></div>
        <div className="stat bad"><b>{counts.severe}</b><span>daljša čakanja</span></div>
        <div className="stat muted"><b>{counts.unknown}</b><span>ni podatka</span></div>
      </div>

      {/* Izbirniki drzav */}
      <div className="chips">
        {ALL_COUNTRIES.map((c) => {
          const src = sources.find((s) => s.country === c);
          const isActive = src?.ok && (src.reports.length > 0);
          return (
            <span key={c} className={`chip ${isActive ? "active" : "soon"}`}>
              {FLAG[c]} {COUNTRY_NAMES[c]}
              {isActive ? <em>{src!.reports.length}</em> : <em className="soon-tag">v pripravi</em>}
            </span>
          );
        })}
      </div>

      {/* Zemljevid */}
      <MapPanel points={points} />

      <div className="legend">
        <span><i className="dot b-none" /> brez</span>
        <span><i className="dot b-low" /> do 30 min</span>
        <span><i className="dot b-moderate" /> do 1 h</span>
        <span><i className="dot b-high" /> do 2 h</span>
        <span><i className="dot b-severe" /> nad 2 h</span>
        <span><i className="dot b-unknown" /> ni podatka</span>
      </div>

      {/* Seznam po aktivnih virih, grupiran po sosednji drzavi */}
      {active.map((src) => {
        const byNeighbor = new Map<string, WaitReport[]>();
        for (const r of src.reports) {
          const key = r.neighbor ?? "?";
          (byNeighbor.get(key) ?? byNeighbor.set(key, []).get(key)!).push(r);
        }
        return (
          <section className="country-group" key={src.source}>
            <h2>{FLAG[src.country]} {COUNTRY_NAMES[src.country]} <span className="src">· vir: {src.source}</span></h2>
            {[...byNeighbor.entries()].map(([nb, list]) => (
              <div key={nb} className="neighbor-block">
                <h3 className="neighbor-title">
                  {FLAG[src.country]} → {nb !== "?" ? `${FLAG[nb as Country]} ${COUNTRY_NAMES[nb as Country]}` : "ostalo"}
                  <span className="cnt">{list.length}</span>
                </h3>
                <div className="grid">
                  {list.map((r) => (
                    <article key={r.id} className={`card lvl-${r.level}`}>
                      <div className="name">{r.crossing}</div>
                      <div className="wait">
                        <span className={`badge b-${r.level}`}>{LEVEL_LABEL[r.level]}</span>
                        <span>{waitText(r.waitMinutes)}</span>
                      </div>
                      <div className="raw">{r.rawStatus}</div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}

      {/* Viri v pripravi */}
      {pending.length > 0 && (
        <section className="country-group">
          <h2>Viri v pripravi</h2>
          <div className="pending-grid">
            {pending.map((s) => (
              <div key={s.source} className="pending-card">
                <div className="name">{FLAG[s.country]} {COUNTRY_NAMES[s.country]} <span className="src">· {s.source}</span></div>
                <div className="raw">{s.note}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="note">
        <strong>Opomba o virih:</strong> podatki so povzeti po uradnih avto-moto zvezah in se
        osvežujejo na ~5 minut. Čakalne dobe so pogosto opisne ocene ("ne dlje od 30 minut"),
        ne natančne meritve — preverite tudi izvorni vir. Koordinate prehodov so približne (osnutek).
        <br />API za mobilno aplikacijo: <code>/api/borders</code>
      </footer>
    </div>
  );
}
