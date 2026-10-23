import Link from "next/link";
import type { Plan } from "@/lib/api";
import { DAY_COLOURS } from "@/lib/content";
import TripMap from "@/components/maps/TripMap";

/** A day-by-day plan: one column per day, stops in order with straight-line distances. */
export default function TripPlanView({ plan }: { plan: Plan }) {
  return (
    <div className="plan">
      <TripMap plan={plan} />
      <div className="plan-days">
        {plan.days.map((d, di) => (
          <section
            className="plan-day"
            key={d.number}
            aria-labelledby={`day-${d.number}`}
            style={{ "--day": DAY_COLOURS[di % DAY_COLOURS.length] } as React.CSSProperties}
          >
            <header>
              <h3 id={`day-${d.number}`}>
                <span>Day</span> {d.number}
              </h3>
              <p>
                {d.stops.length} stop{d.stops.length === 1 ? "" : "s"} · about {Math.round(d.km)} km
              </p>
            </header>
            <ol>
              <li className="plan-start">
                <i aria-hidden="true" />
                Start in Coimbatore city centre
              </li>
              {d.stops.map((s, i) => (
                <li key={s.place.slug}>
                  <span className="plan-leg">{s.km_from_previous} km</span>
                  <Link href={`/places/${s.place.slug}`} className="plan-stop">
                    <img src={s.place.photo.url} alt="" loading="lazy" />
                    <span>
                      <b>
                        {i + 1}. {s.place.name}
                      </b>
                      <small>
                        {s.place.category.name} · {s.place.location_label}
                      </small>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <a className="btn btn-ghost plan-dir" href={d.directions_url} target="_blank" rel="noopener">
              Day {d.number} in Google Maps <span aria-hidden="true">&#8599;</span>
            </a>
          </section>
        ))}
      </div>
      <p className="plan-note">
        About {Math.round(plan.total_km)} km in total. {plan.note}
      </p>
    </div>
  );
}
