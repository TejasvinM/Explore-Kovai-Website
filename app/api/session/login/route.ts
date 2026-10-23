import { NextResponse } from "next/server";
import { django, forbidden, readJson, reply, sameOrigin, setToken } from "@/lib/server";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const { email, password } = await readJson(req);
  const r = await django("/api/auth/login/", { method: "POST", body: { email, password } });
  if (!r.ok) return reply(r);
  const { token, user } = r.data as { token: string; user: unknown };
  const res = NextResponse.json({ user }, { status: r.status });
  setToken(res, token); // kept in an httpOnly cookie; never sent to the page's JavaScript
  return res;
}
