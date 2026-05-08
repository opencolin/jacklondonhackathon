import Link from "next/link";
import { BuilderShipLogo } from "./buildership-logo";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/events", label: "Events" },
      { href: "/workshops", label: "Workshops" },
      { href: "/ide", label: "Cloud IDE" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Builders",
    links: [
      { href: "/builders/login", label: "Log in" },
      { href: "/docs/builders/install-openclaw", label: "Install OpenClaw" },
      { href: "/docs/builders/create-a-team", label: "Create a team" },
      { href: "/docs/builders/submit-a-project", label: "Submit a project" },
    ],
  },
  {
    title: "Businesses",
    links: [
      { href: "/companies/login", label: "Host an event" },
      { href: "/pricing", label: "Pricing" },
      { href: "/docs/event-managers/create-an-event", label: "Create an event" },
      { href: "#contact", label: "Talk to us" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/docs/openclaw/token-factory", label: "Token Factory" },
      { href: "https://github.com/opencolin/openclaw-deploy", label: "openclaw-deploy" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/about#careers", label: "Careers" },
      { href: "/about#privacy", label: "Privacy" },
      { href: "#contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="container-page py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2 space-y-4">
            <BuilderShipLogo />
            <p className="max-w-xs text-sm text-ink-600 dark:text-ink-300">
              The operating layer for OpenClaw developer events. Built on Nebius.
            </p>
            <p className="text-sm text-ink-500 dark:text-ink-400">San Francisco · Remote · Accepting Q3 bookings</p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ink-700 hover:text-ink-900 dark:text-ink-200 dark:hover:text-ink-50">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ink-200 pt-6 md:flex-row md:items-center dark:border-ink-800">
          <p className="text-xs text-ink-500 dark:text-ink-400">© 2026 Nebius B.V. — Builders is a Nebius product. All rights reserved.</p>
          <p className="text-xs text-ink-500 dark:text-ink-400">Response time &lt; 24 hours · builders@nebius.com</p>
        </div>
      </div>
    </footer>
  );
}
