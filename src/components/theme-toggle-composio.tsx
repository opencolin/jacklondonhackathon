"use client";

import { useEffect, useState } from "react";

export function ThemeToggleComposio() {
  // Orange is the default theme — `bs-theme-green` is the opt-out flag
  // (renders the legacy green/lime/navy theme).
  const [orange, setOrange] = useState(true);

  useEffect(() => {
    setOrange(localStorage.getItem("bs-theme-green") !== "1");
  }, []);

  function flip(useOrange: boolean) {
    if (useOrange) {
      localStorage.removeItem("bs-theme-green");
      document.documentElement.setAttribute("data-theme", "orange");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("bs-theme-green", "1");
      document.documentElement.removeAttribute("data-theme");
    }
    setOrange(useOrange);
  }

  return (
    <p className="text-xs text-ink-500 dark:text-ink-400">
      Theme:{" "}
      <button
        type="button"
        onClick={() => flip(false)}
        className={
          !orange
            ? "font-medium text-ink-700 underline underline-offset-2 dark:text-ink-200"
            : "hover:underline"
        }
      >
        green
      </button>
      <span aria-hidden> · </span>
      <button
        type="button"
        onClick={() => flip(true)}
        className={
          orange
            ? "font-medium text-ink-700 underline underline-offset-2 dark:text-ink-200"
            : "hover:underline"
        }
      >
        orange
      </button>
    </p>
  );
}
