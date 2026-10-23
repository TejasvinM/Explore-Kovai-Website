"use client";

import dynamic from "next/dynamic";
import type { NearbyPlace, Place } from "@/lib/api";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false, loading: () => <div className="lmap lmap-loading" /> });

/** A place on a real map, with the nearby places around it. */
export default function PlaceMap({ place, nearby }: { place: Place; nearby: NearbyPlace[] }) {
  return (
    <LeafletMap
      label={`Map of ${place.name} and nearby places`}
      markers={[
        { lat: parseFloat(place.latitude), lon: parseFloat(place.longitude), label: place.name, main: true },
        ...nearby.map((n) => ({
          lat: parseFloat(n.latitude),
          lon: parseFloat(n.longitude),
          label: `${n.name} (${n.km_from_you} km)`,
          href: `/places/${n.slug}`,
          color: "#f3ede1",
        })),
      ]}
    />
  );
}
