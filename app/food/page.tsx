import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import DishStory from "@/components/food/DishStory";
import Reveal from "@/components/Reveal";
import Footer from "@/components/Footer";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const dishes = await api.dishes();
  return {
    title: "Food of Kovai",
    description: `${dishes.length} dishes to look out for in Coimbatore and Kongu Nadu, from Kongunadu biryani to elaneer payasam, and where to find them.`,
    alternates: { canonical: "/food" },
  };
}

const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

export default async function FoodPage() {
  const dishes = await api.dishesDetailed();
  const hero = dishes[0];
  const count = NUMBER_WORDS[dishes.length] ?? String(dishes.length);

  return (
    <main id="main">
      <div className="fp-band">
        <section className="fp-hero" aria-labelledby="fp-title">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link> / <span aria-current="page">Food</span>
            </nav>
            <h1 className="fp-title" id="fp-title">
              <span className="ln">
                <span style={{ "--d": ".1s" } as React.CSSProperties}>Taste of</span>
              </span>
              <span className="ln">
                <span style={{ "--d": ".22s" } as React.CSSProperties}>
                  <em>Kongu</em> Nadu
                </span>
              </span>
            </h1>
            <div className="fp-intro">
              <p>
                {count} dishes Kovai is known for, and where people go to eat them.
                <small>Places are named in published food guides. Branches and timings change, so check before you go.</small>
              </p>
            </div>
          </div>
          {hero && (
            <figure className="fp-hero-img">
              <div className="hero-plate">
                <img src={hero.photo.url} alt={hero.photo.alt || hero.name} fetchPriority="high" />
              </div>
              <span className="orbit" aria-hidden="true" />
              <figcaption>{hero.name}</figcaption>
            </figure>
          )}
        </section>
      </div>

      <section className="fp-index" aria-labelledby="fp-index-t">
        <h2 id="fp-index-t">On the plate</h2>
        <ol>
          {dishes.map((d, i) => (
            <li key={d.slug}>
              <a href={`#${d.slug}`}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {d.name}
              </a>
            </li>
          ))}
        </ol>
      </section>

      {dishes.map((d, i) => (
        <DishStory key={d.slug} dish={d} index={i} total={dishes.length} />
      ))}
      <Reveal selector=".story" threshold={0.22} parallax=".plate img" />

      <div className="fp-end">
        <p>More dishes are being added.</p>
        <Link className="btn btn-ghost" href="/#food">
          &#8592; Back to home
        </Link>
      </div>
      <Footer />
    </main>
  );
}
