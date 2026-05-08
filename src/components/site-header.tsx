"use client";

import { useEffect, useState } from "react";
import { TopNav } from "./nav";
import { AppHeader } from "./app-chrome";

const builderNav = [
  { label: "Console", href: "/builders/dashboard" },
  { label: "Events", href: "/events" },
  { label: "Teams", href: "/builders/teams" },
  { label: "Workshops", href: "/workshops" },
  { label: "Profile", href: "/builders/dashboard/profile" },
];

const STORAGE_KEY = "cc-logged-in";

export function SiteHeader() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLoggedIn(window.localStorage.getItem(STORAGE_KEY) === "true");
    setMounted(true);

    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setLoggedIn(e.newValue === "true");
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (mounted && loggedIn) {
    return <AppHeader links={builderNav} />;
  }
  return <TopNav />;
}
