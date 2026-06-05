"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { WaitLevel } from "@/lib/types";

export interface MapPoint {
  id: string;
  crossing: string;
  neighbor: string | null;
  lat: number;
  lng: number;
  level: WaitLevel;
  waitMinutes: number | null;
  rawStatus: string;
}

const LEVEL_COLOR: Record<WaitLevel, string> = {
  none: "#2dd4a7",
  low: "#5fd35f",
  moderate: "#e7c84b",
  high: "#f29c3e",
  severe: "#ef4d56",
  unknown: "#6b7a8d",
};

const FLAG: Record<string, string> = { HR: "🇭🇷", RS: "🇷🇸", ME: "🇲🇪", SI: "🇸🇮", MK: "🇲🇰", BA: "🇧🇦", XK: "🇽🇰" };

export default function LeafletMap({ points }: { points: MapPoint[] }) {
  return (
    <MapContainer
      center={[44.0, 17.9]}
      zoom={7}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", background: "#0b0f15" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {points.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={8}
          pathOptions={{
            color: "#0b0f15",
            weight: 1.5,
            fillColor: LEVEL_COLOR[p.level],
            fillOpacity: 0.9,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={1}>
            <strong>{p.crossing}</strong> {p.neighbor ? FLAG[p.neighbor] : ""}
          </Tooltip>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong>
                {FLAG.BA} {p.crossing} {p.neighbor ? `→ ${FLAG[p.neighbor]}` : ""}
              </strong>
              <div style={{ marginTop: 4 }}>
                {p.waitMinutes == null
                  ? "ni podatka"
                  : p.waitMinutes <= 0
                    ? "brez zadrževanja"
                    : `~${p.waitMinutes} min`}
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{p.rawStatus}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
