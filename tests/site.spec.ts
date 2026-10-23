import { expect, test, type Page } from "@playwright/test";

const PAGES = [
  "/",
  "/places",
  "/food",
  "/adventures",
  "/search",
  "/places/valparai",
  "/food/kongunadu-biryani",
  "/adventures/vellingiri",
];

/** Errors we can't control (e.g. Google Fonts blocked on a test machine) are ignored. */
function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED/.test(m.text() + (m.location().url || ""))) {
      errors.push(m.text());
    }
  });
  return errors;
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
}

test.describe("every page", () => {
  for (const path of PAGES) {
    test(`${path} loads cleanly`, async ({ page }) => {
      const errors = collectErrors(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
      await scrollThrough(page);
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        // map tiles come from an outside tile server, so they aren't counted here
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && !i.classList.contains("leaflet-tile")).map((i) => i.src),
        missingAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
      }));
      expect(layout.overflow, "no sideways scrolling").toBe(false);
      expect(layout.broken, "no broken images").toEqual([]);
      expect(layout.missingAlt, "every image has alt text").toBe(0);
      expect(errors).toEqual([]);
    });
  }

  test("unknown pages return 404", async ({ page }) => {
    expect((await page.goto("/places/not-a-place"))?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /couldn't find that page/i })).toBeVisible();
  });
});

test.describe("home", () => {
  test("shows six favourite places and links them to the map", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("#places article.carousel-card");
    await expect(cards).toHaveCount(6);
    await expect(page.locator(".more-tile")).toContainText("+15");
    await expect(cards.first().locator(".card-link")).toHaveAttribute("href", "/places#isha-sivan-temple");
  });

  test("food coverflow turns with the buttons", async ({ page }) => {
    await page.goto("/");
    const centre = page.locator(".cf-card.is-center h3");
    await expect(centre).toHaveText("Kongunadu Biryani");
    await page.getByRole("button", { name: "Next dish" }).click();
    await expect(centre).toHaveText("Arisi Paruppu Sadam");
    await page.getByRole("button", { name: "Show Elaneer Payasam" }).click();
    await expect(centre).toHaveText("Elaneer Payasam");
  });

  test("adventure panels open on click", async ({ page }) => {
    await page.goto("/");
    const tab = page.locator("#adv-vellingiri .adv-tab");
    await tab.click();
    await expect(page.locator("#adv-vellingiri")).toHaveClass(/is-open/);
    await expect(tab).toHaveAttribute("aria-expanded", "true");
  });
});

test.describe("places map", () => {
  test("has a pin for every place and filters by category", async ({ page }) => {
    await page.goto("/places");
    await expect(page.locator(".pin")).toHaveCount(21);
    await page.locator(".chip", { hasText: "Malls & shopping" }).click();
    await expect(page.locator("#map")).toHaveClass(/zoomed/);
    await expect(page.locator(".pin.dim")).toHaveCount(16);
    await expect(page.locator('.g-group[data-cat="temple"]')).toBeHidden();
    await expect(page.locator('.g-group[data-cat="shop"]')).toBeVisible();
  });

  test("a link like /places#valparai opens that place", async ({ page }) => {
    await page.goto("/places#valparai");
    await expect(page.locator(".panel h3")).toHaveText("Valparai");
    await expect(page.locator('.pin[aria-pressed="true"] .pin-label')).toHaveText("Valparai");
  });

  test("city places zoom the map in", async ({ page }) => {
    await page.goto("/places#prozone-mall");
    await expect(page.locator(".panel h3")).toHaveText("Prozone Mall");
    await expect(page.locator("#map")).toHaveClass(/zoomed/);
  });
});

test.describe("food and adventures", () => {
  test("food page tells every dish's story with where to find it", async ({ page }) => {
    await page.goto("/food");
    await expect(page.locator("article.story")).toHaveCount(8);
    await expect(page.locator("#kongunadu-biryani .find li")).toHaveCount(3);
  });

  test("adventure difficulty filter", async ({ page }) => {
    await page.goto("/adventures");
    await page.getByRole("button", { name: /Challenging/ }).click();
    await expect(page.locator(".stop:not(.hide)")).toHaveCount(2);
    await expect(page.locator(".trail-svg .walk")).toHaveAttribute("d", /^M/);
  });
});

test.describe("detail pages and SEO", () => {
  test("place page has structured data, canonical link and nearby places", async ({ page }) => {
    await page.goto("/places/perur-patteeswarar-temple");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/places\/perur-patteeswarar-temple$/);
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) || "{}");
    expect(ld["@type"]).toBe("TouristAttraction");
    await expect(page.getByRole("heading", { name: "Nearby places" })).toBeVisible();
  });

  test("old addresses from the static site redirect to the new pages", async ({ request }) => {
    for (const [from, to] of [["/places.html", "/places"], ["/food.html", "/food"], ["/adventures.html", "/adventures"], ["/index.html", "/"]]) {
      const r = await request.get(from, { maxRedirects: 0 });
      expect(r.status(), from).toBe(308);
      expect(r.headers()["location"]).toBe(to);
    }
  });

  test("sitemap lists every page", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml.match(/<loc>/g)?.length).toBe(4 + 21 + 8 + 8);
  });
});

test.describe("weather and maps", () => {
  test("place page shows live weather (or says it's unavailable) and a map with nearby places", async ({ page }) => {
    await page.goto("/places/perur-patteeswarar-temple");
    await expect(page.locator(".wx-now, .wx-off").first()).toBeVisible({ timeout: 15000 });
    if (await page.locator(".wx-now").count()) {
      await expect(page.locator(".wx-temp")).toContainText(/\d+/);
      await expect(page.locator(".wx-days li")).toHaveCount(3);
      await expect(page.getByRole("link", { name: "Open-Meteo.com" })).toBeVisible();
    }
    const map = page.getByRole("region", { name: /Map of Perur Patteeswarar Temple/ });
    await expect(map.locator(".leaflet-marker-icon").first()).toBeVisible();
    expect(await map.locator(".leaflet-marker-icon").count()).toBeGreaterThan(1);
    await expect(page.locator(".leaflet-control-attribution")).toContainText("OpenStreetMap");
  });

  test("trip plans are drawn on a map, one line per day", async ({ page }) => {
    await page.goto("/plan?places=valparai,monkey-falls,brookefields-mall,isha-sivan-temple&days=2");
    await page.getByRole("button", { name: /Plan my trip/ }).click();
    const map = page.getByRole("region", { name: "Map of the trip" });
    await expect(map.locator(".leaflet-marker-icon")).toHaveCount(5); // 4 stops + city centre
    await expect(map.locator("path.leaflet-interactive")).toHaveCount(2);
  });
});

test.describe("search", () => {
  test("finds dishes, places and adventures as you type", async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("searchbox").fill("biryani");
    const link = page.getByRole("link", { name: /Kongunadu Biryani/ });
    await expect(link).toBeVisible();
    await expect(page).toHaveURL(/q=biryani/);
    await link.click();
    await expect(page).toHaveURL(/\/food\/kongunadu-biryani$/);
  });

  test("says so when nothing matches", async ({ page }) => {
    await page.goto("/search?q=zzzz");
    await expect(page.getByText(/Nothing matches/)).toBeVisible();
  });
});

test.describe("mobile menu", () => {
  test("opens and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phones only");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    await expect(page.locator("#nav-links")).toHaveClass(/open/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#nav-links")).not.toHaveClass(/open/);
  });
});
