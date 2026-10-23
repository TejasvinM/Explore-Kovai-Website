import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import AdventureStop from "@/components/adventures/AdventureStop";
import Meter from "@/components/Meter";
import Footer from "@/components/Footer";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await api.adventures()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await api.adventure((await params).slug);
  if (!a) return { title: "Adventure not found" };
  const description = `${a.tagline} Difficulty: ${a.level_label}. ${a.what_to_expect}`.slice(0, 200);
  return {
    title: `${a.name} near Coimbatore`,
    description,
    alternates: { canonical: `/adventures/${a.slug}` },
    openGraph: { title: a.name, description, images: a.photo.url ? [a.photo.url] : [] },
  };
}

export default async function AdventurePage({ params }: Props) {
  const slug = (await params).slug;
  const [a, all] = await Promise.all([api.adventure(slug), api.adventures()]);
  if (!a) notFound();
  const index = all.findIndex((x) => x.slug === a.slug);
  const others = all.filter((x) => x.slug !== a.slug);

  return (
    <main id="main" className="detail-page">
      <div className="detail detail-tight">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href="/adventures">Adventures</Link> / <span aria-current="page">{a.name}</span>
        </nav>
      </div>
      <div className="trail detail-trail">
        <AdventureStop a={a} index={Math.max(0, index)} headingLevel="h1" linkToPage={false} />
      </div>
      <section className="detail-more" aria-labelledby="more-t">
        <div className="section-head">
          <div>
            <div className="kicker">More on the trail</div>
            <h2 id="more-t">Other adventures</h2>
          </div>
        </div>
        <ul className="adv-list">
          {others.map((o) => (
            <li key={o.slug} data-band={o.band}>
              <Link href={`/adventures/${o.slug}`}>
                <span className="al-name">{o.name}</span>
                <span className="al-lvl">
                  <Meter level={o.level} />
                  {o.level_label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Footer credited={[a]} />
    </main>
  );
}
