import { django, forbidden, getToken, needLogin, reply, sameOrigin } from "@/lib/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ kind: string; slug: string }> }) {
  if (!sameOrigin(req)) return forbidden();
  const token = await getToken();
  if (!token) return needLogin();
  const { kind, slug } = await params;
  return reply(await django(`/api/me/favourites/${encodeURIComponent(kind)}/${encodeURIComponent(slug)}/`, { method: "DELETE", token }));
}
