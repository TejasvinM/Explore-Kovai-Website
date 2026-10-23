import Link from "next/link";
import { api } from "@/lib/api";
import { HOME_ADVENTURES, HOME_DISHES, HOME_PLACES } from "@/lib/content";
import { ArrowRight } from "@/components/icons";
import PlacesStrip from "@/components/home/PlacesStrip";
import Featured from "@/components/home/Featured";
import FoodCoverflow from "@/components/home/FoodCoverflow";
import AdventurePanels from "@/components/home/AdventurePanels";
import Footer from "@/components/Footer";

export const revalidate = 300;

export default async function HomePage() {
  const [places, dishes, adventures] = await Promise.all([
    api.places(),
    api.dishes(),
    api.adventuresDetailed(),
  ]);
  const bySlug = new Map(places.map((p) => [p.slug, p]));
  const favourites = HOME_PLACES.map((s) => bySlug.get(s)).filter((p) => p !== undefined);
  const panels = HOME_ADVENTURES.map((s) => adventures.find((a) => a.slug === s)).filter((a) => a !== undefined);

  return (
    <main id="main">
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-media">
          <img src="/images/hero-rs-puram.webp" alt="RS Puram, Coimbatore" fetchPriority="high" />
        </div>
        <div className="hero-caption rise" style={{ "--d": "1s" } as React.CSSProperties}>
          RS Puram, Coimbatore
        </div>
        <div className="hero-content">
          <div className="eyebrow rise" style={{ "--d": ".15s" } as React.CSSProperties}>
            <span>Coimbatore · Tamil Nadu</span>
            <span className="ta">வணக்கம் கோவை</span>
          </div>
          <h1 className="rise" id="hero-title" style={{ "--d": ".3s" } as React.CSSProperties}>
            At the foot of the <em>Western Ghats.</em>
          </h1>
          <p className="rise" style={{ "--d": ".45s" } as React.CSSProperties}>
            Where cool mountain breezes meet bustling city life, and tradition blends gently with modern charm — begin
            your journey here.
          </p>
          <div className="cta-row rise" style={{ "--d": ".6s" } as React.CSSProperties}>
            <a className="btn btn-primary" href="#places">
              Explore places <ArrowRight />
            </a>
            <a className="btn btn-ghost" href="#food">
              What to eat
            </a>
          </div>
        </div>
        <a className="scroll-cue rise" style={{ "--d": ".9s" } as React.CSSProperties} href="#places" aria-label="Scroll to places">
          Scroll<i />
        </a>
      </section>

      <PlacesStrip places={favourites} total={places.length} />
      <Featured />
      <FoodCoverflow dishes={dishes.slice(0, HOME_DISHES)} />
      <AdventurePanels adventures={panels} />
      <p className="more-soon" style={{ textAlign: "center" }}>
        Looking for something specific? <Link href="/search" style={{ color: "var(--gold-soft)" }}>Search places, food and adventures</Link>
      </p>
      <Footer credited={places} />
    </main>
  );
}
