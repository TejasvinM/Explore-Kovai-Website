import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import SessionProvider from "@/components/session/SessionProvider";
import { SITE_NAME, SITE_URL } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Namma Kovai — Explore Coimbatore", template: "%s — Namma Kovai" },
  description: "Temples, waterfalls, hills and food of Coimbatore, Tamil Nadu — a local guide to exploring Kovai.",
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_IN" },
  // Keeps the existing Google Search Console verification working when this site replaces the old one.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0f0d" };

const FONTS =
  "https://fonts.googleapis.com/css2?family=Anton&family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;500;600&family=Noto+Serif+Tamil:wght@500;600&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href={FONTS} rel="stylesheet" />
      </head>
      <body>
        <SessionProvider>
          <Nav />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
