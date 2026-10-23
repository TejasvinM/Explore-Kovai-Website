"use client";

import { useEffect } from "react";

/**
 * Scroll-triggered reveals for server-rendered content.
 * Adds `fx` to <html> (which switches the hidden "before" state on in CSS) and then
 * marks each matching element `in` as it scrolls into view. Without JavaScript, or with
 * reduced motion, `fx` is never added, so everything stays visible.
 */
export default function Reveal({
  selector,
  threshold = 0.2,
  parallax,
}: {
  selector: string;
  threshold?: number;
  /** optional: gently rotate these elements as they pass through the viewport (wide screens only) */
  parallax?: string;
}) {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (target && els.includes(target)) target.classList.add("in"); // arriving from a link to this item
    document.documentElement.classList.add("fx");
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => !el.classList.contains("in") && io.observe(el));

    let ticking = false;
    const imgs = parallax ? Array.from(document.querySelectorAll<HTMLElement>(parallax)) : [];
    const para = () => {
      ticking = false;
      if (window.innerWidth < 900) return imgs.forEach((im) => (im.style.transform = ""));
      const vh = window.innerHeight;
      imgs.forEach((im) => {
        const r = im.parentElement!.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        im.style.transform = `rotate(${(p * -18).toFixed(1)}deg)`;
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(para);
      }
    };
    if (imgs.length) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", para);
      para();
    }
    return () => {
      io.disconnect();
      document.documentElement.classList.remove("fx");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", para);
    };
  }, [selector, threshold, parallax]);
  return null;
}
