import { expect, it } from "vitest";
import { inspectAuthRedirect } from "./authRedirect";

it("removes untrusted auth errors and stale credentials while preserving invitation attribution", () => {
  const result = inspectAuthRedirect(
    "https://example.test/?ref=LO-fixture#error=access_denied&error_code=otp_expired&error_description=private-detail&access_token=stale-token&refresh_token=stale-refresh&type=recovery",
  );
  expect(result.error).toContain("invalid or has expired");
  expect(result.error).not.toContain("private-detail");
  expect(result.recovery).toBe(false);
  expect(result.cleanUrl).toBe("https://example.test/?ref=LO-fixture");
  expect(inspectAuthRedirect("https://example.test/?error=access_denied#featured-games").cleanUrl).toBe(
    "https://example.test/#featured-games",
  );
});
it("leaves a valid recovery callback intact for the Auth SDK", () => {
  const href = "https://example.test/#access_token=fixture-token&refresh_token=fixture-refresh&type=recovery";
  expect(inspectAuthRedirect(href)).toEqual({ error: "", recovery: true, cleanUrl: href });
  expect(inspectAuthRedirect("https://example.test/#type=recovery").recovery).toBe(false);
});
