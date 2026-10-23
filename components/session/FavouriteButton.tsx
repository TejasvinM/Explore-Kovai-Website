"use client";

import { usePathname, useRouter } from "next/navigation";
import type { FavKind } from "@/lib/api";
import { useSession } from "./SessionProvider";

/** Heart button. Logged-out visitors are sent to log in, then brought back here. */
export default function FavouriteButton({
  kind,
  slug,
  name,
  variant = "pill",
}: {
  kind: FavKind;
  slug: string;
  name: string;
  variant?: "pill" | "icon";
}) {
  const { user, ready, isFavourite, toggleFavourite } = useSession();
  const router = useRouter();
  const path = usePathname();
  const on = isFavourite(kind, slug);

  const click = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(path)}`);
      return;
    }
    toggleFavourite(kind, slug);
  };

  return (
    <button
      type="button"
      className={`fav fav-${variant}${on ? " is-on" : ""}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from your favourites` : `Save ${name} to your favourites`}
      onClick={click}
      disabled={!ready}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.1 4.5c2 0 3.5 1.1 4.9 2.9 1.4-1.8 2.9-2.9 4.9-2.9 3.5 0 5.6 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
      </svg>
      {variant === "pill" && <span>{on ? "Saved" : "Save"}</span>}
    </button>
  );
}
