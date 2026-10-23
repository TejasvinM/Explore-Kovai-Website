"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/components/session/SessionProvider";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/places", label: "Places" },
  { href: "/food", label: "Food" },
  { href: "/adventures", label: "Adventures" },
  { href: "/plan", label: "Plan a trip" },
  { href: "/search", label: "Search" },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const { user, ready } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const current = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
        <Link className="logo" href="/">
          Namma <span>கோவை</span>
        </Link>
        <button
          ref={toggle}
          className="nav-toggle"
          aria-controls="nav-links"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="bar" />
        </button>
        <nav aria-label="Primary">
          <ul className={`nav-links${open ? " open" : ""}`} id="nav-links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={current(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="nav-account">
              {ready && user ? (
                <Link href="/my" className="nav-me" aria-current={current("/my") ? "page" : undefined}>
                  My Kovai
                </Link>
              ) : (
                <Link href={`/login?next=${encodeURIComponent(path)}`} className="nav-login" aria-current={current("/login") ? "page" : undefined}>
                  Log in
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
