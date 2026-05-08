import { AppHeader } from "@/components/app-chrome";
import { currentUser } from "@/lib/data";
import Link from "next/link";

const builderNav = [
  { label: "Console", href: "/builders/dashboard" },
  { label: "Office hours", href: "/#office-hours" },
  { label: "Teams", href: "/builders/teams" },
  { label: "Workshops", href: "/workshops" },
  { label: "Profile", href: "/builders/dashboard/profile" },
];

export default function ProfilePage() {
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentUser.image} alt={currentUser.name} className="h-32 w-32 rounded-full border-4 border-lime object-cover" />
                <span className="absolute -bottom-1 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-lime text-xs font-bold text-navy-700">N</span>
              </div>
              <p className="text-base font-semibold">{currentUser.name}</p>
              <p className="text-sm text-ink-500 dark:text-ink-400">{currentUser.email}</p>
              <p className="mt-3 pill-outline">Member since {currentUser.memberSince}</p>
              <p className="mt-6 text-xs text-ink-500 dark:text-ink-400">Replace your avatar from your OAuth provider — we don't host upload.</p>
            </div>

            <div className="card lg:col-span-2">
              <h2 className="text-lg font-semibold">Identity</h2>
              <p className="text-sm text-ink-500 dark:text-ink-400">Read-only fields are pulled from your OAuth provider.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Name</label>
                  <p className="rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-900 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50">{currentUser.name}</p>
                </div>
                <div>
                  <label className="label">Email</label>
                  <p className="rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-900 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50">{currentUser.email}</p>
                </div>
                <div>
                  <label className="label" htmlFor="phone">Phone</label>
                  <input id="phone" className="input" placeholder="(optional)" defaultValue={currentUser.phone ?? ""} />
                </div>
                <div>
                  <label className="label" htmlFor="github">GitHub</label>
                  <input id="github" className="input" defaultValue={currentUser.githubUrl ?? ""} />
                </div>
                <div>
                  <label className="label" htmlFor="linkedin">LinkedIn</label>
                  <input id="linkedin" className="input" placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="label" htmlFor="discord">Discord handle</label>
                  <input id="discord" className="input" placeholder="username" />
                </div>
                <div>
                  <label className="label" htmlFor="twitter">X / Twitter</label>
                  <input id="twitter" className="input" placeholder="@handle" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button className="btn-outline">Cancel</button>
                <button className="btn-lime">Save changes</button>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-white dark:bg-ink-900">
          <div className="container-page">
            <h2 className="h-display text-2xl font-bold text-ink-900 dark:text-ink-50">Preferences</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold">Theme</p>
                  <p className="text-sm text-ink-500 dark:text-ink-400">Light, dark, or system.</p>
                </div>
                <select className="input w-auto"><option>System</option><option>Light</option><option>Dark</option></select>
              </div>
              <div className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold">Allow sponsor follow-up</p>
                  <p className="text-sm text-ink-500 dark:text-ink-400">Set per-project on submit; this is the default.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2"><input type="checkbox" defaultChecked className="h-4 w-4 accent-navy-700" />Enabled</label>
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
