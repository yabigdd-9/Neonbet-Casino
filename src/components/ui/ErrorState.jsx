// Error state with retry.
import React from "react";

export default function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="rounded-[2rem] border border-rose-300/20 bg-rose-400/10 p-8 text-center text-rose-100">
      <p className="text-lg font-black text-white">{title}</p>
      {message && <p className="mt-2 break-words text-sm text-rose-100">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-2xl bg-white/10 px-5 py-3 font-black text-white hover:bg-white/15"
        >
          Try again
        </button>
      )}
    </div>
  );
}
