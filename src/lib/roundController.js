import { buildSpin, playArcade } from "./gameEngine";
import { DEMO_START_CENTS } from "../config/demoBonus";

// One controller belongs to the app, not to a game modal. Closing a player never loses a settlement.
export class RoundController {
  listeners = new Set();
  timer = null;
  snapshot = {
    cents: DEMO_START_CENTS,
    referralCents: 0,
    wageredCents: 0,
    busy: false,
    round: null,
    history: [],
  };
  applyReferralCredits = (credits) => {
    if (!Number.isSafeInteger(credits) || credits < 0 || credits > 100) return false;
    const total = credits * 100;
    const increase = total - this.snapshot.referralCents;
    if (increase <= 0) return false;
    this.publish({ cents: this.snapshot.cents + increase, referralCents: total });
    return true;
  };
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getSnapshot = () => this.snapshot;
  publish(next) {
    this.snapshot = { ...this.snapshot, ...next };
    this.listeners.forEach((listener) => listener());
  }
  claimDaily = () => {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const weekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;
    try {
      const previous = window.localStorage.getItem("neonbet:daily-demo-reward");
      if (previous && previous >= day) return "already-claimed";
      window.localStorage.setItem("neonbet:daily-demo-reward", day);
    } catch {
      return "storage-error";
    }
    this.publish({ cents: this.snapshot.cents + (weekend ? 1000 : 500) });
    return weekend ? "claimed-weekend" : "claimed";
  };
  start = (game, stake, target = 2) => {
    const arcade = typeof game?.id === "string" && game.id.trim().length > 0;
    const slot = typeof game?.title === "string" && game.title.trim().length > 0;
    if ((!arcade && !slot) || typeof stake !== "number" || !Number.isFinite(stake)) return false;
    const cents = Math.round(stake * 100);
    if (
      this.snapshot.busy ||
      !Number.isSafeInteger(cents) ||
      cents <= 0 ||
      Math.abs(cents / 100 - stake) > 1e-9 ||
      this.snapshot.cents < cents
    )
      return false;
    let round;
    let winCents;
    try {
      const result = arcade ? playArcade(game.id, target) : buildSpin(game);
      winCents = Math.round(cents * result.multiplier);
      if (!Number.isSafeInteger(winCents) || winCents < 0) return false;
      round = {
        ...result,
        id: crypto.randomUUID(),
        gameId: arcade ? game.id : game.title,
        gameTitle: game.title || game.id,
        stakeCents: cents,
        winCents,
        win: winCents / 100,
      };
    } catch {
      // Malformed catalogue data or an unavailable browser API must not debit the wallet.
      return false;
    }
    this.publish({
      cents: this.snapshot.cents - cents,
      wageredCents: this.snapshot.wageredCents + cents,
      busy: true,
    });
    this.timer = setTimeout(() => {
      this.timer = null;
      this.publish({
        cents: this.snapshot.cents + winCents,
        busy: false,
        round,
        history: [round, ...this.snapshot.history].slice(0, 10),
      });
    }, 650);
    return true;
  };
}
