import { buildSpin, playArcade } from "./gameEngine";
import { DEMO_START_CENTS } from "../config/demoBonus";

// One controller belongs to the app, not to a game modal. Closing a player never loses a settlement.
export class RoundController {
  listeners = new Set();
  timer = null;
  snapshot = { cents: DEMO_START_CENTS, wageredCents: 0, busy: false, round: null };
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
    const cents = Math.round(stake * 100);
    if (
      this.snapshot.busy ||
      !Number.isSafeInteger(cents) ||
      cents <= 0 ||
      Math.abs(cents / 100 - stake) > 1e-9 ||
      this.snapshot.cents < cents
    )
      return false;
    const result = game.id ? playArcade(game.id, target) : buildSpin(game);
    const winCents = Math.round(cents * result.multiplier);
    if (!Number.isSafeInteger(winCents) || winCents < 0) return false;
    const id = crypto.randomUUID();
    const round = {
      ...result,
      id,
      gameId: game.id || game.title,
      stakeCents: cents,
      winCents,
      win: winCents / 100,
    };
    this.publish({
      cents: this.snapshot.cents - cents,
      wageredCents: this.snapshot.wageredCents + cents,
      busy: true,
    });
    this.timer = setTimeout(() => {
      this.timer = null;
      this.publish({ cents: this.snapshot.cents + winCents, busy: false, round });
    }, 650);
    return true;
  };
}
