"use client";

import { useEffect, useRef, useState } from "react";

export type SearchSuggestion = { id: string; label: string; detail?: string };

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  onSelectSuggestion?: (id: string) => void;
};

export default function SearchBar({
  value,
  onChange,
  placeholder,
  suggestions,
  onSelectSuggestion,
}: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const visible = open && value.trim() !== "" && (suggestions?.length ?? 0) > 0;

  return (
    <div className="relative" ref={containerRef}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink/40"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? "Search in menu"}
        className="w-full rounded-full border border-maroon/20 bg-white/60 py-2.5 pr-4 pl-9 text-sm text-ink placeholder:text-ink/40 focus:border-maroon focus:outline-none"
      />

      {visible && (
        <ul className="absolute top-full right-0 left-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-maroon/15 bg-white shadow-lg">
          {suggestions!.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSelectSuggestion?.(suggestion.id);
                }}
                className="flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-maroon/5"
              >
                <span className="min-w-0 truncate text-sm text-ink">{suggestion.label}</span>
                {suggestion.detail && (
                  <span className="shrink-0 text-xs font-medium text-maroon">{suggestion.detail}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
