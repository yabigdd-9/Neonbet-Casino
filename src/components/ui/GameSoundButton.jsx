import React from "react";
import { Volume2, VolumeX } from "lucide-react";
export default function GameSoundButton({ sound }) {
  return (
    <button
      type="button"
      onClick={sound.toggle}
      disabled={!sound.available}
      aria-pressed={sound.enabled}
      className="mt-3 flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-300 disabled:opacity-50"
    >
      {sound.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      {!sound.available ? "Sound unavailable" : sound.enabled ? "Sound on" : "Sound off"}
    </button>
  );
}
