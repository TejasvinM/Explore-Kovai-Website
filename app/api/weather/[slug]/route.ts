import { NextResponse } from "next/server";
import { django } from "@/lib/server";

/** Weather for a place (the API caches Open-Meteo for 30 minutes; browsers may reuse it for 10). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const r = await django(`/api/places/${slug}/weather/`);
  return NextResponse.json(r.data ?? {}, {
    status: r.status,
    headers: r.ok ? { "Cache-Control": "public, max-age=600" } : {},
  });
}
