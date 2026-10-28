import { useEffect, useRef, useState } from "react";

// Original synthesized feedback; off by default, no downloads or autoplay.
export function useGameSound() {
  const context = useRef(null);
  const [enabled, setEnabled] = useState(() => {
    try {
      return window.localStorage.getItem("neonbet:sound") === "on";
    } catch {
      return false;
    }
  });
  const available =
    typeof window !== "undefined" && Boolean(window.AudioContext || window.webkitAudioContext);
  useEffect(
    () => () => {
      context.current?.close().catch(() => {});
    },
    [],
  );
  function tone(force = false) {
    if ((!enabled && !force) || !available) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      const ctx = context.current || (context.current = new Audio());
      if (ctx.state === "suspended") void ctx.resume().catch(() => {});
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    } catch {
      /* Audio failure must never affect a game round. */
    }
  }
  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      window.localStorage.setItem("neonbet:sound", next ? "on" : "off");
    } catch {
      /* optional preference */
    }
    if (next) tone(true);
  }
  return { enabled, available, toggle, play: tone };
}
