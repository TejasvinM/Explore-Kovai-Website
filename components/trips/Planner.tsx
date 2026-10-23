"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Category, Place, Plan, Trip } from "@/lib/api";
import { useSession } from "@/components/session/SessionProvider";
import TripPlanView from "./TripPlanView";

const MAX = 12;
const DAYS = [1, 2, 3, 4, 5];

/** Pick places and a number of days; get a day-by-day plan; save and share it. */
export default function Planner({ places, categories }: { places: Place[]; categories: Category[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const { user, isFavourite } = useSession();
  const valid = new Set(places.map((p) => p.slug));
  const [picked, setPicked] = useState<string[]>(() =>
    (params.get("places") ?? "").split(",").filter((s) => valid.has(s)).slice(0, MAX),
  );
  const [days, setDays] = useState(Math.min(5, Math.max(1, Number(params.get("days")) || 1)));
  const [filter, setFilter] = useState("all");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState<Trip | null>(null);
  const [copied, setCopied] = useState(false);

  const shown = useMemo(
    () => places.filter((p) => filter === "all" || p.category.slug === filter),
    [places, filter],
  );
  const favSlugs = places.filter((p) => isFavourite("place", p.slug)).map((p) => p.slug);

  const reset = () => {
    setPlan(null);
    setSaved(null);
    setError("");
  };
  const toggle = (slug: string) => {
    reset();
    setPicked((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length >= MAX ? cur : [...cur, slug]));
  };

  const call = async (url: string, body: object) => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = data.detail || data.places || data.days || "Something went wrong. Please try again.";
        throw new Error(Array.isArray(msg) ? msg[0] : String(msg));
      }
      return data;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const makePlan = async () => {
    const data = await call("/api/trips/plan", { places: picked, days });
    if (data) {
      setPlan(data);
      setSaved(null);
      router.replace(`/plan?places=${picked.join(",")}&days=${days}`, { scroll: false });
      requestAnimationFrame(() => document.getElementById("your-plan")?.scrollIntoView({ behavior: "smooth" }));
    }
  };

  const save = async () => {
    const data = await call("/api/trips", { places: picked, days, title });
    if (data) setSaved(data);
  };

  const shareUrl = saved ? `${window.location.origin}/trips/${saved.share_code}` : "";

  return (
    <>
      <section className="planner" aria-labelledby="pick-t">
        <div className="planner-head">
          <div>
            <div className="kicker">Step 1</div>
            <h2 id="pick-t">Pick up to {MAX} places</h2>
          </div>
          <div className="planner-tools">
            {user && favSlugs.length > 0 && (
              <button type="button" className="chip" onClick={() => (reset(), setPicked(favSlugs.slice(0, MAX)))}>
                ♥ Use my saved places <span>{favSlugs.length}</span>
              </button>
            )}
            {picked.length > 0 && (
              <button type="button" className="chip" onClick={() => (reset(), setPicked([]))}>
                Clear all
              </button>
            )}
          </div>
        </div>
        <div className="chips" role="group" aria-label="Show places of one kind">
          <button type="button" className="chip" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            All <span>{places.length}</span>
          </button>
          {categories.map((c) => (
            <button key={c.slug} type="button" className="chip" aria-pressed={filter === c.slug} onClick={() => setFilter(c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
        <ul className="pick-grid">
          {shown.map((p) => {
            const on = picked.includes(p.slug);
            const full = !on && picked.length >= MAX;
            return (
              <li key={p.slug}>
                <button
                  type="button"
                  className={`pick${on ? " is-on" : ""}`}
                  aria-pressed={on}
                  disabled={full}
                  onClick={() => toggle(p.slug)}
                >
                  <img src={p.photo.url} alt="" loading="lazy" />
                  <span className="pick-text">
                    <b>{p.name}</b>
                    <small>
                      {p.category.name}
                      {p.distance_km && !p.in_city ? ` · ${Math.round(parseFloat(p.distance_km))} km` : " · in the city"}
                    </small>
                  </span>
                  <span className="pick-tick" aria-hidden="true">
                    {on ? picked.indexOf(p.slug) + 1 : "+"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="planner planner-go" aria-labelledby="days-t">
        <div className="kicker">Step 2</div>
        <h2 id="days-t">How many days?</h2>
        <div className="chips" role="radiogroup" aria-label="Number of days">
          {DAYS.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={days === n}
              className="chip"
              aria-pressed={days === n}
              onClick={() => (reset(), setDays(n))}
            >
              {n} day{n > 1 ? "s" : ""}
            </button>
          ))}
        </div>
        <div className="planner-cta">
          <button type="button" className="btn btn-primary" disabled={!picked.length || busy} onClick={makePlan}>
            {busy && !plan ? "Planning…" : `Plan my trip${picked.length ? ` (${picked.length} place${picked.length > 1 ? "s" : ""})` : ""}`}
          </button>
          {!picked.length && <p className="field-hint">Choose at least one place above.</p>}
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </section>

      {plan && (
        <section className="planner plan-out" id="your-plan" aria-labelledby="plan-t">
          <div className="kicker">Your plan</div>
          <h2 id="plan-t">
            {plan.days.length} day{plan.days.length > 1 ? "s" : ""} in Kovai
          </h2>
          {plan.days.length < days && (
            <p className="field-hint">You picked fewer places than days, so it fits in {plan.days.length}.</p>
          )}
          <TripPlanView plan={plan} />

          <div className="save-box">
            {saved ? (
              <>
                <p>
                  <b>Saved to My Kovai.</b> Anyone with this link can view the plan:
                </p>
                <div className="share-row">
                  <input readOnly value={shareUrl} aria-label="Share link" onFocus={(e) => e.currentTarget.select()} />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(shareUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <Link className="btn btn-ghost" href={`/trips/${saved.share_code}`}>
                    Open
                  </Link>
                </div>
              </>
            ) : user ? (
              <div className="share-row">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  placeholder={`Name this trip (e.g. “${plan.days.length}-day Kovai trip”)`}
                  aria-label="Trip name"
                />
                <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
                  {busy ? "Saving…" : "Save & get a share link"}
                </button>
              </div>
            ) : (
              <p>
                <Link href={`/login?next=${encodeURIComponent(`/plan?places=${picked.join(",")}&days=${days}`)}`}>Log in</Link> or{" "}
                <Link href={`/signup?next=${encodeURIComponent(`/plan?places=${picked.join(",")}&days=${days}`)}`}>create an account</Link>{" "}
                to save this trip and share it.
              </p>
            )}
          </div>
        </section>
      )}
    </>
  );
}
