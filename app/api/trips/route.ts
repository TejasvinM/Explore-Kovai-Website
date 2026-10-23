import { django, forbidden, getToken, needLogin, readJson, reply, sameOrigin } from "@/lib/server";

export async function GET() {
  const token = await getToken();
  if (!token) return needLogin();
  return reply(await django("/api/me/trips/", { token }));
}

/** Save a trip to your account. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const token = await getToken();
  if (!token) return needLogin();
  const { places, days, title } = await readJson(req);
  return reply(await django("/api/me/trips/", { method: "POST", token, body: { places, days, title } }));
}
