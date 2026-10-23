import Link from "next/link";
import type { Place } from "@/lib/api";
import { CATEGORY_LABEL_SHORT } from "@/lib/content";

/** Photo card that links to a place's own page. */
export default function PlaceCard({ place: p, note }: { place: Place; note?: string }) {
  const tag = CATEGORY_LABEL_SHORT[p.category.slug] ?? p.category.name;
  return (
    <article className="carousel-card" data-cat={tag}>
      <img loading="lazy" src={p.photo.url} alt={p.photo.alt || p.name} />
      {p.photo.representative && <span className="rep-tag">Representative image</span>}
      <Link className="card-link" href={`/places/${p.slug}`} aria-label={p.name} />
      <div className="card-overlay">
        <span className="tag">{tag}</span>
        <h3>{p.name}</h3>
        <p>{p.tagline}</p>
        <p className="loc">{note ?? p.location_label}</p>
      </div>
    </article>
  );
}
