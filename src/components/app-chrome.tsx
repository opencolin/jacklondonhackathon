import Link from "next/link";
import { ClawCruiseLogo } from "./claw-cruise-logo";
import { ThemeToggle } from "./theme-toggle";
import { ShareButton } from "./share-button";
import { SignOutButton } from "./sign-out-button";

export function AppHeader({ links }: { links: { label: string; href: string }[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur dark:border-ink-800 dark:bg-ink-900/85">
      <div className="container-page flex h-16 items-center justify-between">
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
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ShareButton />
          <SignOutButton />
          <button className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pl-1 pr-3 text-sm text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-lime text-xs font-bold text-navy-700">CL</span>
            Colin
          </button>
        </div>
      </div>
    </header>
  );
}
