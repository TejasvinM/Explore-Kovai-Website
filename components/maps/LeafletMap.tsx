"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LMap } from "leaflet";

export type MapMarker = {
  lat: number;
  lon: number;
  label: string;
  href?: string;
  /** shown inside the marker (e.g. stop number); a dot when omitted */
  text?: string;
  color?: string;
  main?: boolean;
};
export type MapLine = { points: [number, number][]; color: string; label?: string };

// OpenStreetMap's own tiles: free, no API key, credit required. They're light, so CSS darkens them
// to match the site (see .lmap-dark). For heavy production traffic, set NEXT_PUBLIC_MAP_TILES (and
// NEXT_PUBLIC_MAP_ATTRIBUTION) to a commercial provider; custom tiles are shown unfiltered.
const CUSTOM_TILES = process.env.NEXT_PUBLIC_MAP_TILES;
const TILES = CUSTOM_TILES || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Interactive map (Leaflet + OpenStreetMap data). Leaflet only runs in the browser, so it is
 * loaded after the page; until then (or without JavaScript) a plain list of the places shows.
 */
export default function LeafletMap({
  markers,
  lines = [],
  label,
  className = "",
}: {
  markers: MapMarker[];
  lines?: MapLine[];
  label: string;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const key = JSON.stringify([markers, lines]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;
      map.current?.remove();
      const m = L.map(el.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
      map.current = m;
      m.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
      L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(m);

      lines.forEach((ln) =>
        L.polyline(ln.points, { color: ln.color, weight: 3, opacity: 0.85, dashArray: "6 8" })
          .addTo(m)
          .bindTooltip(ln.label ?? "", { sticky: true, opacity: ln.label ? 0.9 : 0 }),
      );

      const pts: [number, number][] = [];
      markers.forEach((mk) => {
        const icon = L.divIcon({
          className: "lmk-wrap",
          html: `<span class="lmk${mk.main ? " lmk-main" : ""}${mk.text ? " lmk-num" : ""}" style="--c:${mk.color ?? "#d4af37"}">${mk.text ? esc(mk.text) : ""}</span>`,
          iconSize: mk.text || mk.main ? [30, 30] : [16, 16],
          iconAnchor: mk.text || mk.main ? [15, 15] : [8, 8],
        });
        const marker = L.marker([mk.lat, mk.lon], { icon, title: mk.label, keyboard: true, alt: mk.label }).addTo(m);
        const popup = mk.href ? `<a href="${esc(mk.href)}">${esc(mk.label)} →</a>` : esc(mk.label);
        marker.bindPopup(popup);
        if (mk.main) marker.bindTooltip(esc(mk.label), { permanent: true, direction: "top", offset: [0, -16], className: "lmk-tip" });
        pts.push([mk.lat, mk.lon]);
      });
      lines.forEach((ln) => pts.push(...ln.points));

      if (pts.length === 1) m.setView(pts[0], 12);
      else if (pts.length) m.fitBounds(L.latLngBounds(pts), { padding: [36, 36], maxZoom: 13 });
      // let people scroll the page past the map; clicking the map turns wheel-zoom on
      m.on("click focus", () => m.scrollWheelZoom.enable());
      m.on("mouseout blur", () => m.scrollWheelZoom.disable());
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div className={`lmap${CUSTOM_TILES ? "" : " lmap-dark"} ${className}`}>
      <div ref={el} className="lmap-canvas" role="region" aria-label={label} />
      <noscript>
        <ul className="lmap-fallback">
          {markers.map((m) => (
            <li key={m.label}>{m.label}</li>
          ))}
        </ul>
      </noscript>
    </div>
  );
}
