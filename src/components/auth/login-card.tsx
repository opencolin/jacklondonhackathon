import Link from "next/link";
import { ClawCruiseLogo } from "@/components/claw-cruise-logo";
import {
  MagicLinkForm,
  ProviderButton,
} from "@/components/auth/provider-button";

export function LoginCard({
  flavor,
  title,
  subtitle,
  redirect,
}: {
  flavor: "builder" | "company";
  title: string;
  subtitle: string;
  redirect: string;
}) {
  return (
    <main className="min-h-screen bg-ink-50 dark:bg-ink-800">
      <div className="container-page flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-4">
            <ClawCruiseLogo />
            <span className="pill-lime">{flavor === "builder" ? "Builder access" : "Sponsor access"}</span>
          </div>
          <div className="card p-8">
            <h1 className="h-display text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50">{title}</h1>
            <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{subtitle}</p>
            <div className="mt-6 grid gap-3">
              <ProviderButton provider="github" callbackUrl={redirect} className="btn-navy w-full">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.7.9 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.8 1 .8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3"/></svg>
                Continue with GitHub
              </ProviderButton>
              <ProviderButton provider="google" callbackUrl={redirect} className="btn-outline w-full">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 01-2.2 3.3v2.7h3.5c2-1.9 3.3-4.6 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7a6.6 6.6 0 01-9.9-3.5H2.2v2.8A11 11 0 0012 23z"/><path fill="#FBBC05" d="M6.1 14.1A6.5 6.5 0 015.7 12c0-.7.1-1.4.4-2.1V7.1H2.2a11 11 0 000 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 002.2 7.1L6.1 9.9c1-2.7 3.4-4.5 6-4.5z"/></svg>
                Continue with Google
              </ProviderButton>
              <ProviderButton provider="linkedin" callbackUrl={redirect} className="btn-outline w-full">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17A1.5 1.5 0 0022 20.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.7a1.7 1.7 0 110-3.4 1.7 1.7 0 010 3.4zM19 19h-3v-4.7c0-1.1-.4-2-1.5-2-1 0-1.5.7-1.7 1.4V19h-3v-9h3v1.2A3 3 0 0115 9.6c2.2 0 3.9 1.4 3.9 4.5V19z"/></svg>
                Continue with LinkedIn
              </ProviderButton>
            </div>
            <div className="my-6 flex items-center gap-3 text-xs text-ink-400 dark:text-ink-500">
              <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />OR
              <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
            </div>
            <MagicLinkForm callbackUrl={redirect} />
            <p className="mt-6 text-xs text-ink-500 dark:text-ink-400">
              By continuing you agree to our terms. Same-email accounts across providers auto-merge.
            </p>
          </div>
          <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
            {flavor === "builder" ? (
              <>Sponsoring the event? <Link className="text-navy-700 underline-offset-4 hover:underline dark:text-lime" href="/companies/login">Switch to sponsor sign-in →</Link></>
            ) : (
              <>Building? <Link className="text-navy-700 underline-offset-4 hover:underline dark:text-lime" href="/builders/login">Switch to builder sign-in →</Link></>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
