import Link from "next/link";

export function CodeCruiseLogo({
  subtitle = "",
  href = "/",
}: {
  subtitle?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3"
      aria-label={`CodeCruise ${subtitle}`.trim()}
    >
      <span className="inline-flex items-center rounded-pill bg-lime px-3.5 py-1.5 text-sm font-extrabold tracking-tight text-navy-700">
        Code
        <span aria-hidden className="mx-1 font-mono text-base font-bold text-navy-700/55">
          ~
        </span>
        Cruise
      </span>
      {subtitle ? (
        <span className="text-sm font-semibold tracking-tight text-navy-700 dark:text-ink-50">
          {subtitle}
        </span>
      ) : null}
    </Link>
  );
}
