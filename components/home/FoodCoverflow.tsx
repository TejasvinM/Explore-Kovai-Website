"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Dish } from "@/lib/api";
import { ArrowRight, ChevronLeft, ChevronRight } from "@/components/icons";

const DIET_SHORT = { veg: "Veg", nonveg: "Non-veg", both: "Veg or non-veg" } as const;

/**
 * 3D coverflow of dishes. Without JavaScript it is a plain scrollable row;
 * once measured it switches to the coverflow (the `ready` class).
 * Turn it with the buttons, dots, arrow keys, swipe, mouse drag or the scroll wheel.
 */
export default function FoodCoverflow({ dishes }: { dishes: Dish[] }) {
  const cf = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(0);
  const curRef = useRef(0);
  const n = dishes.length;
  const go = (i: number) => {
    const next = ((i % n) + n) % n;
    curRef.current = next;
    setCur(next);
  };

  // layout: position every card around the current one
  useEffect(() => {
    const root = cf.current;
    if (!root || !root.classList.contains("ready")) return;
    layout(root, cur, n);
  }, [cur, n]);

  useEffect(() => {
    const root = cf.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".cf-card"));

    const size = () => {
      const w = Math.min(330, Math.round(window.innerWidth * 0.74));
      root.style.setProperty("--cf-w", w + "px");
      cards.forEach((c) => (c.style.height = "auto"));
      root.classList.add("ready");
      let h = 0;
      cards.forEach((c) => {
        h = Math.max(h, c.offsetHeight);
        c.style.height = "";
      });
      root.style.setProperty("--cf-h", h + "px");
      layout(root, curRef.current, n);
    };

    // scroll wheel: sideways turns either way; vertical steps through, then lets the page scroll on
    let acc = 0,
      lockUntil = 0;
    const onWheel = (e: WheelEvent) => {
      if (!root.classList.contains("ready")) return;
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const d = sideways ? e.deltaX : e.deltaY;
      const at = curRef.current;
      if (!sideways && !e.shiftKey && ((d > 0 && at >= n - 1) || (d < 0 && at <= 0))) return;
      e.preventDefault();
      const now = Date.now();
      if (now < lockUntil) return;
      acc += d;
      if (Math.abs(acc) >= 40) {
        const step = acc > 0 ? 1 : -1;
        acc = 0;
        lockUntil = now + 420;
        go(sideways || e.shiftKey ? at + step : Math.min(n - 1, Math.max(0, at + step)));
      }
    };

    // touch swipe
    let x0: number | null = null;
    const onTouchStart = (e: TouchEvent) => (x0 = e.touches[0].clientX);
    const onTouchEnd = (e: TouchEvent) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(curRef.current + (dx < 0 ? 1 : -1));
      x0 = null;
    };

    // mouse drag (a drag must not also count as a click on a card link)
    let px: number | null = null,
      dragged = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      px = e.clientX;
      dragged = false;
    };
    const onUp = (e: PointerEvent) => {
      if (px === null) return;
      const dx = e.clientX - px;
      px = null;
      if (Math.abs(dx) > 40) {
        dragged = true;
        go(curRef.current + (dx < 0 ? 1 : -1));
      }
    };
    const onClickCapture = (e: MouseEvent) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    };
    const noDrag = (e: DragEvent) => e.preventDefault();

    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(size, 120);
    };

    size();
    const imgs = Array.from(root.querySelectorAll("img")).filter((im) => !im.complete);
    imgs.forEach((im) => im.addEventListener("load", size, { once: true }));
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchend", onTouchEnd);
    root.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    root.addEventListener("click", onClickCapture, true);
    root.addEventListener("dragstart", noDrag);
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      imgs.forEach((im) => im.removeEventListener("load", size));
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("click", onClickCapture, true);
      root.removeEventListener("dragstart", noDrag);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  return (
    <section className="food-home" id="food" aria-labelledby="food-title">
      <div className="fh-inner">
        <div className="fh-head">
          <div className="kicker">Food of Kongu Nadu</div>
          <h2 id="food-title">What to bite?</h2>
          <p>{n} dishes Coimbatore is known for. Tap “More” on any dish to see where to find it.</p>
        </div>
        <div
          className="cf"
          ref={cf}
          role="region"
          aria-roledescription="carousel"
          aria-label="Famous Coimbatore dishes"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              go(cur + 1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              go(cur - 1);
            }
          }}
        >
          <div className="cf-stage">
            {dishes.map((d, i) => (
              <article
                className="cf-card"
                key={d.slug}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${d.name}`}
                onClick={(e) => {
                  if (i !== cur) {
                    e.preventDefault();
                    go(i);
                  }
                }}
              >
                <div className="cf-media">
                  <img src={d.photo.url} alt={d.photo.alt || d.name} loading="lazy" />
                  <span className="cf-badge">{d.tag}</span>
                </div>
                <div className="cf-body">
                  <h3>{d.name}</h3>
                  <p>{d.summary}</p>
                  <div className="cf-foot">
                    <span className={`diet ${d.diet}`}>{DIET_SHORT[d.diet]}</span>
                    <Link href={`/food#${d.slug}`} className="cf-more">
                      More <ArrowRight />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="cf-ctrls">
          <button type="button" className="cf-btn" aria-label="Previous dish" onClick={() => go(cur - 1)}>
            <ChevronLeft />
          </button>
          <div className="cf-dots">
            {dishes.map((d, i) => (
              <button
                key={d.slug}
                type="button"
                aria-label={`Show ${d.name}`}
                aria-current={i === cur}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <button type="button" className="cf-btn" aria-label="Next dish" onClick={() => go(cur + 1)}>
            <ChevronRight />
          </button>
        </div>
        <div className="fh-cta">
          <Link className="btn fh-explore" href="/food">
            Explore more dishes <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

function layout(root: HTMLElement, cur: number, n: number) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".cf-card"));
  const w = parseFloat(getComputedStyle(root).getPropertyValue("--cf-w")) || 330;
  const small = window.innerWidth < 640;
  cards.forEach((c, i) => {
    let d = i - cur;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    const a = Math.abs(d),
      max = small ? 1 : 2;
    const x = d * w * (small ? 0.78 : 0.62),
      s = 1 - 0.13 * Math.min(a, 3),
      ry = Math.max(-1, Math.min(1, d)) * -14;
    c.style.transform = `translateX(${x}px) scale(${s}) rotateY(${a ? ry : 0}deg)`;
    c.style.opacity = String(a === 0 ? 1 : a <= max ? (a === 1 ? 0.9 : 0.45) : 0);
    c.style.zIndex = String(10 - a);
    c.style.pointerEvents = a <= max ? "auto" : "none";
    c.classList.toggle("is-center", a === 0);
    c.setAttribute("aria-hidden", a === 0 ? "false" : "true");
    c.querySelectorAll("a").forEach((l) => (l.tabIndex = a === 0 ? 0 : -1));
  });
}
