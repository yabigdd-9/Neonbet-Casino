// Global game search bar with debounce + keyboard support.
import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export default function GameSearch({ onResult, className = "", value: controlledValue, onValueChange }) {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue ?? internalValue;
  function setValue(next) {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
  }
  const [debounced, setDebounced] = useState("");
  const callbackRef = useRef(onResult);
  useEffect(() => {
    callbackRef.current = onResult;
  }, [onResult]);
  const inputRef = useRef(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), 200);
    return () => window.clearTimeout(id);
  }, [value]);

  useEffect(() => {
    callbackRef.current?.(debounced.trim());
  }, [debounced]);

  return (
    <div className={`relative block ${className}`}>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        size={18}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setValue("");
            inputRef.current?.blur();
          }
        }}
        className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 pl-11 pr-12 text-white outline-none focus:border-cyan-300/60"
        placeholder="Search titles, collections or game styles…"
        aria-label="Search games"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl text-slate-400 hover:text-white"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
