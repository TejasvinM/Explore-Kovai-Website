import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import DishStory from "@/components/food/DishStory";
import Footer from "@/components/Footer";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await api.dishes()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await api.dish((await params).slug);
  if (!d) return { title: "Dish not found" };
  const where = d.where_to_find.map((e) => e.name).slice(0, 3).join(", ");
  const description = `${d.summary}${where ? ` Where to find it in Coimbatore: ${where}.` : ""}`.slice(0, 200);
  return {
    title: `${d.name} in Coimbatore`,
    description,
    alternates: { canonical: `/food/${d.slug}` },
    openGraph: { title: d.name, description, images: d.photo.url ? [d.photo.url] : [] },
  };
}

export default async function DishPage({ params }: Props) {
  const slug = (await params).slug;
  const [d, all] = await Promise.all([api.dish(slug), api.dishes()]);
  if (!d) notFound();
  const index = all.findIndex((x) => x.slug === d.slug);
  const others = all.filter((x) => x.slug !== d.slug);

  return (
    <main id="main" className="detail-page">
      <div className="detail detail-tight">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href="/food">Food</Link> / <span aria-current="page">{d.name}</span>
        </nav>
      </div>
      <DishStory dish={d} index={Math.max(0, index)} total={all.length} headingLevel="h1" />
      <section className="fp-index detail-index" aria-labelledby="more-t">
        <h2 id="more-t">More to taste</h2>
        <ol>
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/food/${o.slug}`}>
                <span>{String(all.indexOf(o) + 1).padStart(2, "0")}</span>
                {o.name}
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <Footer />
    </main>
  );
}
