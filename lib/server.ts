import "server-only";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "./api";

/**
 * Server-side helpers for the account features.
 *
 * The browser only ever talks to this Next.js server. The API token lives in an
 * httpOnly cookie (JavaScript in the page can't read it), and the server adds it to
 * the requests it forwards to Django.
 */

export const TOKEN_COOKIE = "nk_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export const siteHeaders = (): Record<string, string> =>
  process.env.SITE_SERVER_KEY ? { "X-Site-Key": process.env.SITE_SERVER_KEY } : {};

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

export function setToken(res: NextResponse, token: string) {
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export function clearToken(res: NextResponse) {
  res.cookies.set(TOKEN_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

/**
 * The visitor's IP as reported by the hosting platform's proxy (Vercel and Netlify overwrite
 * x-forwarded-for, so visitors can't fake it there).
 */
async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "").trim();
}

/** Calls the Django API from the server, with the visitor's token and IP. */
export async function django(path: string, init: { method?: string; body?: unknown; token?: string | null } = {}) {
  const ip = await clientIp();
  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(init.token ? { Authorization: `Token ${init.token}` } : {}),
      ...siteHeaders(),
      // always identify the visitor; if their IP is unknown they share one rate limit (never none)
      "X-Client-IP": ip || "unknown",
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { detail: "Unexpected response from the server." };
  }
  return { status: res.status, ok: res.ok, data };
}

/**
 * Blocks cross-site form posts: a request that changes something must come from a page on
 * this site (the Origin header must match). Works together with the SameSite cookie.
 */
export function sameOrigin(req: Request) {
  if (req.method === "GET" || req.method === "HEAD") return true;
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Standard JSON reply, passing Django's status and body straight through. */
export function reply(r: { status: number; data: unknown }) {
  if (r.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(r.data ?? {}, { status: r.status });
}

export const forbidden = () => NextResponse.json({ detail: "Request blocked." }, { status: 403 });
export const needLogin = () => NextResponse.json({ detail: "Please log in." }, { status: 401 });

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
