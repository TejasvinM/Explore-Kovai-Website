"use client";

import dynamic from "next/dynamic";
import type { Plan } from "@/lib/api";
import { DAY_COLOURS } from "@/lib/content";
import type { MapLine, MapMarker } from "./LeafletMap";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false, loading: () => <div className="lmap lmap-loading" /> });

const CITY: [number, number] = [11.0168, 76.9558];

/** The whole trip on one map: numbered stops, one coloured line per day from the city centre. */
export default function TripMap({ plan }: { plan: Plan }) {
  const markers: MapMarker[] = [{ lat: CITY[0], lon: CITY[1], label: "Coimbatore city centre (start of each day)", color: "#f3ede1" }];
  const lines: MapLine[] = [];
  plan.days.forEach((d, di) => {
    const colour = DAY_COLOURS[di % DAY_COLOURS.length];
    const pts: [number, number][] = [CITY];
    d.stops.forEach((s, si) => {
      const lat = parseFloat(s.place.latitude),
        lon = parseFloat(s.place.longitude);
      pts.push([lat, lon]);
      markers.push({ lat, lon, label: `Day ${d.number}, stop ${si + 1}: ${s.place.name}`, href: `/places/${s.place.slug}`, text: String(si + 1), color: colour });
    });
    lines.push({ points: pts, color: colour, label: `Day ${d.number} (straight lines between stops)` });
  });
  return (
    <div className="trip-map">
      <LeafletMap markers={markers} lines={lines} label="Map of the trip" />
      <p className="trip-map-key">
        {plan.days.map((d, i) => (
          <span key={d.number}>
            <i style={{ background: DAY_COLOURS[i % DAY_COLOURS.length] }} />
            Day {d.number}
          </span>
        ))}
        <span className="trip-map-note">Lines join the stops in order; they aren&apos;t road routes.</span>
      </p>
    </div>
  );
}
