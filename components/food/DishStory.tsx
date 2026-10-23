import type { DishDetail } from "@/lib/api";
import { PinIcon } from "@/components/icons";
import Sources from "@/components/Sources";
import FavouriteButton from "@/components/session/FavouriteButton";

const mapsSearch = (q: string) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

/** One dish as an editorial "story": a spinning plate beside the text, then where to find it. */
export default function DishStory({
  dish: d,
  index,
  total,
  headingLevel = "h2",
}: {
  dish: DishDetail;
  index: number;
  total: number;
  headingLevel?: "h1" | "h2";
}) {
  const H = headingLevel;
  const findSources = [...new Map(d.where_to_find.filter((e) => e.source).map((e) => [e.source!.url, e.source!])).values()];
  return (
    <article className="story" id={d.slug} aria-labelledby={`${d.slug}-t`}>
      <figure className="story-media">
        {d.photo.representative && <span className="plate-note">Representative image</span>}
        <span className="orbit" aria-hidden="true" />
        <span className="plate-shadow" aria-hidden="true" />
        <div className="plate-in">
          <div className="plate">
            <img src={d.photo.url} alt={d.photo.alt || d.name} loading="lazy" />
          </div>
        </div>
        <span className="steam" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </figure>
      <div className="story-text">
        <div className="story-num">
          <b>{String(index + 1).padStart(2, "0")}</b>
          <span>of {String(total).padStart(2, "0")}</span>
        </div>
        <H id={`${d.slug}-t`} aria-label={d.name}>
          {d.name.split(" ").map((w, i) => (
            <span key={i}>
              {i > 0 && " "}
              <span className="w" aria-hidden="true">
                <span style={{ "--i": i } as React.CSSProperties}>{w}</span>
              </span>
            </span>
          ))}
        </H>
        {d.name_ta && (
          <p className="story-ta" lang="ta">
            {d.name_ta}
          </p>
        )}
        <span className="story-rule" aria-hidden="true" />
        <p>{d.summary}</p>
        {(d.story || d.in_the_pot || d.how_its_eaten) && (
          <dl className="dish-more">
            {d.story && (
              <div>
                <dt>The story</dt>
                <dd>{d.story}</dd>
              </div>
            )}
            {d.in_the_pot && (
              <div>
                <dt>In the pot</dt>
                <dd>{d.in_the_pot}</dd>
              </div>
            )}
            {d.how_its_eaten && (
              <div>
                <dt>How it&apos;s eaten</dt>
                <dd>{d.how_its_eaten}</dd>
              </div>
            )}
          </dl>
        )}
        <Sources sources={d.sources} className="dish-src" label="About the dish" />
        <div className="story-meta">
          {d.tag && <span className="tag">{d.tag}</span>}
          <span className={`diet ${d.diet}`}>{d.diet_label}</span>
          <FavouriteButton kind="dish" slug={d.slug} name={d.name} />
        </div>
        {(d.where_to_find.length > 0 || d.our_tip) && (
          <div className="find">
            <h3>
              <PinIcon />
              Where to find it
            </h3>
            <ul>
              {d.where_to_find.map((e) => (
                <li key={e.name + e.area}>
                  <a href={mapsSearch(`${e.name} ${e.area} Coimbatore`)} target="_blank" rel="noopener">
                    <b>{e.name}</b>
                    {e.area && ` · ${e.area}`}
                    <span aria-hidden="true">&#8599;</span>
                  </a>
                </li>
              ))}
            </ul>
            {d.our_tip && (
              <p className="find-tip">
                <span>Our tip</span>
                {d.our_tip}
              </p>
            )}
            <Sources sources={findSources} className="find-src" label="Named in" />
          </div>
        )}
      </div>
    </article>
  );
}
