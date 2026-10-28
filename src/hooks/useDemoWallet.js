import { useState, useSyncExternalStore } from "react";
import { RoundController } from "../lib/roundController";
export function useDemoWallet(userId) {
  const [controllers] = useState(() => new Map());
  const key = userId || "guest";
  if (!controllers.has(key)) controllers.set(key, new RoundController());
  const controller = controllers.get(key);
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  return {
    ...snapshot,
    balance: snapshot.cents / 100,
    start: controller.start,
    claimDaily: controller.claimDaily,
    applyReferralCredits: controller.applyReferralCredits,
  };
}
