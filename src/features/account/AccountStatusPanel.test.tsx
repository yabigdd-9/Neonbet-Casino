import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import AccountStatusPanel from "./AccountStatusPanel";

it("reports a zero rollover requirement as complete and accessible", () => {
  render(
    <AccountStatusPanel
      user={{ id: "local-test" }}
      latestSubmission={null}
      profile={{
        id: "local-test",
        username: "Test",
        role: "user",
        verification_status: "verified",
        bonus_balance: 0,
        rollover_required: 0,
        rollover_progress: 0,
      }}
    />,
  );
  expect(screen.getByRole("progressbar", { name: "Rollover progress" }).getAttribute("aria-valuenow")).toBe(
    "100",
  );
});
