/**
 * Small pieces of editorial content that live with the design rather than in the API.
 * Everything here was already on the original site.
 */

/** The six places shown on the home page strip, in order. */
export const HOME_PLACES = [
  "isha-sivan-temple",
  "maruthamalai-temple",
  "vellaingiri-hills",
  "kovai-kutralam",
  "nehru-stadium",
  "valparai",
];

/** Dishes on the home page coverflow. */
export const HOME_DISHES = 6;

/** Adventures shown as expanding panels on the home page. */
export const HOME_ADVENTURES = ["topslip", "karting", "valparai", "vellingiri"];

export type Featured = {
  tag: string;
  name: string;
  text: string;
  loc: string;
  img: string;
  alt: string;
  rep?: boolean;
  tint?: string;
  link?: string;
  linkText?: string;
};

export const FEATURED: Featured[] = [
  { tag: "Park & walk", name: "Race Course", text: "A green and clean oasis in the heart of Coimbatore city.",
    loc: "Coimbatore city", img: "/images/featured-race-course.jpg", alt: "Race Course area, Coimbatore" },
  { tag: "Neighbourhood", name: "RS Puram", text: "A popular attraction and a beautifully lit landmark.",
    loc: "R.S. Puram", img: "/images/featured-rs-puram.jpg", alt: "RS Puram lit up at night" },
  { tag: "Lake", name: "Valankulam Lake", text: "The gateway to a gentle adventure in the middle of the city.",
    loc: "Coimbatore city", img: "/images/featured-valankulam.jpg", alt: "Valankulam Lake, Coimbatore",
    link: "/adventures/valankulam-boating", linkText: "Boating on the lake" },
  { tag: "Shopping", name: "Brookefields Mall",
    text: "Shopping mall with over 100 stores, a six-screen cinema and a multi-cuisine food court.",
    loc: "Krishnasamy Road (Brookebond Road)", img: "/images/mall-brookefields.jpg", alt: "Brookefields Mall, Coimbatore",
    rep: true, tint: "#3a2f55", link: "/places/brookefields-mall", linkText: "About this place" },
  { tag: "Museum", name: "GeDee Car Museum", text: "A collection of vintage and classic cars.",
    loc: "734 Avinashi Road", img: "/images/place-gedee-museum.jpg", alt: "Vintage cars on display at GeDee Car Museum",
    rep: true, tint: "#5a2f2a", link: "/places/gedee-car-museum", linkText: "About this place" },
];

/** Map projection used by the aerial map (viewBox 550 x 1100). */
export const MAP = { lon0: 76.55, lat0: 11.38, w: 550, h: 1100, cityLon: 76.985, cityLat: 11.022, zoom: 4.6 };
export const toMap = (lat: number, lon: number) => ({
  x: ((lon - MAP.lon0) * 1000) / MAP.w * 100,
  y: ((MAP.lat0 - lat) * 1000) / MAP.h * 100,
});

export const CATEGORY_LABEL_SHORT: Record<string, string> = {
  temple: "Temple",
  hills: "Hills",
  water: "Waterfall",
  city: "City",
  shop: "Shopping",
};

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Namma Kovai";

/** One colour per trip day (map lines and day headings). */
export const DAY_COLOURS = ["#d4af37", "#8fd19e", "#8fc6d6", "#f0a08a", "#c9a7f0"];
