import Link from "next/link";
import type { AdventureDetail } from "@/lib/api";
import { PinIcon } from "@/components/icons";
import Meter from "@/components/Meter";
import Sources from "@/components/Sources";
import FavouriteButton from "@/components/session/FavouriteButton";

/** One stop on the adventure trail. */
export default function AdventureStop({
  a,
  index,
  hidden = false,
  headingLevel = "h2",
  linkToPage = true,
}: {
  a: AdventureDetail;
  index: number;
  hidden?: boolean;
  headingLevel?: "h1" | "h2";
  linkToPage?: boolean;
}) {
  const H = headingLevel;
  const tag = a.photo.representative ? "Representative image" : a.image_caption;
  return (
    <article
      className={`stop${hidden ? " hide" : ""}`}
      id={a.slug}
      data-band={a.band}
      data-lvl={a.level}
      aria-labelledby={`${a.slug}-t`}
    >
      <span className="stop-mark" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <figure className="stop-media">
        <img src={a.photo.url} alt="" loading="lazy" />
        {tag && <span className="tr-tag">{tag}</span>}
      </figure>
      <div className="stop-text">
        <div className="stop-lvl">
          <Meter level={a.level} />
          <span>{a.level_label}</span>
          <small>our rating</small>
        </div>
        <H id={`${a.slug}-t`}>
          {linkToPage ? (
            <Link href={`/adventures/${a.slug}`} style={{ textDecoration: "none" }}>
              {a.name}
            </Link>
          ) : (
            a.name
          )}
        </H>
        <p className="stop-line">{a.tagline}</p>
        {a.what_to_expect && (
          <div className="stop-expect">
            <span>What to expect</span>
            <p>{a.what_to_expect}</p>
          </div>
        )}
        <dl className="stop-facts">
          {a.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.text}</dd>
            </div>
          ))}
        </dl>
        {a.tips.length > 0 && (
          <div className="stop-tips">
            <span>Our tips</span>
            <ul>
              {a.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="stop-actions">
          <a className="btn btn-primary" href={a.directions_url} target="_blank" rel="noopener">
            <PinIcon />
            Directions <span aria-hidden="true">&#8599;</span>
          </a>
          <FavouriteButton kind="adventure" slug={a.slug} name={a.name} />
        </div>
        <Sources sources={a.sources} credit={a.photo} className="stop-src" />
      </div>
    </article>
  );
}
