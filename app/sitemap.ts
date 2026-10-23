import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/content";

export const revalidate = 3600;

/** Every page on the site, including one page per place, dish and adventure. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [places, dishes, adventures] = await Promise.all([api.places(), api.dishes(), api.adventures()]);
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority,
  });
  return [
    page("/", 1),
    page("/places", 0.9),
    page("/food", 0.8),
    page("/adventures", 0.8),
    ...places.map((p) => page(`/places/${p.slug}`, 0.7)),
    ...dishes.map((d) => page(`/food/${d.slug}`, 0.6)),
    ...adventures.map((a) => page(`/adventures/${a.slug}`, 0.6)),
  ];
}
