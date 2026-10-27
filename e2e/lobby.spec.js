import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const widths = [360, 390, 768, 1440];
for (const width of widths) {
  test(`lobby, search, modal and layout at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [],
      failed = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) failed.push(response.url());
    });
    await page.goto("./");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A little escape.");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    mkdirSync("test-results/screenshots", { recursive: true });
    await page.screenshot({ path: `test-results/screenshots/${info.project.name}-${width}.png` });
    const input = page.getByRole("textbox", { name: "Search games", exact: true });
    await input.fill("zzzzzz-no-game");
    await expect(page.getByText("No matching games")).toBeVisible();
    await page.getByRole("button", { name: "Clear search", exact: true }).click();
    await expect(page.getByText("No matching games")).toHaveCount(0);
    await page.getByRole("button", { name: "Play demo: Neon Fruits", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Launch Game", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Neon Fruits" })).toBeVisible();
    await page.getByRole("button", { name: "Spin $0.50", exact: true }).click();
    await page.getByRole("button", { name: "Close dialog", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    await page.getByRole("button", { name: "Play demo: Neon Fruits", exact: true }).click();
    await page.getByRole("button", { name: "Launch Game", exact: true }).click();
    await expect(page.getByRole("button", { name: "Spin $0.50", exact: true })).toBeEnabled();
    await page.keyboard.press("Escape");
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
  });
}
test("keyboard, reduced motion, accessibility and corrupt storage", async ({ page, browserName }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("neonbetUser", '{"id":3}');
    localStorage.setItem("neonbetRecentGames", "[null,{},123]");
    localStorage.setItem("neonbetFavorites", "[{},null,3]");
  });
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((row) => ["critical", "serious"].includes(row.impact))).toEqual([]);
  await page.getByRole("button", { name: "Register", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Create account" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("demo account navigation and form errors retain input", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByRole("button", { name: "Register", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Create account" });
  await dialog.getByLabel("Username", { exact: true }).fill("Synthetic Player");
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("button", { name: "Account", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const hash = page.getByRole("textbox", { name: "Transaction hash", exact: true });
  await hash.fill("invalid-reference");
  await page.getByRole("button", { name: "Submit for manual review" }).click();
  await expect(page.locator('#verification [role="alert"]')).toBeVisible();
  await expect(hash).toHaveValue("invalid-reference");
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(page.getByRole("button", { name: "Login", exact: true })).toBeVisible();
});
test("captures mobile navigation timing without contacting external services", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const external = [];
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname)) {
      external.push(url.hostname);
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const timing = await page.evaluate(() => ({
    navigation: performance.getEntriesByType("navigation").map((entry) => entry.toJSON()),
    paints: performance.getEntriesByType("paint").map((entry) => entry.toJSON()),
  }));
  mkdirSync("test-results", { recursive: true });
  writeFileSync(`test-results/mobile-${info.project.name}.json`, JSON.stringify(timing, null, 2));
  expect(external).toEqual([]);
});

test("a failed feature download keeps the lobby usable", async ({ page }) => {
  await page.route("**/assets/AuthModal-*.js", (route) => route.abort());
  await page.goto("./");
  await page.getByRole("button", { name: "Register", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "This panel could not load" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
