import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { PinIcon, RouteIcon } from "@/components/icons";
import PlaceCard from "@/components/PlaceCard";
import Sources from "@/components/Sources";
import Footer from "@/components/Footer";
import PlaceMap from "@/components/maps/PlaceMap";
import WeatherCard from "@/components/weather/WeatherCard";
import FavouriteButton from "@/components/session/FavouriteButton";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await api.places()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await api.place((await params).slug);
  if (!p) return { title: "Place not found" };
  const description = (p.about || p.tagline).slice(0, 160);
  return {
    title: `${p.name}, ${p.location_label}`,
    description,
    alternates: { canonical: `/places/${p.slug}` },
    openGraph: { title: p.name, description, images: p.photo.url ? [p.photo.url] : [] },
  };
}

export default async function PlacePage({ params }: Props) {
  const p = await api.place((await params).slug);
  if (!p) notFound();
  const around = (await api.nearby(p.latitude, p.longitude, 15)).filter((n) => n.slug !== p.slug);
  const nearby = around.slice(0, 4);
  const km = p.distance_km ? Math.round(parseFloat(p.distance_km)) : null;

  // structured data so search engines understand this is a tourist attraction
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: p.name,
    description: p.about || p.tagline,
    image: p.photo.url || undefined,
    geo: { "@type": "GeoCoordinates", latitude: Number(p.latitude), longitude: Number(p.longitude) },
    address: { "@type": "PostalAddress", addressLocality: p.location_label, addressRegion: "Tamil Nadu", addressCountry: "IN" },
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="detail">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href="/places">Places</Link> / <span aria-current="page">{p.name}</span>
        </nav>
        <div className="detail-grid">
          <figure className="detail-media">
            <img src={p.photo.url} alt={p.photo.alt || p.name} fetchPriority="high" />
            {p.photo.representative && <span className="rep-chip">Representative image</span>}
          </figure>
          <div className="detail-text">
            <span className="tag">{p.category.name}</span>
            {/* long single words (e.g. "Patteeswarar") get a smaller size so they never break mid-word */}
            <h1 className={Math.max(...p.name.split(" ").map((w) => w.length)) > 9 ? "long" : undefined}>{p.name}</h1>
            {p.subtitle && <p className="g-sub">{p.subtitle}</p>}
            <p className="detail-lead">{p.tagline}</p>
            <div className="pn-facts">
              <span>
                <PinIcon />
                {p.location_label}
              </span>
              <span>
                <RouteIcon />
                {p.in_city || km === null ? "In the city" : <>About {km} km from the city centre <small style={{ color: "var(--muted)" }}>(straight line)</small></>}
              </span>
            </div>
            <div className="pn-actions">
              <a className="btn btn-primary" href={p.directions_url} target="_blank" rel="noopener">
                Directions <span aria-hidden="true">&#8599;</span>
              </a>
              <Link className="btn btn-ghost" href={`/places#${p.slug}`}>
                Show on the map
              </Link>
              <FavouriteButton kind="place" slug={p.slug} name={p.name} />
            </div>
            <p className="detail-plan">
              <Link href={`/plan?places=${p.slug}`}>Plan a trip with {p.name} →</Link>
            </p>
          </div>
        </div>

        <div className="detail-body">
          {p.about && <p className="g-about">{p.about}</p>}
          {p.facts.length > 0 && (
            <dl className="g-facts">
              {p.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.text}</dd>
                </div>
              ))}
            </dl>
          )}
          <Sources sources={p.sources} credit={p.photo} />
          <p className="detail-note">Timings and access change, so check with the place before you go.</p>
        </div>

        <div className="detail-live">
          <section className="detail-map" aria-labelledby="where-t">
            <h2 id="where-t" className="wx-title">
              Where it is
            </h2>
            <PlaceMap place={p} nearby={around.slice(0, 8)} />
          </section>
          <WeatherCard slug={p.slug} name={p.name} />
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="detail-more" aria-labelledby="nearby-t">
          <div className="section-head">
            <div>
              <div className="kicker">Within 15 km</div>
              <h2 id="nearby-t">Nearby places</h2>
            </div>
          </div>
          <div className="page-grid">
            {nearby.map((n) => (
              <PlaceCard key={n.slug} place={n} note={`${n.km_from_you} km away (straight line)`} />
            ))}
          </div>
        </section>
      )}
      <Footer credited={[p, ...nearby]} />
    </main>
  );
}
