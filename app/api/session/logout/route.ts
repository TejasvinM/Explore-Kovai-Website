import { NextResponse } from "next/server";
import { clearToken, django, forbidden, getToken, sameOrigin } from "@/lib/server";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const token = await getToken();
  if (token) await django("/api/auth/logout/", { method: "POST", token });
  const res = new NextResponse(null, { status: 204 });
  clearToken(res);
  return res;
}
