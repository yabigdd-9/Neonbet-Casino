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
    "High Card Orbit",
    "Meteor Six",
    "Prism Pairs",
    "Orbit Sprint",
    "Treasure Chests",
    "Odd Orbit",
    "Orbit Keno",
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
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A little luck.");
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
      .getByRole("button", { name: "Play game: Neon Fruits", exact: true })
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
      .getByRole("button", { name: "Play game: Neon Fruits", exact: true })
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
  const buttons = page.locator('#featured-games button[aria-label^="Play game:"]');
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
  const cards = page.locator('#featured-games button[aria-label^="Play game:"]');
  await expect(cards).toHaveCount(24);
  await page.getByRole("button", { name: /Load more games/ }).click();
  await expect(cards).toHaveCount(48);
  const input = page.getByRole("textbox", { name: "Search games", exact: true });
  await input.fill("Basketball Blitz");
  const play = page
    .locator("#providers")
    .getByRole("button", { name: "Play game: Basketball Blitz", exact: true });
  await play.click();
  await expect(page.getByRole("dialog", { name: "Basketball Blitz" })).toBeVisible();
});

test("larger catalogue pages, final page and illustrated covers work on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const library = page.locator("#providers");
  const cards = library.locator(".game-card");
  await expect(cards).toHaveCount(48);
  await expect(library.getByRole("status")).toHaveText("Showing 1–48 of 528 games");
  await page.getByLabel("Games per page", { exact: true }).selectOption("96");
  await expect(cards).toHaveCount(96);
  for (let pageNumber = 0; pageNumber < 5; pageNumber++) {
    await library.getByRole("button", { name: "Next", exact: true }).click();
  }
  await expect(cards).toHaveCount(48);
  await expect(library.getByRole("status")).toHaveText("Showing 481–528 of 528 games");
  await expect(library.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  await cards.last().scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      cards
        .last()
        .locator("img")
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await cards
    .last()
    .getByRole("button", { name: /Play game:/ })
    .click();
  await page.getByRole("button", { name: "Launch Game", exact: true }).click();
  await page.getByRole("button", { name: "Spin $0.50", exact: true }).click();
  await expect(page.getByRole("button", { name: "Spin $0.50", exact: true })).toBeEnabled();
  await page.keyboard.press("Escape");
  await page.getByLabel("Game style", { exact: true }).selectOption("scatter");
  await expect(library.getByRole("navigation", { name: "Catalogue pages" })).toContainText("Page 1 of");
  await expect(library.getByRole("button", { name: "Previous", exact: true })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("game styles and sorting show playable games with matching rules", async ({ page }) => {
  await page.goto("./");
  await page.getByLabel("Game style", { exact: true }).selectOption("line");
  const library = page.locator("#providers");
  await expect(library.getByRole("button", { name: /Play game:/ }).first()).toBeVisible();
  await page.getByLabel("Sort games", { exact: true }).selectOption("az");
  await library
    .getByRole("button", { name: /Play game:/ })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("Left-to-right");
  await page.getByRole("button", { name: "Launch Game", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("First 3 match");
  await page.keyboard.press("Escape");
  await page.getByLabel("Game style", { exact: true }).selectOption("scatter");
  await library
    .getByRole("button", { name: /Play game:/ })
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

test("theme collections filter honestly while the simulation notice stays visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByLabel("Theme collection", { exact: true }).selectOption("Pragmatic Play");
  const library = page.locator("#providers");
  await expect(library.locator(".game-card")).toHaveCount(8);
  await expect(library.getByRole("status")).toHaveText("Showing 1–8 of 8 games");
  await expect(library.locator(".game-card").first()).not.toContainText(/practice/i);
  await expect(page.locator("header")).toContainText("Simulated games · No cash value");
  await library.getByRole("button", { name: "Play game: Gates of Olympus", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Simulated browser game only");
  await page.keyboard.press("Escape");
  await page.getByLabel("Theme collection", { exact: true }).selectOption("Lucky Orbit Originals");
  await expect(library.getByRole("status")).toHaveText("Showing 1–48 of 336 games");
});

test("sound is opt-in and practice history follows completed rounds", async ({ page }) => {
  await page.goto("./");
  const launch = async () => {
    await page
      .locator("#featured-games")
      .getByRole("button", { name: "Play game: Neon Fruits", exact: true })
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
  await page.getByText("Recent rounds", { exact: true }).click();
  await expect(page.getByRole("list", { name: "Recent rounds" }).getByRole("listitem")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await launch();
  await expect(page.getByRole("button", { name: "Sound on", exact: true })).toBeVisible();
});

test("Lucky Orbit branding is consistent across the lobby and customer care", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle(/Lucky Orbit/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A little luck.");
  await page.getByRole("button", { name: "Customer Care", exact: true }).click();
  await expect(page.getByRole("region", { name: "Lucky Orbit Customer Care" })).toBeVisible();
  await expect(
    page.getByText("Hi! I'm Lucky Orbit's automated assistant. How can I help today?"),
  ).toBeVisible();
});

test("invitation links are token-free and attribution does not award credits", async ({ page }) => {
  await page.goto(`./?ref=LO-${"a".repeat(32)}&token=do-not-share#private`);
  await expect(page.getByText("Invitation received on this browser.", { exact: false })).toBeVisible();
  const input = page.getByLabel("Your invitation link", { exact: true });
  const url = new URL(await input.inputValue());
  expect([...url.searchParams.keys()]).toEqual(["ref"]);
  expect(url.hash).toBe("");
  expect(url.searchParams.get("ref")).not.toBe(`LO-${"a".repeat(32)}`);
  await expect(page.getByText(/Referral rewards are not active yet/)).toBeVisible();
  await expect(page.locator("header").first()).toContainText("50.00");
  await page.getByRole("button", { name: "Copy invitation link", exact: true }).click();
  await expect(page.locator("#referrals [role=status]")).not.toBeEmpty();
});
test("support requests work on mobile and hand off to the configured inbox", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByRole("button", { name: "Customer Care", exact: true }).click();
  await page.getByRole("button", { name: "Referrals", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("20 referrals");
  await page.getByRole("button", { name: "Ask a person / support requests" }).click();
  const panel = page.getByRole("region", { name: "Support requests" });
  await panel.getByLabel("Describe the issue").fill("The game did not start on my phone.");
  await panel.getByRole("button", { name: "Save support request" }).click();
  await expect(panel.getByRole("status")).toContainText("saved on this device only");
  await expect(panel.getByRole("link", { name: "Email this request" })).toHaveAttribute(
    "href",
    /^mailto:yabigdd@gmail.com\?subject=/,
  );
  const control = panel.getByRole("button", { name: "Clear saved requests" });
  await control.scrollIntoViewIfNeeded();
  await expect(control).toBeInViewport();
  await control.click();
  await expect(panel.getByText("Recent requests", { exact: true })).toHaveCount(0);
});
test("a transient panel download can be retried", async ({ page }) => {
  let failed = false;
  await page.route("**/assets/AuthModal-*.js", (route) => {
    if (!failed) {
      failed = true;
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Register", exact: true }).click();
  await page.getByRole("button", { name: "Report loading issue" }).click();
  await expect(page.getByRole("region", { name: "Support requests" })).toBeVisible();
  await Promise.all([page.waitForEvent("load"), page.getByRole("button", { name: "Reload lobby" }).click()]);
  await expect(page).toHaveURL(/retryModules=1/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Register", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Create account" })).toBeVisible();
});

test("opening stake presets carry through without charging the preview", async ({ page }) => {
  await page.goto("./");
  await page
    .locator("#featured-games")
    .getByRole("button", { name: "Play game: Neon Fruits", exact: true })
    .click();
  await page.getByRole("button", { name: "Opening bet $0.25", exact: true }).click();
  await expect(page.locator("header").first()).toContainText("50.00");
  await page.getByRole("button", { name: "Launch Game", exact: true }).click();
  await expect(page.locator("header").first()).toContainText("50.00");
  const spin = page.getByRole("button", { name: "Spin $0.25", exact: true });
  await spin.click();
  await expect(spin).toBeEnabled();
  await page.getByText("Recent rounds", { exact: true }).click();
  await expect(page.getByRole("list", { name: "Recent rounds" })).toContainText("Stake $0.25");
});

test("a failed cover atlas falls back to local artwork and games still open", async ({ page }) => {
  await page.route("**/game-covers/casino-atlas.png", (route) => route.abort());
  await page.goto("./");
  const card = page.locator("#featured-games .game-card").first();
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator("img")).toHaveAttribute("src", /fruit\.svg$/);
  await expect
    .poll(() => card.locator("img").evaluate((image) => image.complete && image.naturalWidth > 0))
    .toBe(true);
  await card.getByRole("button", { name: "Play game: Neon Fruits", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Neon Fruits", exact: true })).toBeVisible();
});

test("support stays clear of tablet navigation and short-screen controls remain reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 600 });
  await page.goto("./");
  const support = page.getByRole("button", { name: "Customer Care", exact: true });
  const buttonBox = await support.boundingBox();
  const navBox = await page.getByRole("navigation", { name: "Mobile navigation" }).boundingBox();
  expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(navBox.y);
  await page.setViewportSize({ width: 390, height: 600 });
  await expect(support).toHaveCSS("width", "48px");
  await support.click();
  await expect(page.getByRole("button", { name: "Close customer care", exact: true })).toBeInViewport();
  await page.setViewportSize({ width: 600, height: 390 });
  const send = page.getByRole("button", { name: "Send message", exact: true });
  await send.scrollIntoViewIfNeeded();
  await expect(send).toBeInViewport();
  await page.getByRole("button", { name: "Ask a person / support requests" }).click();
  await expect(page.getByRole("region", { name: "Support requests" })).toBeVisible();
});

test("support forms load on demand with an email fallback if the download fails", async ({ page }) => {
  let requested = false;
  await page.route("**/assets/SupportRequests-*.js", (route) => {
    requested = true;
    return route.abort();
  });
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(requested).toBe(false);
  await page.getByRole("button", { name: "Customer Care", exact: true }).click();
  expect(requested).toBe(false);
  await page.getByRole("button", { name: "Ask a person / support requests" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "request form could not load" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Email support", exact: true })).toHaveAttribute(
    "href",
    "mailto:yabigdd@gmail.com",
  );
});

test("new worlds, recent games and filter recovery stay usable", async ({ page }) => {
  await page.goto("./");
  const featured = page.locator("#featured-games");
  await featured.getByRole("button", { name: "New worlds", exact: true }).click();
  await expect(featured.locator(".game-card")).toHaveCount(24);
  await expect(featured.getByRole("button", { name: "Play game: Neon Fruits", exact: true })).toHaveCount(0);
  await featured.getByRole("button", { name: "Featured picks", exact: true }).click();
  await featured.getByRole("button", { name: "Play game: Neon Fruits", exact: true }).click();
  await page.getByRole("button", { name: "Launch Game", exact: true }).click();
  await expect(page.getByRole("button", { name: "Spin $0.50", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const library = page.locator("#providers");
  await library.getByRole("button", { name: "Recent", exact: true }).click();
  await expect(library.locator(".game-card")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Search games", exact: true }).fill("missing game");
  await expect(library.getByText("No matching recent games", { exact: true })).toBeVisible();
  await library.getByRole("button", { name: "Show all games", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Search games", exact: true })).toHaveValue("");
  await expect(library.locator(".game-card")).toHaveCount(48);
});
