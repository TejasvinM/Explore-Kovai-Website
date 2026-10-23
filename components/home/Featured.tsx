"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FEATURED } from "@/lib/content";

export default function Featured() {
  const [cur, setCur] = useState(0);
  const [swap, setSwap] = useState(0); // re-triggers the copy animation
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchX = useRef<number | null>(null);
  const n = FEATURED.length;

  const show = (i: number, focus = false) => {
    const next = (i + n) % n;
    setCur(next);
    setSwap((s) => s + 1);
    if (focus) tabs.current[next]?.focus();
  };
  const d = FEATURED[cur];

  return (
    <section className="featured" id="featured" aria-labelledby="feat-title">
      <div className="featured-inner">
        <div className="section-head">
          <div>
            <div className="kicker">In the city</div>
            <h2 id="feat-title">Featured destinations</h2>
            <p className="count">Experience the most iconic and breathtaking travel spots.</p>
          </div>
          <div className="strip-ctrls feat-nav">
            <button type="button" aria-label="Previous destination" onClick={() => show(cur - 1)}>&#8592;</button>
            <button type="button" aria-label="Next destination" onClick={() => show(cur + 1)}>&#8594;</button>
          </div>
        </div>

        <div className="feat-stage" role="region" aria-roledescription="carousel" aria-label="Featured destinations">
          <div
            className="feat-media"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
              touchX.current = null;
            }}
          >
            {FEATURED.map((f, i) => (
              <figure
                key={f.name}
                className={`feat-slide${i === cur ? " is-active" : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}`}
                style={f.tint ? ({ "--c": f.tint } as React.CSSProperties) : undefined}
              >
                <img loading={i === 0 ? undefined : "lazy"} src={f.img} alt={f.alt} />
                {f.rep && <span className="rep-tag">Representative image</span>}
              </figure>
            ))}
            <div className="feat-num" aria-hidden="true">
              <span>{String(cur + 1).padStart(2, "0")}</span>
              <small>/ {String(n).padStart(2, "0")}</small>
            </div>
          </div>

          <div className="feat-panel">
            <div className={`feat-copy${swap ? " swap" : ""}`} key={swap} aria-live="polite">
              <span className="tag">{d.tag}</span>
              <h3>{d.name}</h3>
              <p>{d.text}</p>
              <p className="loc">{d.loc}</p>
              {d.link && (
                <Link className="feat-link" href={d.link}>
                  {d.linkText} <span aria-hidden="true">&#8594;</span>
                </Link>
              )}
            </div>
            <ul className="feat-index" role="tablist" aria-label="Choose a destination">
              {FEATURED.map((f, i) => (
                <li key={f.name}>
                  <button
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    role="tab"
                    aria-selected={i === cur}
                    tabIndex={i === cur ? 0 : -1}
                    onClick={() => show(i)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                        e.preventDefault();
                        show(cur + 1, true);
                      }
                      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                        e.preventDefault();
                        show(cur - 1, true);
                      }
                    }}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span>{f.name}</span>
                    <span className="arr">&#8594;</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
