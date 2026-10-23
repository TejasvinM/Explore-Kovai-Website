/** "Sources: a · b · Photo: credit" line used under places, dishes and adventures. */
export default function Sources({
  sources,
  credit,
  className = "g-src",
  label = "Sources",
}: {
  sources: { title: string; url: string }[];
  credit?: { credit: string; credit_url: string };
  className?: string;
  label?: string;
}) {
  if (!sources.length && !credit?.credit) return null;
  return (
    <p className={className}>
      {label}:{" "}
      {sources.map((s, k) => (
        <span key={s.url}>
          {k > 0 && " · "}
          <a href={s.url} target="_blank" rel="noopener">
            {s.title}
          </a>
        </span>
      ))}
      {credit?.credit && (
        <>
          {" · "}Photo:{" "}
          <a href={credit.credit_url} target="_blank" rel="noopener">
            {credit.credit}
          </a>
        </>
      )}
    </p>
  );
}
