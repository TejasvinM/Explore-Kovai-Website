import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/session/AuthForm";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function Page() {
  return (
    <main id="main" className="auth-page">
      <section className="auth-card">
        <div className="kicker">Namma Kovai account</div>
        <h1>Welcome back.</h1>
        <p>Log in to see your saved places and trips.</p>
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </section>
    </main>
  );
}
