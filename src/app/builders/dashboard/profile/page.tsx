import { AppHeader } from "@/components/app-chrome";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeAuth } from "@/server/lib/safe-auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";


const builderNav = [
  { label: "Console", href: "/builders/dashboard" },
  { label: "Schedule", href: "/events" },
  { label: "Teams", href: "/builders/teams" },
  { label: "Workshops", href: "/workshops" },
  { label: "Profile", href: "/builders/dashboard/profile" },
];

export default async function ProfilePage() {
  const session = await safeAuth();
  if (!session?.user) redirect("/builders/login");

  // Fetch the full user record for fields the session doesn't carry (phone, github_url, etc).
  const rows = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  const user = rows[0];

  const name = session.user.name ?? user?.name ?? "Builder";
  const email = session.user.email ?? user?.email ?? "";
  const image = session.user.image ?? user?.image ?? "";
  const initials = (name || email || "?")
    .split(/[ @.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  const phone = user?.phone ?? "";
  const githubUrl = user?.githubUrl ?? "";
  const linkedinUrl = user?.linkedinUrl ?? "";
  const discordId = user?.discordId ?? "";
  const twitterUrl = user?.twitterUrl ?? "";
  const memberSince = user?.memberSince
    ? new Date(user.memberSince).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <>
      <AppHeader links={builderNav} />
      <main className="bg-ink-50 dark:bg-ink-800">
        <section className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="container-page py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Profile</p>
            <h1 className="h-display mt-1 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">Your builder identity</h1>
            <p className="mt-2 text-ink-600 dark:text-ink-300">Visible to teammates, sponsors, and judges. Public on your project pages.</p>
          </div>
        </section>

        <section className="section">
          <div className="container-page grid gap-8 lg:grid-cols-3">
            <div className="card flex flex-col items-center text-center">
              <div className="relative mb-4 inline-flex">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={name} className="h-32 w-32 rounded-full border-4 border-lime object-cover" />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-lime bg-ink-100 text-3xl font-bold text-navy-700 dark:bg-ink-800 dark:text-lime">
                    {initials}
                  </div>
                )}
                <span className="absolute -bottom-1 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-lime text-xs font-bold text-navy-700 dark:border-ink-900">N</span>
              </div>
              <p className="text-base font-semibold text-ink-900 dark:text-ink-50">{name}</p>
              <p className="text-sm text-ink-500 dark:text-ink-400">{email}</p>
              <p className="mt-3 pill-outline">Member since {memberSince}</p>
              <p className="mt-6 text-xs text-ink-500 dark:text-ink-400">Replace your avatar from your OAuth provider — we don't host upload.</p>
            </div>

            <ProfileForm
              name={name}
              email={email}
              initial={{ phone, githubUrl, linkedinUrl, discordId, twitterUrl }}
            />
          </div>
        </section>

        <section className="section bg-white dark:bg-ink-900">
          <div className="container-page">
            <h2 className="h-display text-2xl font-bold text-ink-900 dark:text-ink-50">Preferences</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink-900 dark:text-ink-50">Theme</p>
                  <p className="text-sm text-ink-500 dark:text-ink-400">Light, dark, or system.</p>
                </div>
                <select className="input w-auto"><option>System</option><option>Light</option><option>Dark</option></select>
              </div>
              <div className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink-900 dark:text-ink-50">Allow sponsor follow-up</p>
                  <p className="text-sm text-ink-500 dark:text-ink-400">Set per-project on submit; this is the default.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-ink-700 dark:text-ink-200"><input type="checkbox" defaultChecked className="h-4 w-4 accent-navy-700" />Enabled</label>
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-ink-400 dark:text-ink-500">— end of profile configuration —</p>
            <div className="mt-4 text-center">
              <Link href="/builders/dashboard" className="btn-ghost text-sm">← Back to console</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
