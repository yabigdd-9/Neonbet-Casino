import { test, expect } from "@playwright/test";

// These browser tests exercise the real client against local HTTP fixtures.
// They never create live accounts, send email or connect to the hosted database.
const inviter = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "inviter@example.invalid",
  code: `LO-${"a".repeat(32)}`,
};
const invitee = {
  id: "00000000-0000-4000-8000-000000000002",
  email: "invitee@example.invalid",
  code: `LO-${"b".repeat(32)}`,
};
function session(account) {
  const payload = { sub: account.id, exp: Math.floor(Date.now() / 1000) + 3600 };
  const access_token = [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
    Buffer.from(JSON.stringify(payload)).toString("base64url"),
    "fixture",
  ].join(".");
  return {
    access_token,
    refresh_token: "isolated-fixture",
    token_type: "bearer",
    expires_in: 3600,
    user: {
      id: account.id,
      email: account.email,
      aud: "authenticated",
      role: "authenticated",
      email_confirmed_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
    },
  };
}
async function fixture(context, state) {
  await context.route("**/*", async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") return route.abort();
    if (url.port !== "54399") return route.continue();
    const reply = (json, status = 200) => route.fulfill({ status, contentType: "application/json", json });
    const body = request.postDataJSON();
    if (url.pathname === "/auth/v1/signup") {
      state.signups += 1;
      return reply({ user: { id: invitee.id, email: body.email, identities: [] }, session: null });
    }
    if (url.pathname === "/auth/v1/token")
      return reply(session(body.email === inviter.email ? inviter : invitee));
    if (url.pathname === "/auth/v1/logout") return reply({});
    if (url.pathname === "/auth/v1/recover") {
      state.recoveries += 1;
      return reply({});
    }
    const token = request.headers().authorization?.split(" ")[1];
    const id = token ? JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).sub : null;
    const account = id === inviter.id ? inviter : invitee;
    if (url.pathname === "/auth/v1/user") {
      if (request.method() === "PUT") {
        state.passwordUpdates = (state.passwordUpdates || 0) + 1;
        expect(body.password).toBe("new-isolated-password");
        if (state.failPassword)
          return reply({ code: "unexpected_failure", msg: "private-provider-detail" }, 500);
      }
      return reply(session(account).user);
    }
    if (url.pathname === "/rest/v1/profiles")
      return reply({
        id: account.id,
        username: account.email,
        role: "user",
        verification_status: "not_submitted",
      });
    if (
      url.pathname === "/rest/v1/verification_submissions" ||
      url.pathname === "/rest/v1/withdrawal_requests"
    )
      return reply([]);
    if (url.pathname === "/rest/v1/rpc/get_practice_referral_status") {
      if (state.failStatus) {
        return reply({ message: "Fixture failure" }, 503);
      }
      return reply({
        code: account.code,
        credits: id === inviter.id && state.claimed ? 5 : 0,
        count: id === inviter.id && state.claimed ? 1 : 0,
        claimed: id === invitee.id && state.claimed,
      });
    }
    if (url.pathname === "/rest/v1/rpc/claim_practice_referral") {
      state.claimCalls += 1;
      expect(id).toBe(invitee.id);
      expect(body.invite_code).toBe(inviter.code);
      if (state.holdClaim) await state.holdClaim;
      state.claimed = true;
      return reply({ claimed: true, rewardCredits: 5 });
    }
    throw new Error(`Unexpected fixture request: ${request.method()} ${url.pathname}`);
  });
}
async function login(page, email) {
  await page.getByRole("button", { name: "Login", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Login", exact: true });
  await dialog.getByLabel("Email", { exact: true }).fill(email);
  await dialog.getByLabel("Password", { exact: true }).fill("isolated-browser-password");
  await dialog.getByRole("button", { name: "Login", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Logout", exact: true })).toBeVisible();
}
test("pending confirmation, explicit claim, separate inviter account and session restore", async ({
  browser,
  baseURL,
}) => {
  const state = { signups: 0, claimCalls: 0, recoveries: 0, claimed: false };
  const inviterContext = await browser.newContext();
  const inviteeContext = await browser.newContext();
  try {
    await fixture(inviterContext, state);
    await fixture(inviteeContext, state);
    const host = await inviterContext.newPage(),
      guest = await inviteeContext.newPage();
    await host.goto(baseURL);
    await expect(host.getByRole("button", { name: "Copy invitation link" })).toBeDisabled();
    await login(host, inviter.email);
    await expect(host.getByLabel("Your invitation link", { exact: true })).toHaveValue(
      new RegExp(inviter.code),
    );
    const link = await host.getByLabel("Your invitation link", { exact: true }).inputValue();
    expect(new URL(link).searchParams.get("ref")).toBe(inviter.code);
    await guest.goto(link);
    await guest.getByRole("button", { name: "Register", exact: true }).click();
    const form = guest.getByRole("dialog", { name: "Create account" });
    await form.getByLabel("Email", { exact: true }).fill(invitee.email);
    await form.getByLabel("Password", { exact: true }).fill("isolated-browser-password");
    await form.getByLabel("Username", { exact: true }).fill("Invited player");
    await form.getByRole("checkbox").check();
    await form.getByRole("button", { name: "Create account", exact: true }).click();
    await expect(form.getByRole("alert")).toContainText("Check your email");
    expect(state.signups).toBe(1);
    expect(state.claimCalls).toBe(0);
    await guest.keyboard.press("Escape");
    await login(guest, invitee.email);
    const apply = guest.getByRole("button", { name: "Apply received invitation", exact: true });
    await expect(apply).toBeEnabled();
    expect(state.claimCalls).toBe(0);
    await apply.click();
    await expect(guest.locator("#referrals [role=status]")).toContainText("Invitation applied");
    await expect(apply).toHaveCount(0);
    await guest.reload();
    await expect(guest.locator("#referrals")).toContainText("0 non-cash practice credits earned");
    await expect(apply).toHaveCount(0);
    expect(state.claimCalls).toBe(1);
    await host.reload();
    await expect(host.locator("#referrals")).toContainText(
      "5 non-cash practice credits earned from 1 verified referrals",
    );
    await expect(host.locator("header").first()).toContainText("55.00");
    await host.reload();
    await expect(host.locator("header").first()).toContainText("55.00");
    await guest.getByRole("button", { name: "Logout", exact: true }).click();
    await expect(guest.getByLabel("Your invitation link", { exact: true })).toHaveValue("");
  } finally {
    await inviterContext.close();
    await inviteeContext.close();
  }
});
test("recovery callbacks require matching passwords and support retry after an update fails", async ({
  page,
  context,
}) => {
  const state = { claimed: false, passwordUpdates: 0, failPassword: true };
  await fixture(context, state);
  const recovery = session(invitee);
  const fragment = new URLSearchParams({
    access_token: recovery.access_token,
    refresh_token: recovery.refresh_token,
    expires_in: "3600",
    token_type: "bearer",
    type: "recovery",
  });
  await page.goto(`./#${fragment}`);
  const form = page.getByRole("dialog", { name: "Set a new password" });
  await expect(form).toBeVisible();
  await expect(page).not.toHaveURL(/access_token|refresh_token/);
  await form.getByLabel("New password", { exact: true }).fill("new-isolated-password");
  await form.getByLabel("Confirm new password", { exact: true }).fill("does-not-match");
  await expect(form.getByRole("button", { name: "Update password", exact: true })).toBeDisabled();
  expect(state.passwordUpdates).toBe(0);
  await form.getByLabel("Confirm new password", { exact: true }).fill("new-isolated-password");
  await form.getByRole("button", { name: "Update password", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText("Password could not be updated");
  await expect(form).not.toContainText("private-provider-detail");
  state.failPassword = false;
  await form.getByRole("button", { name: "Update password", exact: true }).click();
  await expect(form).toHaveCount(0);
  await expect(page.getByText("Password updated", { exact: true })).toBeVisible();
  expect(state.passwordUpdates).toBe(2);
});
test("expired email links show a safe retry path and reset requests do not reveal account existence", async ({
  page,
  context,
}) => {
  const state = { recoveries: 0 };
  await fixture(context, state);
  await page.goto("./#error=access_denied&error_code=otp_expired&error_description=private-provider-detail");
  await expect(
    page.getByRole("alert").filter({ hasText: "This email link is invalid or has expired" }),
  ).toBeVisible();
  await expect(page).not.toHaveURL(/error_description|otp_expired/);
  await expect(page.locator("body")).not.toContainText("private-provider-detail");
  await page.getByRole("button", { name: "Request another reset email", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Login", exact: true });
  await form.getByLabel("Email", { exact: true }).fill("missing@example.invalid");
  await form.getByRole("button", { name: "Send password reset email" }).click();
  await expect(form.getByRole("alert")).toContainText("If an account uses that email");
  expect(state.recoveries).toBe(1);
});
test("status errors can be retried and a late claim does not change a different account", async ({
  page,
  context,
}) => {
  let release;
  const state = {
    claimCalls: 0,
    claimed: false,
    failStatus: true,
    holdClaim: new Promise((resolve) => {
      release = resolve;
    }),
  };
  await fixture(context, state);
  await page.goto(`./?ref=${inviter.code}`);
  await login(page, invitee.email);
  await expect(page.locator("#referrals [role=alert]")).toContainText("unavailable");
  await expect(page.getByRole("button", { name: "Copy invitation link" })).toBeDisabled();
  state.failStatus = false;
  await page.getByRole("button", { name: "Refresh referral status" }).click();
  await page.getByRole("button", { name: "Apply received invitation", exact: true }).click();
  await expect.poll(() => state.claimCalls).toBe(1);
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await login(page, inviter.email);
  await expect(page.getByLabel("Your invitation link", { exact: true })).toHaveValue(
    new RegExp(inviter.code),
  );
  release();
  await expect.poll(() => state.claimed).toBe(true);
  await expect(page.locator("#referrals [role=status]")).not.toContainText("Invitation applied");
  await expect(page.getByLabel("Your invitation link", { exact: true })).toHaveValue(
    new RegExp(inviter.code),
  );
});
