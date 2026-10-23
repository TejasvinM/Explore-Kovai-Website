import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/session/AuthForm";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function Page() {
  return (
    <main id="main" className="auth-page">
      <section className="auth-card">
        <div className="kicker">Namma Kovai account</div>
        <h1>Make Kovai yours.</h1>
        <p>Save places, dishes and adventures, and keep your trip plans in one place.</p>
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </section>
    </main>
  );
}
