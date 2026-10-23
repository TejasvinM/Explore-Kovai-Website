"use client";

import { useEffect, useState } from "react";

/** Slow cross-fading background photos (paused when the visitor prefers less motion). */
export default function HeroSlides({ images, every = 6500 }: { images: string[]; every?: number }) {
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (images.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setOn((i) => (i + 1) % images.length), every);
    return () => clearInterval(t);
  }, [images.length, every]);
  return (
    <>
      {images.map((src, i) => (
        <div
          key={src}
          className={`ph-slide${i === on ? " on" : ""}`}
          style={{ "--img": `url("${src}")` } as React.CSSProperties}
        />
      ))}
    </>
  );
}
