"use client";

import { signIn } from "next-auth/react";
import { useState, type FormEvent, type ReactNode } from "react";

type OAuthProvider = "github" | "google" | "linkedin";

export function ProviderButton({
  provider,
  callbackUrl,
  className,
  children,
}: {
  provider: OAuthProvider;
  callbackUrl: string;
  className?: string;
  children: ReactNode;
}) {
  const [pending, setPending] = useState(false);

  function handleClick() {
    setPending(true);
    void signIn(provider, { callbackUrl });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={className}
    >
      {children}
    </button>
  );
}

export function MagicLinkForm({ callbackUrl }: { callbackUrl: string }) {
  const [pending, setPending] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    if (!email) return;
    setPending(true);
    void signIn("resend", { email, callbackUrl });
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div>
        <label className="label" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="you@company.com"
        />
      </div>
      <button type="submit" disabled={pending} className="btn-lime w-full">
        {pending ? "Sending…" : "Send magic link →"}
      </button>
    </form>
  );
}
