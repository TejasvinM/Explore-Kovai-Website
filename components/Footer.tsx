import Link from "next/link";
import type { Photo } from "@/lib/api";

type Credited = { name: string; photo: Photo };

/** Site footer with the photo-credit list built from the API's photo data. */
export default function Footer({ credited = [] }: { credited?: Credited[] }) {
  const seen = new Set<string>();
  const credits = credited.filter((c) => {
    if (!c.photo.credit || seen.has(c.photo.credit_url)) return false;
    seen.add(c.photo.credit_url);
    return true;
  });
  return (
    <footer className="site-foot home-foot">
      <Link className="logo" href="/">
        Namma <span>கோவை</span>
      </Link>
      <nav aria-label="Footer">
        <Link href="/places">Places</Link>
        <Link href="/food">Food</Link>
        <Link href="/adventures">Adventures</Link>
        <Link href="/plan">Plan a trip</Link>
        <Link href="/search">Search</Link>
      </nav>
      <p>© {new Date().getFullYear()} Namma Kovai</p>
      <details className="credits">
        <summary>Photo credits</summary>
        {credits.length > 0 && (
          <ul>
            {credits.map((c) => (
              <li key={c.photo.credit_url}>
                {c.name}:{" "}
                <a href={c.photo.credit_url} target="_blank" rel="noopener">
                  {c.photo.credit}
                </a>
                , via Wikimedia Commons
              </li>
            ))}
          </ul>
        )}
        <p>
          Images marked &quot;Representative image&quot; show the kind of place, not necessarily the exact spot. Other
          photos are from their original publishers and will be replaced with licensed or own photos.
        </p>
      </details>
    </footer>
  );
}
