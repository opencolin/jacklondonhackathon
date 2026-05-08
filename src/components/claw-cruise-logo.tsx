import Link from "next/link";

export function ClawCruiseLogo({
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
      aria-label={`ClawCruise ${subtitle}`.trim()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/clawcruise.png"
        alt="ClawCruise"
        width={140}
        height={48}
        className="h-9 w-auto"
      />
      {subtitle ? (
        <span className="text-sm font-semibold tracking-tight text-navy-700 dark:text-ink-50">
          {subtitle}
        </span>
      ) : null}
    </Link>
  );
}
