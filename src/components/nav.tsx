import Link from "next/link";
import { ClawCruiseLogo } from "./claw-cruise-logo";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/events", label: "Events" },
  { href: "/#faq", label: "FAQ" },
  { href: "/workshops", label: "Workshops" },
  { href: "/docs", label: "Docs" },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-white/30 backdrop-blur-md dark:bg-ink-900/30">
      <div className="container-page flex h-24 items-center justify-between">
        <div className="flex items-center gap-8">
          <ClawCruiseLogo />
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-ink-50"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/builders/login" className="btn-ghost">Log in</Link>
          <Link href="/builders/login" className="btn-lime">Start building</Link>
        </div>
      </div>
    </header>
  );
}
