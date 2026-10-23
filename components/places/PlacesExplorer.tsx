"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaceDetail } from "@/lib/api";
import { MAP, toMap } from "@/lib/content";
import { MAP_ART_ABOVE_ROUTE, MAP_ART_BELOW_ROUTE } from "@/components/mapArt";
import { PinIcon, RouteIcon, ZoomIcon } from "@/components/icons";
import Sources from "@/components/Sources";
import FavouriteButton from "@/components/session/FavouriteButton";
import WeatherCard from "@/components/weather/WeatherCard";

type Cat = { slug: string; name: string };

/**
 * The aerial map (pins, city cluster, zoom, drifting clouds), the detail panel beside it
 * and the place guide below, all driven by one filter.
 * Open a place directly with /places#slug.
 */
export default function PlacesExplorer({ places, categories }: { places: PlaceDetail[]; categories: Cat[] }) {
  const [filter, setFilter] = useState("all");
  const [cur, setCur] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [swap, setSwap] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLElement>(null);
  const reduce = useRef(false);

  const pos = places.map((p) => toMap(parseFloat(p.latitude), parseFloat(p.longitude)));
  const visible = useCallback(
    (f = filter) => places.map((p, i) => (f === "all" || p.category.slug === f ? i : -1)).filter((i) => i >= 0),
    [filter, places],
  );
  const cityCount = places.filter((p) => p.in_city).length;
  const city = toMap(MAP.cityLat, MAP.cityLon);
  const cityCentre = toMap(11.0168, 76.9558);

  const show = useCallback(
    (i: number, opts: { scroll?: boolean } = {}) => {
      setCur(i);
      setZoomed(places[i].in_city); // city places need the zoomed-in map to be seen
      if (!reduce.current) setSwap((s) => s + 1);
      if (opts.scroll) exploreRef.current?.scrollIntoView({ behavior: reduce.current ? "auto" : "smooth" });
    },
    [places],
  );

  const step = (d: number) => {
    const v = visible();
    const k = v.indexOf(cur);
    show(v[((k < 0 ? 0 : k + d) + v.length) % v.length]);
  };

  const choose = (f: string) => {
    setFilter(f);
    const v = visible(f);
    if (!v.includes(cur)) show(v[0]);
    setZoomed(f === "shop");
  };

  // zoom into the city: scale the map around the city centre and counter-scale the pins
  useEffect(() => {
    const map = mapRef.current,
      inner = innerRef.current;
    if (!map || !inner) return;
    const apply = () => {
      if (!zoomed) {
        inner.style.transform = "";
        inner.style.transformOrigin = "";
        return;
      }
      const iw = inner.offsetWidth,
        ih = inner.offsetHeight,
        mw = map.clientWidth,
        mh = map.clientHeight;
      const px = (city.x / 100) * iw,
        py = (city.y / 100) * ih;
      const tx = mw / 2 - (mw / 2 - iw / 2 + px),
        ty = mh / 2 - py;
      inner.style.transformOrigin = `${px}px ${py}px`;
      inner.style.transform = `translateX(-50%) translate(${tx}px,${ty}px) scale(${MAP.zoom})`;
      map.style.setProperty("--iz", (1 / MAP.zoom).toFixed(4));
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [zoomed, city.x, city.y]);

  // arrive from a link like /places#valparai
  useEffect(() => {
    reduce.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fromHash = (smooth: boolean) => {
      const h = decodeURIComponent(location.hash.slice(1));
      const k = places.findIndex((p) => p.slug === h);
      if (k < 0) return;
      setFilter("all");
      show(k);
      exploreRef.current?.scrollIntoView({ behavior: smooth && !reduce.current ? "smooth" : "auto" });
    };
    fromHash(false);
    const onHash = () => fromHash(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [places, show]);

  const p = places[cur];
  const pc = pos[cur];
  const counts = (slug: string) => places.filter((x) => x.category.slug === slug).length;
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      step(1);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <>
      <section className="explore" id="explore" ref={exploreRef} aria-labelledby="ex-title">
        <div className="section-head">
          <div>
            <div className="kicker">Places to visit</div>
            <h2 id="ex-title">Find your way around Kovai</h2>
            <p className="count">Tap a pin to see the place. Filter by the kind of trip you want.</p>
          </div>
        </div>
        <div className="chips" role="group" aria-label="Filter places">
          <button type="button" className="chip" aria-pressed={filter === "all"} onClick={() => choose("all")}>
            All <span>{places.length}</span>
          </button>
          {categories.map((c) => (
            <button key={c.slug} type="button" className="chip" aria-pressed={filter === c.slug} onClick={() => choose(c.slug)}>
              {c.name} <span>{counts(c.slug)}</span>
            </button>
          ))}
        </div>
        <div className="ex-grid">
          <div>
            <div className={`map${zoomed ? " zoomed" : ""}`} id="map" ref={mapRef} onKeyDown={onKey}>
              <div className="map-inner" id="map-inner" ref={innerRef}>
                <img className="map-terrain" src="/images/map-aerial.jpg" alt="" />
                <svg className="map-art" viewBox="0 0 550 1100" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
                  <g dangerouslySetInnerHTML={{ __html: MAP_ART_BELOW_ROUTE }} />
                  <line
                    id="route"
                    className="on"
                    x1={(cityCentre.x / 100) * 550}
                    y1={(cityCentre.y / 100) * 1100}
                    x2={(pc.x / 100) * 550}
                    y2={(pc.y / 100) * 1100}
                    stroke="#e8cf7c"
                    strokeWidth="2.4"
                    vectorEffect="non-scaling-stroke"
                  />
                  <g dangerouslySetInnerHTML={{ __html: MAP_ART_ABOVE_ROUTE }} />
                </svg>
                <button
                  type="button"
                  className="city-cluster"
                  style={{ left: `${cityCentre.x.toFixed(2)}%`, top: `${cityCentre.y.toFixed(2)}%` }}
                  aria-label={`${cityCount} places in Coimbatore city. Zoom in to see them`}
                  onClick={() => setZoomed(true)}
                >
                  <b>{cityCount}</b>
                  <span>in the city</span>
                </button>
                {places.map((pl, i) => {
                  const off = filter !== "all" && pl.category.slug !== filter;
                  return (
                    <button
                      key={pl.slug}
                      type="button"
                      className={`pin${pl.in_city ? " in-city" : ""}${off ? " dim" : ""}`}
                      data-cat={pl.category.slug}
                      style={{ left: `${pos[i].x.toFixed(2)}%`, top: `${pos[i].y.toFixed(2)}%` }}
                      aria-label={`${pl.name}, ${pl.category.name}`}
                      aria-pressed={i === cur}
                      tabIndex={off ? -1 : 0}
                      onClick={() => show(i)}
                    >
                      <span className="pin-dot" />
                      <span className="pin-label">{pl.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="sky" aria-hidden="true">
                <i className="cloud-shadow" />
                <i className="cloud" />
                <i className="cloud c2" />
              </div>
              <button type="button" className="zoom-btn" aria-pressed={zoomed} onClick={() => setZoomed((z) => !z)}>
                <ZoomIcon />
                <span>{zoomed ? "Show the whole district" : "Zoom into the city"}</span>
              </button>
            </div>
            <div className="legend" aria-hidden="true">
              <span><i style={{ background: "#e8cf7c" }} />Temples</span>
              <span><i style={{ background: "#8fd19e" }} />Hills &amp; wildlife</span>
              <span><i style={{ background: "#8fc6d6" }} />Falls &amp; dams</span>
              <span><i style={{ background: "#f0a08a" }} />City &amp; family</span>
              <span><i style={{ background: "#c9a7f0" }} />Malls</span>
              <span style={{ marginLeft: "auto" }}>Approximate positions · not to scale</span>
            </div>
          </div>

          <article className={`panel${swap ? " swap" : ""}`} key={swap} aria-live="polite" aria-label={p.name} onKeyDown={onKey}>
            <div className="pn-media">
              <img src={p.photo.url} alt={p.photo.alt || p.name} />
              {p.photo.representative && <span className="rep-chip">Representative image</span>}
              <div className="pn-num">
                {String(cur + 1).padStart(2, "0")}
                <small>/ {places.length}</small>
              </div>
            </div>
            <div className="pn-body">
              <span className="tag">{p.category.name}</span>
              <h3>{p.name}</h3>
              <p>{p.tagline}</p>
              <div className="pn-facts">
                <span>
                  <PinIcon />
                  {p.location_label}
                </span>
                <WeatherCard slug={p.slug} name={p.name} variant="chip" />
                <span>
                  <RouteIcon />
                  {p.in_city || !p.distance_km ? (
                    "In the city"
                  ) : (
                    <>
                      About {Math.round(parseFloat(p.distance_km))} km from the city centre{" "}
                      <small style={{ color: "var(--muted)" }}>(straight line)</small>
                    </>
                  )}
                </span>
              </div>
              {p.photo.credit && (
                <p className="pn-credit">
                  Photo:{" "}
                  <a href={p.photo.credit_url} target="_blank" rel="noopener">
                    {p.photo.credit}
                  </a>
                  , via Wikimedia Commons
                </p>
              )}
              <div className="pn-actions">
                <a className="btn btn-primary" href={p.directions_url} target="_blank" rel="noopener">
                  Directions <span aria-hidden="true">&#8599;</span>
                </a>
                <Link className="btn btn-ghost" href={`/places/${p.slug}`}>
                  Read more <span aria-hidden="true">&#8594;</span>
                </Link>
                <FavouriteButton kind="place" slug={p.slug} name={p.name} variant="icon" />
                <div className="pn-step">
                  <button type="button" aria-label="Previous place" onClick={() => step(-1)}>&#8592;</button>
                  <button type="button" aria-label="Next place" onClick={() => step(1)}>&#8594;</button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="pl-guide" id="guide" aria-labelledby="guide-title">
        <div className="section-head">
          <div>
            <div className="kicker">Know before you go</div>
            <h2 id="guide-title">The place guide</h2>
            <p className="count">
              History, what to see, timings and how to get there for all {places.length} places. Facts come from the
              sources under each entry; timings change, so check before you go.
            </p>
          </div>
        </div>
        {categories.map((c) => {
          const group = places.map((pl, i) => ({ pl, i })).filter(({ pl }) => pl.category.slug === c.slug);
          if (!group.length) return null;
          return (
            <div className="g-group" key={c.slug} data-cat={c.slug} hidden={filter !== "all" && filter !== c.slug}>
              <h3>
                {c.name} <span>{group.length}</span>
              </h3>
              {group.map(({ pl, i }) => (
                <GuideEntry key={pl.slug} place={pl} onMap={() => show(i, { scroll: true })} />
              ))}
            </div>
          );
        })}
      </section>
    </>
  );
}

function GuideEntry({ place: p, onMap }: { place: PlaceDetail; onMap: () => void }) {
  return (
    <article className="guide" id={`guide-${p.slug}`} data-cat={p.category.slug} aria-labelledby={`g-${p.slug}`}>
      <figure className="g-media">
        <img src={p.photo.url} alt={p.photo.alt || p.name} loading="lazy" />
        {p.photo.representative && <span className="rep-chip">Representative image</span>}
      </figure>
      <div className="g-text">
        <div className="g-top">
          <span className="tag">{p.category.name}</span>
          <span className="g-loc">
            <PinIcon />
            {p.location_label}
          </span>
        </div>
        <h4 id={`g-${p.slug}`}>
          <Link href={`/places/${p.slug}`} style={{ textDecoration: "none" }}>
            {p.name}
          </Link>
        </h4>
        {p.subtitle && <p className="g-sub">{p.subtitle}</p>}
        {p.about && <p className="g-about">{p.about}</p>}
        {p.facts.length > 0 && (
          <dl className="g-facts">
            {p.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.text}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="g-actions">
          <button type="button" className="btn btn-ghost g-map" onClick={onMap}>
            Show on map
          </button>
          <a className="g-link" href={p.directions_url} target="_blank" rel="noopener">
            Directions <span aria-hidden="true">&#8599;</span>
          </a>
          <Link className="g-link" href={`/places/${p.slug}`}>
            Full page <span aria-hidden="true">&#8594;</span>
          </Link>
        </div>
        <Sources sources={p.sources} credit={p.photo} />
      </div>
    </article>
  );
}
