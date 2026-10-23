import { django, forbidden, getToken, needLogin, reply, sameOrigin } from "@/lib/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ code: string }> }) {
  if (!sameOrigin(req)) return forbidden();
  const token = await getToken();
  if (!token) return needLogin();
  const { code } = await params;
  return reply(await django(`/api/me/trips/${encodeURIComponent(code)}/`, { method: "DELETE", token }));
}
