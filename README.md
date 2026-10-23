# Namma Kovai — website (Next.js)

The front end of [Namma Kovai](https://namma-kovai.netlify.app), a guide to Coimbatore, Tamil Nadu.
It keeps the original site's design and gets its content from the
[Namma Kovai API](../namma-kovai-api) (Django REST Framework).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Playwright

## What's in it

| Page | What it does |
|---|---|
| `/` | Hero, six favourite places, featured destinations, food coverflow, adventure panels |
| `/places` | Aerial map with 21 pins, city zoom, category filters, detail panel and the full place guide |
| `/places/[slug]` | **New:** a page for every place, with facts, sources, directions and nearby places (from the API's `nearby` endpoint) |
| `/food` | Eight dish "stories" with spinning plates and where to find each dish |
| `/food/[slug]` | **New:** a page for every dish |
| `/adventures` | The adventure trail: difficulty filter and a gold path drawn as you scroll |
| `/adventures/[slug]` | **New:** a page for every adventure |
| `/search` | **New:** live search across places, food and adventures (the API's `/api/search/`) |
| `/plan` | **Phase 4:** trip planner: pick up to 12 places and 1–5 days, get a day-by-day route with a Google Maps link per day, save and share it |
| `/trips/[code]` | **Phase 4:** a shared trip (anyone with the link; not indexed by search engines) |
| `/login`, `/signup`, `/my` | **Phase 4:** accounts, and "My Kovai" with saved places, dishes, adventures and trips |
| Weather and maps | **Phase 5:** live weather and a 3-day forecast on every place page and in the map panel; interactive maps (Leaflet, OpenStreetMap data) of each place with nearby places, and of every trip plan with one coloured line per day |
| `/sitemap.xml`, `/robots.txt` | Generated from the API, so new places appear automatically |

**How data flows:** pages are rendered on the server from the API and saved as static HTML
(fast, and fully readable by Google). Every 5 minutes they refresh in the background, so an
edit in the Django admin reaches the site without a redeploy.

**Browsers never call the API directly.** Search, log-in, favourites and trips go to this
site's own `/api/...` routes, which forward them to Django from the server. So:

- the API token lives in an **httpOnly, SameSite cookie**, which page scripts can't read;
- requests that change something must come from this site (Origin check), against cross-site forgery;
- the API needs no CORS setup for the website;
- the server sends a shared secret (`SITE_SERVER_KEY`) and the visitor's IP, so the API's
  rate limits apply per visitor, including 10 log-in attempts a minute.

**SEO:** every page has its own title, description and canonical link. Place pages include
schema.org `TouristAttraction` data. The Google Search Console verification file is kept in
`public/`.

## Run it locally

You need **Node.js 20.9 or newer** (`node --version`), and the API running on port 8000.

```bash
# 1. In the API folder (another terminal):
python manage.py migrate          # first time after updating
python manage.py runserver

# 2. In this folder:
npm install
copy .env.example .env.local      # macOS/Linux: cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

For a production build: `npm run build`, then `npm run start`.

## Deploying

Netlify builds it (`netlify.toml`). Old addresses from the static site (`/places.html` and so on)
redirect permanently to the new pages (`next.config.ts`). Full guide: **[DEPLOY.md](DEPLOY.md)**.

## Tests

End-to-end tests run in a real browser at desktop, tablet and phone sizes. They check
that every page loads without errors, sideways scrolling or broken images, and they test
the map, filters, coverflow, search, the mobile menu, the SEO tags, and the whole account
journey: sign up, save favourites, plan, save and share a trip, delete it, log out and in.

```bash
npx playwright install chromium   # first time only
npx playwright test
```

## Project layout

```
app/                  pages (one folder per route), sitemap, robots, 404 and error pages
components/           shared pieces: Nav, Footer, Reveal (scroll animations), Sources ...
  home/ places/ food/ adventures/   page-specific components
lib/api.ts            typed API client
lib/content.ts        small bits of editorial content (home page picks, featured list)
public/images/        design images (hero, map, clouds); place photos come from the API
tests/                Playwright tests (site.spec.ts: pages and features; account.spec.ts: accounts and trips)
```

## Settings (`.env.local`)

| Variable | Used for |
|---|---|
| `API_URL` | Where this site's server reaches the API (browsers never do) |
| `NEXT_PUBLIC_SITE_URL` | The public address, for canonical links and the sitemap |
| `SITE_SERVER_KEY` | Shared secret with the API (same value in both `.env` files). Server-only |
| `GOOGLE_SITE_VERIFICATION` | Optional: a Search Console meta-tag code |
| `NEXT_PUBLIC_MAP_TILES`, `NEXT_PUBLIC_MAP_ATTRIBUTION` | Optional: another map tile provider and its credit line (default: OpenStreetMap's tiles, darkened with CSS) |

No third-party API keys are needed. Weather (Open-Meteo) and map tiles (OpenStreetMap) are free
services, credited on the page as their licences require. OpenStreetMap's tile servers are meant
for light use; if the site gets heavy traffic, switch to a tile provider with a plan.
