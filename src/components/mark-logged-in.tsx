"use client";

import { useEffect } from "react";

const STORAGE_KEY = "cc-logged-in";

export function MarkLoggedIn() {
  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) !== "true") {
      window.localStorage.setItem(STORAGE_KEY, "true");
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: "true" }),
      );
    }
  }, []);
  return null;
}
