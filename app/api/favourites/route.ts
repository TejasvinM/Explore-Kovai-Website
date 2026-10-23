import { django, forbidden, getToken, needLogin, readJson, reply, sameOrigin } from "@/lib/server";

export async function GET() {
  const token = await getToken();
  if (!token) return needLogin();
  return reply(await django("/api/me/favourites/", { token }));
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const token = await getToken();
  if (!token) return needLogin();
  const { kind, slug } = await readJson(req);
  return reply(await django("/api/me/favourites/", { method: "POST", token, body: { kind, slug } }));
}
