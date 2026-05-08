import Link from "next/link";
import { AppHeader } from "./app-chrome";
import { events } from "@/lib/data";

const sections = [
  { label: "Overview", path: "" },
  { label: "Projects", path: "/projects" },
  { label: "Speakers", path: "/speakers" },
  { label: "Partners", path: "/partners" },
  { label: "Prizes", path: "/prizes" },
  { label: "Volunteers", path: "/volunteers" },
  { label: "Live demos", path: "/live-demos" },
  { label: "Feedback", path: "/feedback" },
  { label: "Blasts", path: "/blasts" },
  { label: "Photos", path: "/photos" },
  { label: "Settings", path: "/settings" },
];

export function EventManagerShell({ eventSlug, active, children }: { eventSlug: string; active: string; children: React.ReactNode }) {
  const event = events.find((e) => e.slug === eventSlug);
  const companyNav = [
    { label: "Dashboard", href: "/companies/dashboard" },
    { label: "Events", href: "/companies/dashboard" },
    { label: "DevRel toolkit", href: "/companies/dashboard#devrel" },
    { label: "Plan", href: "/companies/dashboard#plan" },
  ];
  return (
    <>
      <AppHeader links={companyNav} />
      <div className="border-b border-ink-200 bg-white">
        <div className="container-page py-6">
          <Link href="/companies/dashboard" className="text-sm text-ink-500 hover:text-ink-700">← All events</Link>
          <div className="mt-2 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="h-display text-2xl font-bold tracking-tight">{event?.title ?? "Event"}</h1>
              <p className="text-sm text-ink-500">{event?.venue} · {event?.format.replace("_", " ").toLowerCase()}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/events/${event?.slug}`} className="btn-outline text-sm">Public page</Link>
              <button className="btn-navy text-sm">Share event link</button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b border-ink-200 bg-white">
        <div className="container-page flex gap-1 overflow-x-auto py-2">
          {sections.map((s) => (
            <Link
              key={s.label}
              href={`/events/${eventSlug}/manage${s.path}`}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${active === s.label ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100"}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
      <main className="bg-ink-50">{children}</main>
    </>
  );
}
