"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Adventure, Dish, Place } from "@/lib/api";
import { SearchIcon } from "@/components/icons";

type Results = { query: string; places: Place[]; dishes: Dish[]; adventures: Adventure[] };
type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; data: Results }
  | { kind: "error"; message: string };

const SUGGESTIONS = ["temple", "falls", "biryani", "mall", "trek", "Pollachi"];

/** Live search across places, dishes and adventures (forwarded to the API's /api/search/ by this site's server). */
export default function SearchBox() {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [state, setState] = useState<State>({ kind: "idle" });
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const term = q.trim();
    // keep the address bar in sync so a search can be shared or bookmarked
    router.replace(term ? `/search?q=${encodeURIComponent(term)}` : "/search", { scroll: false });
    if (term.length < 2) {
      setState({ kind: "idle" });
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setState({ kind: "loading" });
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (res.status === 429) throw new Error("Too many searches at once. Wait a moment and try again.");
        if (!res.ok) throw new Error("Search isn't available right now. Please try again later.");
        setState({ kind: "done", data: await res.json() });
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState({ kind: "error", message: (e as Error).message });
      }
    }, 250); // wait until typing pauses
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, router]);

  const total = state.kind === "done" ? state.data.places.length + state.data.dishes.length + state.data.adventures.length : 0;

  return (
    <>
      <form className="search-form" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="q" className="sr">
          Search places, food and adventures
        </label>
        <SearchIcon className="search-ico" />
        <input
          ref={input}
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “falls”, “biryani” or “Pollachi”"
          autoComplete="off"
          autoFocus
        />
      </form>

      {state.kind === "idle" && (
        <div className="search-hint">
          <p>Popular searches</p>
          <div className="chips">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="chip" onClick={() => (setQ(s), input.current?.focus())}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="search-status" aria-live="polite">
        {state.kind === "loading" && <p>Searching…</p>}
        {state.kind === "error" && <p className="search-error">{state.message}</p>}
        {state.kind === "done" && total === 0 && (
          <p>
            Nothing matches “{state.data.query}”. Try a shorter word, or browse <Link href="/places">places</Link>,{" "}
            <Link href="/food">food</Link> or <Link href="/adventures">adventures</Link>.
          </p>
        )}
        {state.kind === "done" && total > 0 && (
          <p>
            {total} result{total === 1 ? "" : "s"} for “{state.data.query}”
          </p>
        )}
      </div>

      {state.kind === "done" && total > 0 && (
        <div className="search-results">
          <Group title="Places" items={state.data.places.map((p) => ({ href: `/places/${p.slug}`, name: p.name, sub: `${p.category.name} · ${p.location_label}`, img: p.photo.url }))} />
          <Group title="Food" items={state.data.dishes.map((d) => ({ href: `/food/${d.slug}`, name: d.name, sub: `${d.tag} · ${d.diet_label}`, img: d.photo.url }))} />
          <Group title="Adventures" items={state.data.adventures.map((a) => ({ href: `/adventures/${a.slug}`, name: a.name, sub: a.level_label, img: a.photo.url }))} />
        </div>
      )}
    </>
  );
}

function Group({ title, items }: { title: string; items: { href: string; name: string; sub: string; img: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="sr-group" aria-label={title}>
      <h2>
        {title} <span>{items.length}</span>
      </h2>
      <ul>
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href}>
              <img src={it.img} alt="" loading="lazy" />
              <span>
                <b>{it.name}</b>
                <small>{it.sub}</small>
              </span>
              <i aria-hidden="true">&#8594;</i>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
