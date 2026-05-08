"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  function handleClick() {
    void signOut({ callbackUrl: "/" });
  }
  return (
    <button type="button" onClick={handleClick} className="btn-ghost text-sm">
      Sign out
    </button>
  );
}
