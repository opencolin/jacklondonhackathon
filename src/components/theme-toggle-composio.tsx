"use client";

import { useEffect, useState } from "react";

export function ThemeToggleComposio() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(localStorage.getItem("bs-theme-composio") === "1");
  }, []);

  function flip(next: boolean) {
    if (next) {
      localStorage.setItem("bs-theme-composio", "1");
      document.documentElement.setAttribute("data-theme", "composio");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.removeItem("bs-theme-composio");
      document.documentElement.removeAttribute("data-theme");
    }
    setActive(next);
  }

  return (
    <p className="text-xs text-ink-500 dark:text-ink-400">
      Theme:{" "}
      <button
        type="button"
        onClick={() => flip(false)}
        className={
          !active
            ? "font-medium text-ink-700 underline underline-offset-2 dark:text-ink-200"
            : "hover:underline"
        }
      >
        default
      </button>
      <span aria-hidden> · </span>
      <button
        type="button"
        onClick={() => flip(true)}
        className={
          active
            ? "font-medium text-ink-700 underline underline-offset-2 dark:text-ink-200"
            : "hover:underline"
        }
      >
        composio
      </button>
    </p>
  );
}
