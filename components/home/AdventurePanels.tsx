"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AdventureDetail } from "@/lib/api";
import { ArrowRight } from "@/components/icons";
import Meter from "@/components/Meter";

/** Expanding panels: hover (desktop) or tap to open one adventure. */
export default function AdventurePanels({ adventures }: { adventures: AdventureDetail[] }) {
  const row = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(0);
  const [anim, setAnim] = useState<"" | "adv-anim" | "adv-anim in">("");
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const narrow = () => window.innerWidth <= 820;

  // on phones the open panel grows to fit its text
  useEffect(() => {
    const fit = () => {
      const el = row.current?.querySelectorAll<HTMLElement>(".adv")[open];
      if (!el) return;
      if (!narrow()) return el.style.removeProperty("--open-h");
      const body = el.querySelector<HTMLElement>(".adv-body");
      if (body) el.style.setProperty("--open-h", Math.max(440, body.scrollHeight + 200) + "px");
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open]);

  // entrance animation (skipped when the visitor prefers less motion)
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const el = row.current;
    if (!el) return;
    setAnim("adv-anim");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (setAnim("adv-anim in"), io.disconnect())),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const canHover = () => matchMedia("(hover:hover) and (pointer:fine)").matches;

  return (
    <section className="adventures" id="adventures" aria-labelledby="adv-title">
      <div className="adv-inner">
        <div className="section-head">
          <div>
            <div className="kicker">Adventures &amp; hotspots</div>
            <h2 id="adv-title">Pick your thrill</h2>
            <p className="count">
              From an easy forest day to a seven-hill climb. Open a panel to see where, when and what to know.
            </p>
          </div>
          <div className="adv-scale" aria-hidden="true">
            <span>Easy</span>
            <i />
            <span>Strenuous</span>
          </div>
        </div>
        <div className={`adv-row ${anim}`} id="adv-row" ref={row}>
          {adventures.map((a, i) => {
            const isOpen = i === open;
            const bodyId = `adv-body-${a.slug}`;
            return (
              <article
                key={a.slug}
                className={`adv${isOpen ? " is-open" : ""}`}
                id={`adv-${a.slug}`}
                data-lvl={a.level}
                onMouseEnter={() => {
                  if (!canHover() || narrow()) return;
                  hoverTimer.current = setTimeout(() => setOpen(i), 160);
                }}
                onMouseLeave={() => clearTimeout(hoverTimer.current)}
              >
                <div className="adv-media">
                  <img src={a.photo.url} alt="" loading="lazy" />
                  <span className="rep">
                    {a.photo.representative ? "Representative image" : a.image_caption || a.name}
                  </span>
                </div>
                <button
                  type="button"
                  className="adv-tab"
                  aria-expanded={isOpen}
                  aria-controls={bodyId}
                  onClick={() => {
                    setOpen(i);
                    requestAnimationFrame(() =>
                      document.getElementById(bodyId)?.focus({ preventScroll: true }),
                    );
                  }}
                >
                  <span className="adv-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="adv-v">{a.name}</span>
                  <Meter level={a.level} />
                  <span className="sr">, thrill level {a.level_label}</span>
                </button>
                <div className="adv-body" id={bodyId} role="region" aria-label={a.name} tabIndex={-1}>
                  <div className="adv-lvl">
                    <Meter level={a.level} />
                    <span>{a.level_label}</span>
                    <small>our rating</small>
                  </div>
                  <h3>{a.name}</h3>
                  <p className="adv-line">{a.tagline}</p>
                  <dl className="adv-facts">
                    {a.facts.slice(0, 3).map((f) => (
                      <div key={f.label}>
                        <dt>{f.label}</dt>
                        <dd>{f.text}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="adv-src">
                    Sources:{" "}
                    {a.sources.map((s, k) => (
                      <span key={s.url}>
                        {k > 0 && " · "}
                        <a href={s.url} target="_blank" rel="noopener" tabIndex={isOpen ? 0 : -1}>
                          {s.title}
                        </a>
                      </span>
                    ))}
                  </p>
                  <Link className="feat-link" href={`/adventures/${a.slug}`} tabIndex={isOpen ? 0 : -1}>
                    Tips and directions <span aria-hidden="true">&#8594;</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className="deck-cta adv-cta">
          <Link className="btn btn-primary" href="/adventures">
            See all adventures <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
