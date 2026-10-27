// Readiness tooling only: not an HTTP endpoint, geolocation service, or production access control.
import regions from "./iso3166.json";

type Region = { code: string; name: string };
export type ReviewStatus = "unreviewed";
export type MarketRecord = Region & {
  enabled: false;
  legalReview: ReviewStatus;
  licensing: ReviewStatus;
  gameProvider: ReviewStatus;
  paymentProvider: ReviewStatus;
  ageAndIdentity: ReviewStatus;
  advertising: ReviewStatus;
  responsiblePlay: ReviewStatus;
  transactionMonitoring: ReviewStatus;
  customerSupport: ReviewStatus;
};

/** All entries are intentionally unreviewed, including territories and non-target markets. */
export function getMarketRegister(): readonly MarketRecord[] {
  return regions.map((region) => ({
    ...region,
    enabled: false,
    legalReview: "unreviewed",
    licensing: "unreviewed",
    gameProvider: "unreviewed",
    paymentProvider: "unreviewed",
    ageAndIdentity: "unreviewed",
    advertising: "unreviewed",
    responsiblePlay: "unreviewed",
    transactionMonitoring: "unreviewed",
    customerSupport: "unreviewed",
  }));
}

/** No country, identity claim, or provider input can turn on real-money operations. */
export function authorizeRealMoney(
  _operation: "register" | "play" | "deposit" | "withdraw",
  _country: unknown,
) {
  return { allowed: false as const, reason: "REAL_MONEY_DISABLED" as const };
}
