import { expect, test } from "@playwright/test";

const PASSWORD = "kovai-hills-2026";
const email = (project: string) => `e2e-${project}-${Date.now()}@example.com`;

test.describe.configure({ mode: "serial" });

test("sign up, save favourites, plan and share a trip, log out", async ({ page, browser }, info) => {
  const me = email(info.project.name);

  // a logged-out heart sends you to log in, then back
  await page.goto("/places/valparai");
  await page.getByRole("button", { name: "Save Valparai to your favourites" }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fplaces%2Fvalparai/);

  // sign up
  await page.getByRole("link", { name: "Create an account" }).click();
  await page.getByLabel(/Your name/).fill("Meena");
  await page.getByLabel("Email").fill(me);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/places\/valparai$/);

  // the login token is in an httpOnly cookie, out of reach of page scripts
  const cookie = (await page.context().cookies()).find((c) => c.name === "nk_session");
  expect(cookie?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain("nk_session");

  // save a place and a dish
  const heart = page.getByRole("button", { name: "Save Valparai to your favourites" });
  await heart.click();
  await expect(page.getByRole("button", { name: "Remove Valparai from your favourites" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/food/paniyaram");
  await page.getByRole("button", { name: "Save Paniyaram to your favourites" }).click();
  await expect(page.getByRole("button", { name: "Remove Paniyaram from your favourites" })).toBeVisible();

  // My Kovai lists them
  await page.goto("/my");
  await expect(page.getByRole("heading", { name: "Vanakkam, Meena." })).toBeVisible();
  await expect(page.locator(".my-card h3")).toHaveText(["Valparai"]);
  await expect(page.locator(".mini-list b")).toHaveText(["Paniyaram"]);

  // plan a 2-day trip from saved places plus two more
  await page.goto("/plan");
  await page.getByRole("button", { name: /Use my saved places/ }).click();
  await page.getByRole("button", { name: /Monkey Falls/ }).click();
  await page.getByRole("button", { name: /Brookefields Mall/ }).click();
  await page.getByRole("radio", { name: "2 days" }).click();
  await page.getByRole("button", { name: /Plan my trip \(3 places\)/ }).click();
  await expect(page.locator(".plan-day")).toHaveCount(2);
  await expect(page.locator(".plan-day").first()).toContainText("Brookefields Mall");
  await expect(page.getByRole("link", { name: "Day 1 in Google Maps" })).toHaveAttribute("href", /google\.com\/maps\/dir/);

  // save it and open the share link while logged out
  await page.getByLabel("Trip name").fill("E2E hills weekend");
  await page.getByRole("button", { name: /Save & get a share link/ }).click();
  const link = await page.getByLabel("Share link").inputValue();
  expect(link).toMatch(/\/trips\/[\w-]+$/);
  const stranger = await browser.newPage();
  await stranger.goto(link);
  await expect(stranger.getByRole("heading", { name: "E2E hills weekend" })).toBeVisible();
  await expect(stranger.getByText("by Meena")).toBeVisible();
  await expect(stranger.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await stranger.close();

  // the trip is on My Kovai; delete it
  await page.goto("/my");
  await expect(page.getByRole("link", { name: /E2E hills weekend/ })).toBeVisible();
  await page.getByRole("button", { name: "Delete E2E hills weekend" }).click();
  await page.getByRole("button", { name: "Yes, delete" }).click();
  await expect(page.getByText("No trips yet.")).toBeVisible();

  // log out, then log back in
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/my");
  await expect(page).toHaveURL(/\/login\?next=(%2F|\/)my/);
  await page.getByLabel("Email").fill(me);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.locator(".form-error")).toHaveText("Email or password is incorrect.");
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/my$/);
  await expect(page.locator(".my-card h3")).toHaveText(["Valparai"]);
});

test("planning works without an account", async ({ page }) => {
  await page.goto("/plan?places=isha-sivan-temple,vellaingiri-hills");
  await expect(page.locator(".pick.is-on")).toHaveCount(2);
  await page.getByRole("button", { name: /Plan my trip/ }).click();
  await expect(page.locator(".plan-day")).toHaveCount(1);
  await expect(page.getByText(/to save this trip and share it/)).toBeVisible();
});

test("account requests from other sites are blocked", async ({ request }) => {
  const r = await request.post("/api/session/login", {
    headers: { Origin: "https://evil.example" },
    data: { email: "x@example.com", password: "x" },
  });
  expect(r.status()).toBe(403);
});

test("sign-up shows helpful errors", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Email").fill("someone@example.com");
  await page.getByLabel("Password").fill("12345678");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator(".field-error")).toContainText(/common|numeric/i);
});
