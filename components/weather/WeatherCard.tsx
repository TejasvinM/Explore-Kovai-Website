"use client";

import { useEffect, useState } from "react";
import type { Weather } from "@/lib/api";
import WeatherIcon from "./WeatherIcon";

type State = { slug: string; data: Weather | null; failed: boolean };
const memory = new Map<string, Weather>(); // reuse answers while moving around the map

const dayName = (iso: string, i: number) =>
  i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Date(iso + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short" });

/**
 * Live weather for a place. Loads after the page, so pages stay fast and static.
 * `chip` is a one-line version for the map panel. If the weather service is down,
 * the card says so quietly (the chip just disappears).
 */
export default function WeatherCard({ slug, name, variant = "card" }: { slug: string; name: string; variant?: "card" | "chip" }) {
  const [state, setState] = useState<State>({ slug, data: memory.get(slug) ?? null, failed: false });

  useEffect(() => {
    if (memory.has(slug)) {
      setState({ slug, data: memory.get(slug)!, failed: false });
      return;
    }
    setState({ slug, data: null, failed: false });
    const ctrl = new AbortController();
    fetch(`/api/weather/${slug}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((w: Weather) => {
        memory.set(slug, w);
        setState({ slug, data: w, failed: false });
      })
      .catch((e) => {
        if ((e as Error)?.name !== "AbortError") setState({ slug, data: null, failed: true });
      });
    return () => ctrl.abort();
  }, [slug]);

  const w = state.slug === slug ? state.data : null;

  if (variant === "chip") {
    if (!w) return null;
    return (
      <span className="wx-chip" title={`Weather now at ${name}`}>
        <WeatherIcon icon={w.current.icon} />
        {w.current.temp_c}°C · {w.current.label}
      </span>
    );
  }

  return (
    <section className="wx" aria-labelledby={`wx-${slug}`} aria-busy={!w && !state.failed}>
      <h2 id={`wx-${slug}`} className="wx-title">
        Weather at {name}
      </h2>
      {state.failed ? (
        <p className="wx-off">Weather isn&apos;t available right now. Please check a forecast before you go.</p>
      ) : !w ? (
        <div className="wx-skeleton" aria-hidden="true" />
      ) : (
        <>
          <div className="wx-now">
            <WeatherIcon icon={w.current.icon} className="wx-big" />
            <div>
              <p className="wx-temp">
                {w.current.temp_c}
                <span>°C</span>
              </p>
              <p className="wx-label">{w.current.label}</p>
            </div>
            <dl className="wx-facts">
              <div>
                <dt>Feels like</dt>
                <dd>{w.current.feels_like_c}°C</dd>
              </div>
              <div>
                <dt>Humidity</dt>
                <dd>{w.current.humidity}%</dd>
              </div>
              <div>
                <dt>Wind</dt>
                <dd>{w.current.wind_kmh} km/h</dd>
              </div>
            </dl>
          </div>
          <ol className="wx-days">
            {w.daily.map((d, i) => (
              <li key={d.date}>
                <span className="wx-day">{dayName(d.date, i)}</span>
                <WeatherIcon icon={d.icon} />
                <span className="wx-range">
                  <b>{d.max_c}°</b> {d.min_c}°
                </span>
                <span className="wx-rain">{d.rain_chance != null ? `${d.rain_chance}% rain` : d.label}</span>
              </li>
            ))}
          </ol>
          <p className="wx-src">
            Weather data by{" "}
            <a href={w.source.url} target="_blank" rel="noopener">
              {w.source.name}
            </a>{" "}
            ({w.source.licence}), updated {w.current.time.slice(11, 16)} IST.
          </p>
        </>
      )}
    </section>
  );
}
