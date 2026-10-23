import { NextResponse } from "next/server";
import { clearToken, django, getToken } from "@/lib/server";

/** Who is logged in (or { user: null }). */
export async function GET() {
  const token = await getToken();
  if (!token) return NextResponse.json({ user: null });
  const r = await django("/api/auth/me/", { token });
  if (r.status === 401) {
    const res = NextResponse.json({ user: null });
    clearToken(res); // the token was revoked (e.g. logged out elsewhere)
    return res;
  }
  return NextResponse.json({ user: r.ok ? r.data : null }, { status: r.ok ? 200 : 502 });
}
