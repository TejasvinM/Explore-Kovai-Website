/**
 * Typed client for the Namma Kovai Django API.
 *
 * Pages are built on the server from this data and refreshed every few minutes
 * (incremental static regeneration), so an edit in the Django admin shows up on
 * the site without a redeploy.
 */

export const API_URL = (process.env.API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
export const REVALIDATE_SECONDS = 300;

export type Source = { title: string; url: string };
export type Photo = {
  url: string;
  alt: string;
  representative: boolean;
  credit: string;
  credit_url: string;
};
export type Category = { slug: string; name: string };
export type Fact = { label: string; text: string };

export type Place = {
  slug: string;
  name: string;
  category: Category;
  tagline: string;
  location_label: string;
  latitude: string;
  longitude: string;
  distance_km: string | null;
  in_city: boolean;
  photo: Photo;
  directions_url: string;
};
export type PlaceDetail = Place & {
  subtitle: string;
  about: string;
  facts: Fact[];
  sources: Source[];
  updated_at: string;
};
export type NearbyPlace = Place & { km_from_you: number };

export type Diet = "veg" | "nonveg" | "both";
export type Dish = {
  slug: string;
  name: string;
  name_ta: string;
  tag: string;
  diet: Diet;
  diet_label: string;
  summary: string;
  photo: Photo;
};
export type Eatery = { name: string; area: string; source: Source | null };
export type DishDetail = Dish & {
  story: string;
  in_the_pot: string;
  how_its_eaten: string;
  where_to_find: Eatery[];
  our_tip: string;
  sources: Source[];
  updated_at: string;
};

export type Band = "easy" | "moderate" | "hard";
export type Adventure = {
  slug: string;
  name: string;
  level: number;
  level_label: string;
  band: Band;
  tagline: string;
  photo: Photo;
  directions_url: string;
};
export type AdventureDetail = Adventure & {
  what_to_expect: string;
  image_caption: string;
  facts: Fact[];
  tips: string[];
  sources: Source[];
  updated_at: string;
};

type Page<T> = { count: number; next: string | null; results: T[] };

export class ApiError extends Error {
  constructor(public status: number, url: string) {
    super(`API request failed (${status}): ${url}`);
  }
}

async function get<T>(path: string): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    // the shared key tells the API these page builds come from this site's server (not rate-limited)
    headers: { Accept: "application/json", ...(process.env.SITE_SERVER_KEY ? { "X-Site-Key": process.env.SITE_SERVER_KEY } : {}) },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new ApiError(res.status, url);
  return res.json() as Promise<T>;
}

/** Follows the API's pagination so callers always get the full list. */
async function all<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  let page = await get<Page<T>>(path);
  out.push(...page.results);
  while (page.next) {
    page = await get<Page<T>>(page.next.replace(/^https?:\/\/[^/]+/, ""));
    out.push(...page.results);
  }
  return out;
}

/** Returns null for a 404 so pages can show "not found". */
async function maybe<T>(path: string): Promise<T | null> {
  try {
    return await get<T>(path);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const api = {
  places: () => all<Place>("/api/places/"),
  placesDetailed: () => all<PlaceDetail>("/api/places/?expand=details"),
  place: (slug: string) => maybe<PlaceDetail>(`/api/places/${encodeURIComponent(slug)}/`),
  nearby: (lat: number | string, lon: number | string, radiusKm = 15) =>
    get<NearbyPlace[]>(`/api/places/nearby/?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`),
  categories: () => get<Category[]>("/api/categories/"),
  dishes: () => all<Dish>("/api/dishes/"),
  dishesDetailed: () => all<DishDetail>("/api/dishes/?expand=details"),
  dish: (slug: string) => maybe<DishDetail>(`/api/dishes/${encodeURIComponent(slug)}/`),
  adventures: () => all<Adventure>("/api/adventures/"),
  adventuresDetailed: () => all<AdventureDetail>("/api/adventures/?expand=details"),
  adventure: (slug: string) => maybe<AdventureDetail>(`/api/adventures/${encodeURIComponent(slug)}/`),
};

export type User = { email: string; name: string };

export type TripStop = { km_from_previous: number; place: Place };
export type TripDay = { number: number; km: number; directions_url: string; stops: TripStop[] };
export type Plan = { days: TripDay[]; total_km: number; note: string };
export type Trip = { share_code: string; title: string; days: number; created_at: string; owner: string; plan: Plan };
export type TripSummary = { share_code: string; title: string; days: number; created_at: string; places: string[] };
export type Favourites = { places: Place[]; dishes: Dish[]; adventures: Adventure[] };
export type FavKind = "place" | "dish" | "adventure";

export type WeatherNow = {
  code: number; label: string; icon: string; time: string;
  temp_c: number; feels_like_c: number; humidity: number; rain_mm: number; wind_kmh: number;
};
export type WeatherDay = { date: string; code: number; label: string; icon: string; max_c: number; min_c: number; rain_chance: number | null };
export type Weather = { current: WeatherNow; daily: WeatherDay[]; source: { name: string; url: string; licence: string } };
