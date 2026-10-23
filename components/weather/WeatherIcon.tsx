/** Small line icons for the weather kinds the API returns. */
export default function WeatherIcon({ icon, className }: { icon: string; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const cloud = <path {...p} d="M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 11.2 3.5 3.5 0 0 0 7 18z" />;
  const shapes: Record<string, React.ReactNode> = {
    clear: (
      <>
        <circle {...p} cx="12" cy="12" r="4" />
        <path {...p} d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    "clear-night": <path {...p} d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
    partly: (
      <>
        <path {...p} d="M8 3v1.5M3.5 8H5M4.8 4.8l1 1M12.2 4.8l-1 1" />
        <path {...p} d="M5.5 10.5A3.5 3.5 0 0 1 11.6 7" />
        <path {...p} d="M9 19h8a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8.3 13.2 3 3 0 0 0 9 19z" />
      </>
    ),
    cloud,
    fog: <path {...p} d="M4 9h16M3 13h18M5 17h14" />,
    drizzle: (
      <>
        {cloud}
        <path {...p} d="M9 21l.5-1M13 21l.5-1M17 21l.5-1" transform="translate(-1 -1)" />
      </>
    ),
    rain: (
      <>
        <path {...p} d="M7 15h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 8.2 3.5 3.5 0 0 0 7 15z" />
        <path {...p} d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" />
      </>
    ),
    storm: (
      <>
        <path {...p} d="M7 15h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.2 8.2 3.5 3.5 0 0 0 7 15z" />
        <path {...p} d="M12.5 15L10 19h3.5L11 23" />
      </>
    ),
    snow: (
      <>
        {cloud}
        <path {...p} d="M8 21h.01M12 21h.01M16 21h.01" />
      </>
    ),
  };
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {shapes[icon] ?? cloud}
    </svg>
  );
}
