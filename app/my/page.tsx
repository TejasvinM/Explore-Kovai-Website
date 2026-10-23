import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Favourites, TripSummary, User } from "@/lib/api";
import { django, getToken } from "@/lib/server";
import PlaceCard from "@/components/PlaceCard";
import FavouriteButton from "@/components/session/FavouriteButton";
import { DeleteTripButton, LogoutButton } from "@/components/session/MyActions";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "My Kovai", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MyPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/my");
  const [me, favs, trips] = await Promise.all([
    django("/api/auth/me/", { token }),
    django("/api/me/favourites/", { token }),
    django("/api/me/trips/", { token }),
  ]);
  if (me.status === 401) redirect("/login?next=/my");
  const user = me.data as User;
  const f = (favs.ok ? favs.data : { places: [], dishes: [], adventures: [] }) as Favourites;
  const t = (trips.ok ? trips.data : []) as TripSummary[];
  const savedCount = f.places.length + f.dishes.length + f.adventures.length;

  return (
    <main id="main">
      <section className="page-hero my-hero">
        <div>
          <div className="kicker plan-kicker">My Kovai</div>
          <h1>Vanakkam{user.name ? `, ${user.name}` : ""}.</h1>
          <p>{user.email}</p>
        </div>
        <LogoutButton />
      </section>

      <section className="my-section" aria-labelledby="trips-t">
        <div className="my-head">
          <h2 id="trips-t">
            Saved trips <span>{t.length}</span>
          </h2>
          <Link className="view-all" href="/plan">
            Plan a new trip
          </Link>
        </div>
        {t.length === 0 ? (
          <p className="empty">No trips yet. Plan one and save it to get a link you can share.</p>
        ) : (
          <ul className="trip-list">
            {t.map((trip) => (
              <li key={trip.share_code}>
                <Link href={`/trips/${trip.share_code}`} className="trip-link">
                  <b>{trip.title}</b>
                  <small>
                    {trip.days} day{trip.days > 1 ? "s" : ""} · {trip.places.slice(0, 4).join(", ")}
                    {trip.places.length > 4 ? ` and ${trip.places.length - 4} more` : ""}
                  </small>
                </Link>
                <DeleteTripButton code={trip.share_code} title={trip.title} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="my-section" aria-labelledby="favs-t">
        <div className="my-head">
          <h2 id="favs-t">
            Saved <span>{savedCount}</span>
          </h2>
        </div>
        {savedCount === 0 && (
          <p className="empty">
            Tap the ♥ on any place, dish or adventure to keep it here. Start with the <Link href="/places">places map</Link>.
          </p>
        )}
        {f.places.length > 0 && (
          <>
            <h3 className="my-sub">Places</h3>
            <div className="page-grid my-grid">
              {f.places.map((p) => (
                <div className="my-card" key={p.slug}>
                  <PlaceCard place={p} />
                  <FavouriteButton kind="place" slug={p.slug} name={p.name} variant="icon" />
                </div>
              ))}
            </div>
            <p className="my-plan-link">
              <Link href={`/plan?places=${f.places.slice(0, 12).map((p) => p.slug).join(",")}`}>Plan a trip with these places →</Link>
            </p>
          </>
        )}
        {f.dishes.length > 0 && (
          <>
            <h3 className="my-sub">Food</h3>
            <ul className="mini-list">
              {f.dishes.map((d) => (
                <li key={d.slug}>
                  <Link href={`/food/${d.slug}`}>
                    <img src={d.photo.url} alt="" loading="lazy" />
                    <span>
                      <b>{d.name}</b>
                      <small>{d.tag}</small>
                    </span>
                  </Link>
                  <FavouriteButton kind="dish" slug={d.slug} name={d.name} variant="icon" />
                </li>
              ))}
            </ul>
          </>
        )}
        {f.adventures.length > 0 && (
          <>
            <h3 className="my-sub">Adventures</h3>
            <ul className="mini-list">
              {f.adventures.map((a) => (
                <li key={a.slug}>
                  <Link href={`/adventures/${a.slug}`}>
                    <img src={a.photo.url} alt="" loading="lazy" />
                    <span>
                      <b>{a.name}</b>
                      <small>{a.level_label}</small>
                    </span>
                  </Link>
                  <FavouriteButton kind="adventure" slug={a.slug} name={a.name} variant="icon" />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
