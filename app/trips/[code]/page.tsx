import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Trip } from "@/lib/api";
import { django } from "@/lib/server";
import TripPlanView from "@/components/trips/TripPlanView";
import Footer from "@/components/Footer";

type Props = { params: Promise<{ code: string }> };

async function getTrip(code: string) {
  if (!/^[\w-]{4,16}$/.test(code)) return null;
  const r = await django(`/api/trips/${code}/`);
  return r.ok ? (r.data as Trip) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trip = await getTrip((await params).code);
  return {
    title: trip ? trip.title : "Trip not found",
    // shared trips are for the people they're sent to, not for search engines
    robots: { index: false, follow: false },
  };
}

export default async function SharedTripPage({ params }: Props) {
  const trip = await getTrip((await params).code);
  if (!trip) notFound();
  const stops = trip.plan.days.flatMap((d) => d.stops.map((s) => s.place.slug));
  return (
    <main id="main">
      <section className="page-hero">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href="/plan">Plan a trip</Link> / <span aria-current="page">Shared trip</span>
        </nav>
        <h1>{trip.title}</h1>
        <p>
          A {trip.plan.days.length}-day plan by {trip.owner}, with {stops.length} place{stops.length === 1 ? "" : "s"}.
        </p>
      </section>
      <section className="planner plan-out">
        <TripPlanView plan={trip.plan} />
        <div className="save-box">
          <p>Want to change it?</p>
          <div className="share-row">
            <Link className="btn btn-primary" href={`/plan?places=${stops.join(",")}&days=${trip.plan.days.length}`}>
              Copy into the planner
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
