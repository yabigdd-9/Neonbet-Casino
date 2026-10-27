import { useState, useSyncExternalStore } from "react";
import { RoundController } from "../lib/roundController";
export function useDemoWallet() {
  const [controller] = useState(() => new RoundController());
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  return {
    ...snapshot,
    balance: snapshot.cents / 100,
    start: controller.start,
    claimDaily: controller.claimDaily,
  };
}
