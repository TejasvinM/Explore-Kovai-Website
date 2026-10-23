import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="page-hero" style={{ minHeight: "70vh" }}>
      <div className="kicker" style={{ color: "var(--gold)", fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase" }}>
        404
      </div>
      <h1>We couldn&apos;t find that page.</h1>
      <p>It may have moved, or the address may be mistyped.</p>
      <div className="cta-row">
        <Link className="btn btn-primary" href="/">Go home</Link>
        <Link className="btn btn-ghost" href="/search">Search the site</Link>
      </div>
    </main>
  );
}
