"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSession } from "./SessionProvider";

/** Only allow going back to a page on this site (never an outside address). */
export function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login") || next.startsWith("/signup")) {
    return "/my";
  }
  return next;
}

type Errors = Record<string, string[] | string>;

function firstError(e: Errors, field: string) {
  const v = e[field];
  return Array.isArray(v) ? v[0] : v;
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { setUser } = useSession();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const signup = mode === "signup";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const form = new FormData(e.currentTarget);
    try {
      const r = await fetch(`/api/session/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrors(
          r.status === 429
            ? { detail: "Too many attempts. Please wait a minute and try again." }
            : data && typeof data === "object"
              ? data
              : { detail: "Something went wrong. Please try again." },
        );
        return;
      }
      setUser(data.user);
      router.replace(next);
      router.refresh();
    } catch {
      setErrors({ detail: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  };

  const general = firstError(errors, "detail") || firstError(errors, "non_field_errors");

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {general && (
        <p className="form-error" role="alert">
          {general}
        </p>
      )}
      {signup && (
        <label>
          <span>Your name <small>(optional, shown on trips you share)</small></span>
          <input name="name" autoComplete="given-name" maxLength={60} />
        </label>
      )}
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} />
        {errors.email && <small className="field-error">{firstError(errors, "email")}</small>}
      </label>
      <label>
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete={signup ? "new-password" : "current-password"}
          required
          minLength={signup ? 8 : undefined}
          aria-invalid={!!errors.password}
        />
        {signup && !errors.password && <small className="field-hint">At least 8 characters, not a common password.</small>}
        {errors.password && <small className="field-error">{firstError(errors, "password")}</small>}
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Please wait…" : signup ? "Create account" : "Log in"}
      </button>
      <p className="auth-switch">
        {signup ? (
          <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link></>
        ) : (
          <>New here? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></>
        )}
      </p>
    </form>
  );
}
