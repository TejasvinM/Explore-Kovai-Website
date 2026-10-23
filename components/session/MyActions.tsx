"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "./SessionProvider";

export function LogoutButton() {
  const { logout } = useSession();
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={async () => {
        await logout();
        router.push("/");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}

export function DeleteTripButton({ code, title }: { code: string; title: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "confirm" | "busy">("idle");
  if (state === "confirm") {
    return (
      <span className="trip-confirm">
        Delete “{title}”?{" "}
        <button
          type="button"
          className="link-btn danger"
          onClick={async () => {
            setState("busy");
            await fetch(`/api/trips/${code}`, { method: "DELETE" });
            router.refresh();
          }}
        >
          Yes, delete
        </button>{" "}
        <button type="button" className="link-btn" onClick={() => setState("idle")}>
          Keep it
        </button>
      </span>
    );
  }
  return (
    <button type="button" className="link-btn" disabled={state === "busy"} onClick={() => setState("confirm")} aria-label={`Delete ${title}`}>
      Delete
    </button>
  );
}
