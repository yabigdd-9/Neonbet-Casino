import { describe, it, expect } from "vitest";
import {
  VERIFICATION_STATUS,
  SUBMISSION_STATUS,
  WITHDRAWAL_STATUS,
  ACCOUNT_STATUS,
  statusStyles,
  statusLabels,
  statusStyle,
  statusLabel,
} from "./status.js";

describe("status constants", () => {
  it("exposes the four status enums with the documented values", () => {
    expect(VERIFICATION_STATUS).toEqual({
      NOT_SUBMITTED: "not_submitted",
      PENDING: "pending",
      VERIFIED: "verified",
      REJECTED: "rejected",
    });
    expect(SUBMISSION_STATUS).toEqual({
      PENDING: "pending",
      VERIFIED: "verified",
      REJECTED: "rejected",
    });
    expect(WITHDRAWAL_STATUS).toEqual({
      PENDING: "pending",
      APPROVED: "approved",
      PAID: "paid",
      REJECTED: "rejected",
    });
    expect(ACCOUNT_STATUS).toEqual({
      ACTIVE: "active",
      RESTRICTED: "restricted",
      SUSPENDED: "suspended",
    });
  });
});

describe("statusStyles", () => {
  it("maps every rendered status value to a tailwind class string", () => {
    const keys = ["not_submitted", "pending", "verified", "approved", "paid", "rejected"];
    for (const key of keys) {
      expect(typeof statusStyles[key]).toBe("string");
      expect(statusStyles[key].length).toBeGreaterThan(0);
    }
  });
});

describe("statusLabels", () => {
  it("provides a human label for every rendered status value", () => {
    expect(statusLabels).toEqual({
      not_submitted: "Not submitted",
      pending: "Pending review",
      verified: "Verified",
      approved: "Approved",
      paid: "Paid",
      rejected: "Rejected",
    });
  });
});

describe("statusBar style/label helpers", () => {
  it("returns the matching style and label for known statuses", () => {
    expect(statusStyle("verified")).toBe(statusStyles.verified);
    expect(statusLabel("pending")).toBe("Pending review");
  });

  it("falls back to the not_submitted style for unknown statuses", () => {
    expect(statusStyle("mystery")).toBe(statusStyles.not_submitted);
  });

  it('falls back to the status string, then "Unknown", for unknown labels', () => {
    expect(statusLabel("mystery")).toBe("mystery");
    expect(statusLabel(null)).toBe("Unknown");
    expect(statusLabel(undefined)).toBe("Unknown");
  });
});
