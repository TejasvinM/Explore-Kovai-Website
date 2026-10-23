"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Place } from "@/lib/api";
import { CATEGORY_LABEL_SHORT } from "@/lib/content";
import { ArrowRight } from "@/components/icons";

export default function PlacesStrip({ places, total }: { places: Place[]; total: number }) {
  const strip = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const el = strip.current;
    if (!el) return;
    const card = el.querySelector(".carousel-card");
    const step = card ? card.getBoundingClientRect().width + 20 : 300;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };
  const more = total - places.length;

  return (
    <section className="places" id="places" aria-labelledby="places-title">
      <div className="section-head">
        <div>
          <div className="kicker">Places to visit</div>
          <h2 id="places-title">Explore beautiful places</h2>
          <p className="count">
            {places.length} favourites from {total} places across the district
          </p>
        </div>
        <div className="head-actions">
          <div className="strip-ctrls">
            <button type="button" aria-label="Previous places" onClick={() => scroll(-1)}>&#8592;</button>
            <button type="button" aria-label="Next places" onClick={() => scroll(1)}>&#8594;</button>
          </div>
          <Link className="view-all" href="/places">
            View all places <ArrowRight />
          </Link>
        </div>
      </div>
      <div className="carousel-container" ref={strip} tabIndex={0} aria-label="Places, scrollable">
        <div className="carousel-track">
          {places.map((p) => {
            const tag = CATEGORY_LABEL_SHORT[p.category.slug] ?? p.category.name;
            return (
              <article className="carousel-card" data-cat={tag} key={p.slug}>
                <img loading="lazy" src={p.photo.url} alt={p.photo.alt || p.name} />
                {p.photo.credit && (
                  <a className="credit" href={p.photo.credit_url} target="_blank" rel="noopener">
                    Photo: {p.photo.credit}
                  </a>
                )}
                <Link className="card-link" href={`/places#${p.slug}`} aria-label={`${p.name}: see it on the map`} />
                <div className="card-overlay">
                  <span className="tag">{tag}</span>
                  <h3>{p.name}</h3>
                  <p>{p.tagline}</p>
                  <p className="loc">{p.location_label}</p>
                  <span className="map-cue" aria-hidden="true">See on map &#8594;</span>
                </div>
              </article>
            );
          })}
          {more > 0 && (
            <Link className="carousel-card more-tile" href="/places">
              <span className="mt-num">+{more}</span>
              <span className="mt-text">more places on the map</span>
              <span className="mt-go">
                Explore all {total} <ArrowRight />
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
