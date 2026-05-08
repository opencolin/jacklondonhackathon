"use client";

import { useEffect, useState } from "react";

export function ThemeToggleComposio() {
  // Composio is the default — `bs-theme-default` is the opt-out flag.
  const [composio, setComposio] = useState(true);

  useEffect(() => {
    setComposio(localStorage.getItem("bs-theme-default") !== "1");
  }, []);

  function flip(useComposio: boolean) {
    if (useComposio) {
      localStorage.removeItem("bs-theme-default");
      document.documentElement.setAttribute("data-theme", "composio");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("bs-theme-default", "1");
      document.documentElement.removeAttribute("data-theme");
    }
    setComposio(useComposio);
  }

  return (
    <p className="text-xs text-ink-500 dark:text-ink-400">
      Theme:{" "}
      <button
        type="button"
        onClick={() => flip(false)}
        className={
          !composio
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
          composio
            ? "font-medium text-ink-700 underline underline-offset-2 dark:text-ink-200"
            : "hover:underline"
        }
      >
        composio
      </button>
    </p>
  );
}
