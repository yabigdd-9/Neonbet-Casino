import { describe, expect, it } from "vitest";
import { authorizeRealMoney, getMarketRegister } from "./marketReadiness";

describe("real-money readiness", () => {
  it("lists ISO regions without claiming any review or approval", () => {
    const markets = getMarketRegister();
    expect(markets.length).toBe(249);
    expect(new Set(markets.map(({ code }) => code)).size).toBe(markets.length);
    for (const market of markets) {
      expect(market).toMatchObject({
        enabled: false,
        legalReview: "unreviewed",
        licensing: "unreviewed",
        gameProvider: "unreviewed",
        paymentProvider: "unreviewed",
        ageAndIdentity: "unreviewed",
        advertising: "unreviewed",
      });
    }
  });
  it("denies all real-money operations for known, malformed, and missing locations", () => {
    for (const country of ["CW", "GB", "NZ", "ZZ", "", null, undefined, {}, 42])
      for (const action of ["register", "play", "deposit", "withdraw"] as const)
        expect(authorizeRealMoney(action, country)).toEqual({
          allowed: false,
          reason: "REAL_MONEY_DISABLED",
        });
  });
});
