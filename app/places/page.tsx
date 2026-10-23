import type { Metadata } from "next";
import { api } from "@/lib/api";
import BigTitle from "@/components/BigTitle";
import HeroSlides from "@/components/HeroSlides";
import PlacesExplorer from "@/components/places/PlacesExplorer";
import Footer from "@/components/Footer";
import { ArrowDown } from "@/components/icons";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const places = await api.places();
  return {
    title: "Places to visit",
    description: `An interactive map of ${places.length} places to visit across Coimbatore district: temples, hills, waterfalls, dams, malls and family days out.`,
    alternates: { canonical: "/places" },
  };
}

const HERO_SLUGS = ["isha-sivan-temple", "maruthamalai-temple", "vellaingiri-hills", "kovai-kutralam", "valparai", "monkey-falls"];

export default async function PlacesPage() {
  const [places, categories] = await Promise.all([api.placesDetailed(), api.categories()]);
  const slides = HERO_SLUGS.map((s) => places.find((p) => p.slug === s)?.photo.url).filter((u): u is string => !!u);

  return (
    <main id="main">
      <section className="pl-hero" aria-labelledby="ph-title">
        <HeroSlides images={slides} />
        <p className="ph-kicker">Presenting</p>
        <BigTitle text="Kovai uncovered" className="ph-title" id="ph-title" fit />
        <p className="ph-sub">
          Temples, hills, waterfalls, malls and family days out: {places.length} places across Coimbatore district, on
          one map.
        </p>
        <a className="ph-cta" href="#explore">
          Explore the map
          <i>
            <ArrowDown />
          </i>
        </a>
        <div className="ph-meta">
          <span>
            <b>{places.length}</b> places
          </span>
          <span>Coimbatore district · Tamil Nadu</span>
          <span>
            <b>{categories.length}</b> kinds of trip
          </span>
        </div>
      </section>
      <PlacesExplorer places={places} categories={categories} />
      <Footer credited={places} />
    </main>
  );
}
