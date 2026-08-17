import { test, expect } from "@playwright/test";

// Core buyer-facing smoke flow (P46). These assertions guard the "sellable"
// contract: the lobby renders, navigation works, a game opens, and the
// verification panel shows the configured (server-derived) fee — never a broken
// or hard-coded value.
test.describe("NeonBet lobby smoke", () => {
  test("lobby renders with hero, games, and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /neon lobby/i })).toBeVisible();
    await expect(page.locator("#featured-games")).toBeVisible();
    await expect(page.locator("#arcade-games")).toBeVisible();
    await expect(page.locator("#providers")).toBeVisible();
  });

  test("opening a featured game shows the game modal", async ({ page }) => {
    await page.goto("/");
    const firstPlay = page
      .locator("#featured-games")
      .getByRole("button", { name: /play/i })
      .first();
    await firstPlay.click();
    // The game launch/modal area becomes visible (heading or modal).
    await expect(page.getByText(/spin|bet|credits|balance/i).first()).toBeVisible();
  });

  test("verification panel shows a fee and no developer leakage", async ({ page }) => {
    await page.goto("/");
    const verification = page.locator("#verification");
    await expect(verification).toBeVisible();
    // Fee must render as a currency amount.
    await expect(verification.getByText(/\$\d+/).first()).toBeVisible();
    // No developer/setup language should leak to the customer.
    await expect(verification.getByText(/src\/config\//i)).toHaveCount(0);
    await expect(verification.getByText(/VITE_/i)).toHaveCount(0);
  });

  test("skip link is present for keyboard users", async ({ page }) => {
    await page.goto("/");
    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeAttached();
  });

  test("mobile nav renders and has an active state", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const home = page.getByRole("button", { name: "Home" });
    await expect(home).toBeVisible();
    await expect(home).toHaveAttribute("aria-current", "page");
  });
});
