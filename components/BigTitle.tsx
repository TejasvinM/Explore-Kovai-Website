"use client";

import { useEffect, useRef } from "react";

/**
 * Giant condensed headline whose letters rise in one by one.
 * `fit` shrinks it to stay on one line on wide screens, whatever font loads.
 */
export default function BigTitle({
  text,
  className,
  id,
  fit = false,
}: {
  text: string;
  className: string;
  id?: string;
  fit?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ht = ref.current;
    if (!fit || !ht) return;
    const doFit = () => {
      ht.style.fontSize = "";
      const max = document.documentElement.clientWidth * 0.94;
      const words = Array.from(ht.querySelectorAll<HTMLElement>(".wd")).map((x) => x.scrollWidth);
      const w = Math.max(...words, ...(window.innerWidth > 640 ? [ht.scrollWidth] : []));
      if (w > max) ht.style.fontSize = (parseFloat(getComputedStyle(ht).fontSize) * max) / w + "px";
    };
    doFit();
    document.fonts?.ready.then(doFit);
    window.addEventListener("resize", doFit);
    return () => window.removeEventListener("resize", doFit);
  }, [fit]);

  let i = 0;
  const words = text.toUpperCase().split(" ");
  return (
    <h1 className={className} id={id} ref={ref} aria-label={text}>
      {words.map((word, w) => {
        const start = i;
        i += word.length + 1;
        return (
          <span key={w}>
            {w > 0 && " "}
            <span className="wd" aria-hidden="true">
              {[...word].map((ch, k) => (
                <span key={k} style={{ "--i": start + k } as React.CSSProperties}>
                  {ch}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </h1>
  );
}
