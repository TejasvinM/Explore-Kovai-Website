"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdventureDetail, Band } from "@/lib/api";
import AdventureStop from "./AdventureStop";

const BANDS: { key: Band; label: string }[] = [
  { key: "easy", label: "Easy" },
  { key: "moderate", label: "Moderate" },
  { key: "hard", label: "Challenging" },
];

/**
 * The adventure trail: difficulty chips, the stops, and a gold path that is drawn
 * through the stop markers and fills in as you scroll. Also moves the hero ridgelines.
 */
export default function Trail({ adventures }: { adventures: AdventureDetail[] }) {
  const [filter, setFilter] = useState<"all" | Band>("all");
  const list = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const base = useRef<SVGPathElement>(null);
  const walk = useRef<SVGPathElement>(null);
  const len = useRef(0);

  const progress = useCallback(() => {
    const w = walk.current,
      l = list.current;
    if (!w || !l || !len.current) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      w.style.strokeDashoffset = "0";
      return;
    }
    const r = l.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.65 - r.top) / r.height));
    w.style.strokeDashoffset = (len.current * (1 - p)).toFixed(1);
  }, []);

  const build = useCallback(() => {
    const l = list.current,
      s = svg.current,
      b = base.current,
      w = walk.current;
    if (!l || !s || !b || !w) return;
    const box = l.getBoundingClientRect();
    s.setAttribute("viewBox", `0 0 ${box.width} ${l.offsetHeight}`);
    const pts: [number, number][] = [];
    l.querySelectorAll<HTMLElement>(".stop:not(.hide) .stop-mark").forEach((m) => {
      const r = m.getBoundingClientRect();
      pts.push([r.left - box.left + r.width / 2, r.top - box.top + r.height / 2]);
    });
    if (!pts.length) {
      b.setAttribute("d", "");
      w.setAttribute("d", "");
      len.current = 0;
      return;
    }
    const swing = window.innerWidth <= 860 ? 14 : Math.min(160, box.width * 0.12);
    let d = `M${pts[0][0]} ${Math.max(0, pts[0][1] - 120)} L${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1],
        c = pts[i],
        dir = i % 2 ? 1 : -1,
        my = c[1] - a[1];
      d += ` C${a[0] + dir * swing} ${a[1] + my * 0.35},${c[0] - dir * swing} ${c[1] - my * 0.35},${c[0]} ${c[1]}`;
    }
    const last = pts[pts.length - 1];
    d += ` L${last[0]} ${last[1] + 90}`;
    b.setAttribute("d", d);
    w.setAttribute("d", d);
    len.current = w.getTotalLength();
    w.style.strokeDasharray = String(len.current);
    progress();
  }, [progress]);

  // redraw when the filter changes
  useEffect(() => {
    build();
  }, [filter, build]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ridges = Array.from(document.querySelectorAll<HTMLElement>(".ridge"));
    const hero = document.querySelector<HTMLElement>(".ad-hero");
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        progress();
        if (reduce || !hero) return;
        const y = Math.min(window.scrollY, hero.offsetHeight);
        ridges.forEach((r, i) => (r.style.transform = `translateY(${(y * (0.12 + i * 0.12)).toFixed(1)}px)`));
      });
    };
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(build, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", build);
    document.fonts?.ready.then(build);
    const imgs = Array.from(list.current?.querySelectorAll("img") ?? []).filter((im) => !im.complete);
    imgs.forEach((im) => im.addEventListener("load", build, { once: true }));
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", build);
    };
  }, [build, progress]);

  const count = (b: Band) => adventures.filter((a) => a.band === b).length;

  return (
    <>
      <section className="tr-head" id="trail" aria-labelledby="tr-title">
        <div className="section-head">
          <div>
            <div className="kicker">The trail gets steeper as you go</div>
            <h2 id="tr-title">Pick your pace</h2>
            <p className="count">Each stop has where, when and what to know, with sources. Ratings are ours.</p>
          </div>
        </div>
        <div className="chips" role="group" aria-label="Filter by difficulty">
          <button type="button" className="chip" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            All <span>{adventures.length}</span>
          </button>
          {BANDS.filter((b) => count(b.key) > 0).map((b) => (
            <button key={b.key} type="button" className="chip" aria-pressed={filter === b.key} onClick={() => setFilter(b.key)}>
              {b.label} <span>{count(b.key)}</span>
            </button>
          ))}
        </div>
      </section>
      <div className="trail" id="trail-list" ref={list}>
        <svg className="trail-svg" ref={svg} aria-hidden="true">
          <path className="base" ref={base} d="" />
          <path className="walk" ref={walk} d="" />
        </svg>
        {adventures.map((a, i) => (
          <AdventureStop key={a.slug} a={a} index={i} hidden={filter !== "all" && a.band !== filter} />
        ))}
      </div>
    </>
  );
}
