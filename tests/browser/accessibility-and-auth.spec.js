import { test, expect } from "@playwright/test";

const user = { id: "00000000-0000-0000-0000-000000000001", email: "user@example.test", aud: "authenticated", role: "authenticated", user_metadata: {}, app_metadata: {} };
function session() {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return {
    access_token: `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, role: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`,
    refresh_token: "local-test-refresh", expires_in: 3600, token_type: "bearer", user,
  };
}

// No requests reach real auth services and no email, funds or user records are sent.
test.beforeEach(async ({ page }) => {
  await page.route("https://auth.example.invalid/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/token")) return route.fulfill({ json: session() });
    if (url.pathname.endsWith("/logout")) return route.fulfill({ status: 204 });
    if (url.pathname.endsWith("/recover")) return route.fulfill({ json: {} });
    if (url.pathname.endsWith("/user")) return route.fulfill({ json: user });
    if (url.pathname.endsWith("/profiles")) return route.fulfill({ json: { ...user, role: "user", username: "Test User", verification_status: "not_submitted" } });
    if (url.pathname.startsWith("/rest/v1/")) return route.fulfill({ json: [] });
    return route.abort();
  });
});

test("fits the viewport and has keyboard-accessible dialogs", async ({ page, isMobile }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (!isMobile) {
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  }
  const opener = page.getByRole("button", { name: "Login", exact: true }).first();
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Login", exact: true });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height + 1);
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  expect(errors).toEqual([]);
});

test("sign-in survives session events, reload and sign-out without showing admin controls", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Login", exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: "Login", exact: true });
  await dialog.getByLabel("Email", { exact: true }).fill(user.email);
  await dialog.getByLabel("Password", { exact: true }).fill("test-password-only");
  await dialog.getByRole("button", { name: "Login", exact: true }).last().click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Logout", exact: true })).toBeVisible();
  await expect(page.locator("#admin")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "Logout", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(page.getByRole("button", { name: "Logout", exact: true })).toBeHidden();
  await expect(page.getByRole("button", { name: "Login", exact: true }).first()).toBeVisible();
});

test("requests password recovery through the mocked backend", async ({ page }) => {
  let requests = 0;
  await page.route("https://auth.example.invalid/auth/v1/recover**", (route) => { requests++; return route.fulfill({ json: {} }); });
  await page.goto("/");
  await page.getByRole("button", { name: "Login", exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: "Login", exact: true });
  await dialog.getByLabel("Email", { exact: true }).fill(user.email);
  await dialog.getByRole("button", { name: "Send password reset email" }).click();
  await expect(dialog.getByRole("alert")).toContainText("If this email is registered");
  expect(requests).toBe(1);
});

test("recovery links allow a password update without exposing tokens to diagnostics", async ({ page }) => {
  let updates = 0;
  await page.route("https://auth.example.invalid/auth/v1/user**", (route) => {
    if (route.request().method() === "PUT") updates++;
    return route.fulfill({ json: user });
  });
  const data = session();
  const fragment = new URLSearchParams({ access_token: data.access_token, refresh_token: data.refresh_token, type: "recovery", expires_in: "3600", token_type: "bearer" });
  await page.goto(`/#${fragment}`);
  const dialog = page.getByRole("dialog", { name: "Reset your password" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("New password", { exact: true }).fill("updated-test-password");
  await dialog.getByLabel("Confirm new password", { exact: true }).fill("updated-test-password");
  await dialog.getByRole("button", { name: "Update password", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(updates).toBe(1);
  expect(await page.evaluate(() => sessionStorage.getItem("neonbet-diagnostics") || "")).not.toContain(data.access_token);
});

test("failed sign-out stays signed in and records a code without provider error details", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Login", exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: "Login", exact: true });
  await dialog.getByLabel("Email", { exact: true }).fill(user.email);
  await dialog.getByLabel("Password", { exact: true }).fill("test-password-only");
  await dialog.getByRole("button", { name: "Login", exact: true }).last().click();
  await expect(dialog).toBeHidden();
  await page.route("https://auth.example.invalid/auth/v1/logout**", (route) => route.fulfill({ status: 500, json: { message: "private-provider-details" } }));
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(page.getByText("Sign out failed. Please try again.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Logout", exact: true })).toBeVisible();
  const diagnostics = await page.evaluate(() => sessionStorage.getItem("neonbet-diagnostics"));
  expect(diagnostics).toContain("logout_error");
  expect(diagnostics).not.toContain("private-provider-details");
});


test("rejected credentials show a generic error without signing in", async ({ page }) => {
  await page.route("https://auth.example.invalid/auth/v1/token**", (route) => route.fulfill({ status: 400, json: { message: "private-provider-details", error_code: "invalid_credentials" } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Login", exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: "Login", exact: true });
  await dialog.getByLabel("Email", { exact: true }).fill(user.email);
  await dialog.getByLabel("Password", { exact: true }).fill("incorrect-test-password");
  await dialog.getByRole("button", { name: "Login", exact: true }).last().click();
  await expect(dialog.getByRole("alert")).toHaveText("Account action failed. Check your details and try again.");
  await expect(page.getByRole("button", { name: "Logout", exact: true })).toHaveCount(0);
  await expect(page.getByText("private-provider-details", { exact: true })).toHaveCount(0);
});
