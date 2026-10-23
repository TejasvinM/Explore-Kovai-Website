import { django, forbidden, readJson, reply, sameOrigin } from "@/lib/server";

/** Plan a trip (no login needed). */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  const { places, days } = await readJson(req);
  return reply(await django("/api/trips/plan/", { method: "POST", body: { places, days } }));
}
