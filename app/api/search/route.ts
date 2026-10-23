import { django, reply } from "@/lib/server";

/** Live search, forwarded to the API so the browser only ever talks to this site. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return reply(await django(`/api/search/?q=${encodeURIComponent(q)}`));
}
