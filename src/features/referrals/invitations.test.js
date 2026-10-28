import { beforeEach, expect, it } from "vitest";
import { invitationCode, invitationLink, receivedInvitation } from "./invitations";
beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/");
});
it("shares only a validated code, never authentication parameters or fragments", () => {
  const code = invitationCode();
  expect(invitationCode()).toBe(code);
  const url = new URL(invitationLink(code, "https://example.com/arcade/?token=secret#access_token=secret"));
  expect([...url.searchParams.keys()]).toEqual(["ref"]);
  expect(url.hash).toBe("");
  expect(() => invitationLink("bad")).toThrow();
});
it("records first invitation locally without accepting self-referrals or replacing attribution", () => {
  const own = invitationCode();
  history.replaceState(null, "", `/?ref=${own}`);
  expect(receivedInvitation(own)).toBeNull();
  const first = `LO-${"a".repeat(32)}`,
    second = `LO-${"b".repeat(32)}`;
  history.replaceState(null, "", `/?ref=${first}`);
  expect(receivedInvitation(own)).toBe(first);
  expect(location.search).toBe("");
  history.replaceState(null, "", `/?ref=${second}`);
  expect(receivedInvitation(own)).toBe(first);
});
