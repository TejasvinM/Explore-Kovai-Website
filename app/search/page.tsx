import type { Metadata } from "next";
import { Suspense } from "react";
import SearchBox from "@/components/SearchBox";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Search",
  description: "Search places to visit, dishes and adventures in and around Coimbatore.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <main id="main">
      <section className="page-hero search-page">
        <div className="kicker" style={{ color: "var(--gold)", fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase" }}>
          Search Kovai
        </div>
        <h1>Where to next?</h1>
        <p>Places, dishes and adventures, all in one search.</p>
        <Suspense>
          <SearchBox />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}
