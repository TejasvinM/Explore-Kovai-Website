import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import Planner from "@/components/trips/Planner";
import Footer from "@/components/Footer";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Plan a trip",
  description: "Pick places around Coimbatore and get a day-by-day plan with directions for each day.",
  alternates: { canonical: "/plan" },
};

export default async function PlanPage() {
  const [places, categories] = await Promise.all([api.places(), api.categories()]);
  return (
    <main id="main">
      <section className="page-hero">
        <div className="kicker plan-kicker">Trip planner</div>
        <h1>Plan your Kovai days.</h1>
        <p>
          Pick the places you want to see and how many days you have. We&apos;ll group nearby places together and put
          them in a sensible order, with a Google Maps route for each day.
        </p>
      </section>
      <Suspense>
        <Planner places={places} categories={categories} />
      </Suspense>
      <Footer credited={places} />
    </main>
  );
}
