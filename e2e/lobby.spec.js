import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const widths = [360, 390, 768, 1440];
test("daily demo reward credits the wallet once per day", async ({ page }) => {
  await page.goto("./");
  const claim = page.getByRole("button", { name: "Claim daily bonus practice credits" });
  await claim.click();
  await expect(page.getByText(/bonus practice credits added for this session/)).toBeVisible();
  await claim.click();
  await expect(page.getByText(/Already claimed today/)).toBeVisible();
});
test("every arcade play button loads and settles a simulated round", async ({ page }) => {
  await page.goto("./");
  for (const title of [
    "Dice Duel",
    "Plinko Drop",
    "Neon Crash",
    "Neon Coin Flip",
    "Lucky Wheel",
    "Lucky Seven",
    "Neon Draw",
  ]) {
    await page.getByRole("button", { name: `Play ${title}`, exact: true }).click();
    const dialog = page.getByRole("dialog", { name: title });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Play $0.50", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "Play $0.50", exact: true })).toBeEnabled();
    await expect(dialog.getByRole("status")).not.toContainText("Ready");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }
});
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
    await page
      .locator("#featured-games")
      .getByRole("button", { name: "Play practice game: Neon Fruits", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Launch Game", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Neon Fruits" })).toBeVisible();
    await page.getByRole("button", { name: "Spin $0.50", exact: true }).click();
    await page.getByRole("button", { name: "Close dialog", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    await page
      .locator("#featured-games")
      .getByRole("button", { name: "Play practice game: Neon Fruits", exact: true })
      .click();
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

test("every featured game launches and plays, and policy buttons load content", async ({ page }) => {
  test.setTimeout(180000);
  await page.goto("./");
  const buttons = page.locator('#featured-games button[aria-label^="Play practice game:"]');
  const count = await buttons.count();
  expect(count).toBeGreaterThanOrEqual(12);
  for (let index = 0; index < count; index++) {
    await buttons.nth(index).click();
    await page.getByRole("button", { name: "Launch Game", exact: true }).click();
    const dialog = page.getByRole("dialog");
    const spin = dialog.getByRole("button", { name: "Spin $0.50", exact: true });
    await spin.click();
    await expect(spin).toBeEnabled();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }
  const policies = page.locator("#footer button");
  for (let index = 0; index < (await policies.count()); index++) {
    const title = await policies.nth(index).innerText();
    await policies.nth(index).click();
    await expect(page.getByRole("dialog", { name: title })).toBeVisible();
    await page.keyboard.press("Escape");
  }
});

test("mobile menu and navigation buttons reach their destinations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const nav = page.getByRole("navigation", { name: "Mobile navigation" });
  for (const [label, id] of [
    ["Arcade", "arcade-games"],
    ["Promos", "promotions"],
    ["Home", "lobby"],
  ]) {
    await nav.getByRole("button", { name: label, exact: true }).click();
    await expect
      .poll(() => page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top))
      .toBeLessThan(200);
  }
  await nav.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Search games", exact: true })).toBeFocused();
  await nav.getByRole("button", { name: "Account", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Featured games", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("more slots load and original themes are searchable", async ({ page }) => {
  await page.goto("./");
  const cards = page.locator('#featured-games button[aria-label^="Play practice game:"]');
  await expect(cards).toHaveCount(12);
  await page.getByRole("button", { name: /Load more games/ }).click();
  await expect(cards).toHaveCount(24);
  const input = page.getByRole("textbox", { name: "Search games", exact: true });
  await input.fill("Basketball Blitz");
  const play = page
    .locator("#providers")
    .getByRole("button", { name: "Play practice game: Basketball Blitz", exact: true });
  await play.click();
  await expect(page.getByRole("dialog", { name: "Basketball Blitz" })).toBeVisible();
});

test("game styles and sorting show playable games with matching rules", async ({ page }) => {
  await page.goto("./");
  await page.getByLabel("Game style", { exact: true }).selectOption("line");
  const library = page.locator("#providers");
  await expect(library.getByRole("button", { name: /Play practice game:/ }).first()).toBeVisible();
  await page.getByLabel("Sort games", { exact: true }).selectOption("az");
  await library
    .getByRole("button", { name: /Play practice game:/ })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("Left-to-right");
  await page.getByRole("button", { name: "Launch Game", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("First 3 match");
  await page.keyboard.press("Escape");
  await page.getByLabel("Game style", { exact: true }).selectOption("scatter");
  await library
    .getByRole("button", { name: /Play practice game:/ })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("Star scatter");
  await page.getByRole("button", { name: "Launch Game", exact: true }).click();
  await page.evaluate(() => {
    Math.random = () => 0.65;
  });
  const spin = page.getByRole("button", { name: "Spin $0.50", exact: true });
  await spin.click();
  await expect(spin).toBeEnabled();
  await expect(page.getByRole("dialog")).toContainText("3 bonus spins included");
  await expect(page.getByRole("dialog")).toContainText("Bonus 3:");
});

test("sound is opt-in and practice history follows completed rounds", async ({ page }) => {
  await page.goto("./");
  const launch = async () => {
    await page
      .locator("#featured-games")
      .getByRole("button", { name: "Play practice game: Neon Fruits", exact: true })
      .click();
    await page.getByRole("button", { name: "Launch Game", exact: true }).click();
  };
  await launch();
  const sound = page.getByRole("button", { name: "Sound off", exact: true });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(page.getByRole("button", { name: "Sound on", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const spin = page.getByRole("button", { name: "Spin $0.50", exact: true });
  await spin.click();
  await expect(spin).toBeEnabled();
  await page.getByText("Recent practice rounds", { exact: true }).click();
  await expect(page.getByRole("list", { name: "Recent practice rounds" }).getByRole("listitem")).toHaveCount(
    1,
  );
  await page.keyboard.press("Escape");
  await launch();
  await expect(page.getByRole("button", { name: "Sound on", exact: true })).toBeVisible();
});
