// Global game search bar with debounce + keyboard support.
import React, { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X as XIcon } from "lucide-react";

interface GameSearchProps {
  onResult?: (query: string) => void;
  className?: string;
}

export default function GameSearch({ onResult, className = "" }: GameSearchProps) {
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), 200);
    return () => window.clearTimeout(id);
  }, [value]);

  useEffect(() => {
    onResult?.(debounced.trim());
  }, [debounced, onResult]);

  return (
    <div className={`relative block ${className}`}>
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
        className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 pl-11 pr-10 text-white outline-none focus:border-cyan-300/60"
        placeholder="Search games, providers, jackpots..."
        aria-label="Search games"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-white"
          aria-label="Clear search"
        >
          <XIcon size={16} />
        </button>
      )}
    </div>
  );
}
