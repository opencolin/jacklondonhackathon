"use client";

import { useState } from "react";

export function EventFilters({
  cities,
  formats,
}: {
  cities: readonly string[];
  formats: readonly string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8 flex flex-wrap items-start gap-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="btn-outline text-xs"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 6h18M7 12h10M11 18h2" />
        </svg>
        {open ? "Hide filters" : "Filters"}
      </button>
      {open ? (
        <>
          <div className="card flex w-full items-center gap-2 p-2 sm:w-auto">
            <span className="px-2 text-xs font-medium uppercase tracking-widest text-ink-500 dark:text-ink-400">City</span>
            {cities.map((c) => (
              <button key={c} className={c === "All" ? "btn-navy text-xs" : "btn-ghost text-xs"}>
                {c}
              </button>
            ))}
          </div>
          <div className="card flex w-full items-center gap-2 p-2 sm:w-auto">
            <span className="px-2 text-xs font-medium uppercase tracking-widest text-ink-500 dark:text-ink-400">Format</span>
            {formats.map((f) => (
              <button key={f} className={f === "All" ? "btn-navy text-xs" : "btn-ghost text-xs"}>
                {f}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
