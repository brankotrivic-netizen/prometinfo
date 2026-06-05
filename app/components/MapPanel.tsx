"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./LeafletMap";

// Leaflet dostopa do window -> nalozi samo na klientu (ssr: false).
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Nalaganje zemljevida…</div>,
});

export default function MapPanel({ points }: { points: MapPoint[] }) {
  return (
    <div className="map-wrap">
      <LeafletMap points={points} />
    </div>
  );
}
