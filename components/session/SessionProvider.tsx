"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { FavKind, Favourites, User } from "@/lib/api";

type Ctx = {
  user: User | null;
  ready: boolean;
  isFavourite: (kind: FavKind, slug: string) => boolean;
  toggleFavourite: (kind: FavKind, slug: string) => Promise<void>;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
};

const key = (kind: FavKind, slug: string) => `${kind}:${slug}`;

/** Who is logged in, and which items they've saved. Loaded once per visit. */
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const loadFavourites = useCallback(async () => {
    const r = await fetch("/api/favourites");
    if (!r.ok) return setFavs(new Set());
    const f: Favourites = await r.json();
    setFavs(new Set([
      ...f.places.map((p) => key("place", p.slug)),
      ...f.dishes.map((d) => key("dish", d.slug)),
      ...f.adventures.map((a) => key("adventure", a.slug)),
    ]));
  }, []);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then(async ({ user }) => {
        setUserState(user);
        if (user) await loadFavourites();
      })
      .catch(() => setUserState(null))
      .finally(() => setReady(true));
  }, [loadFavourites]);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) loadFavourites();
    else setFavs(new Set());
  };

  const toggleFavourite = async (kind: FavKind, slug: string) => {
    const k = key(kind, slug);
    const on = !favs.has(k);
    // update straight away, undo if the server refuses
    setFavs((s) => {
      const n = new Set(s);
      if (on) n.add(k);
      else n.delete(k);
      return n;
    });
    const r = on
      ? await fetch("/api/favourites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, slug }),
        })
      : await fetch(`/api/favourites/${kind}/${slug}`, { method: "DELETE" });
    if (!r.ok) {
      setFavs((s) => {
        const n = new Set(s);
        if (on) n.delete(k);
        else n.add(k);
        return n;
      });
      if (r.status === 401) setUserState(null);
    }
  };

  const logout = async () => {
    await fetch("/api/session/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <SessionContext.Provider
      value={{ user, ready, isFavourite: (k, s) => favs.has(key(k, s)), toggleFavourite, setUser, logout }}
    >
      {children}
    </SessionContext.Provider>
  );
}
