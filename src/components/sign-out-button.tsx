"use client";

const STORAGE_KEY = "cc-logged-in";

export function SignOutButton() {
  function handleClick() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEY, newValue: null }),
    );
    window.location.href = "/";
  }
  return (
    <button type="button" onClick={handleClick} className="btn-ghost text-sm">
      Sign out
    </button>
  );
}
