"use client";

import Link from "next/link";

/** Shown if a page can't load its data (for example, the API is down). */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="page-hero" style={{ minHeight: "70vh" }}>
      <h1>Something went wrong.</h1>
      <p>We couldn&apos;t load this page just now. Please try again in a moment.</p>
      <div className="cta-row">
        <button className="btn btn-primary" onClick={reset} style={{ border: 0, cursor: "pointer" }}>
          Try again
        </button>
        <Link className="btn btn-ghost" href="/">Go home</Link>
      </div>
    </main>
  );
}
