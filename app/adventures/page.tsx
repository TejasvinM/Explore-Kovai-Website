import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import BigTitle from "@/components/BigTitle";
import Trail from "@/components/adventures/Trail";
import Reveal from "@/components/Reveal";
import Footer from "@/components/Footer";
import { ArrowDown } from "@/components/icons";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const list = await api.adventures();
  return {
    title: "Adventures in Kovai",
    description: `${list.length} adventures in and around Coimbatore, from a lake boat ride and the Nilgiri toy train to the Valparai ghat road and the Velliangiri trek, with where, when and safety notes.`,
    alternates: { canonical: "/adventures" },
  };
}

const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

export default async function AdventuresPage() {
  const adventures = await api.adventuresDetailed();
  const count = NUMBER_WORDS[adventures.length] ?? String(adventures.length);

  return (
    <main id="main">
      <section className="ad-hero" aria-labelledby="ad-title">
        <div className="bg" aria-hidden="true" />
        <svg className="ridge r1" viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 170L120 120 260 160 400 90 560 150 700 80 860 140 1020 70 1180 130 1340 90 1480 140 1600 110V300H0Z" fill="#1d3226" opacity=".8" />
        </svg>
        <svg className="ridge r2" viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 210L140 170 300 205 460 150 620 195 780 140 940 190 1100 150 1260 200 1420 160 1600 190V300H0Z" fill="#14231b" />
        </svg>
        <svg className="ridge r3" viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 250L180 225 360 250 560 215 760 248 960 222 1160 252 1360 226 1600 246V300H0Z" fill="#0b0f0d" />
        </svg>
        <div className="mist" aria-hidden="true" />
        <div className="copy">
          <p className="ad-kicker">Adventures in Kovai</p>
          <BigTitle text="Kovai thrill trail" className="ad-title" id="ad-title" />
          <p className="ad-sub">
            {count} ways to get out there, from an easy lake ride and the toy train to forty hairpin bends and a
            seven-hill climb.
          </p>
          <a className="ad-cta" href="#trail">
            Start the trail
            <i>
              <ArrowDown />
            </i>
          </a>
        </div>
      </section>

      <Trail adventures={adventures} />
      <Reveal selector=".stop" threshold={0.2} />

      <section className="tr-end" aria-labelledby="end-title">
        <h2 id="end-title">Know one we&apos;ve missed?</h2>
        <p>
          We only list what we can check. Timings and rules change with the season, so confirm with the operator or
          forest department before you go.
        </p>
        <p className="note">
          <b>Not listed yet:</b> rafting on the Bhavani river was on the old site, but we couldn&apos;t confirm an
          operator near Coimbatore. If you know one, we&apos;ll add it.
        </p>
        <Link className="btn btn-ghost" href="/">
          &#8592; Back to home
        </Link>
      </section>
      <Footer credited={adventures} />
    </main>
  );
}
