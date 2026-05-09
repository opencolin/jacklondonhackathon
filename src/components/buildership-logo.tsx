import Link from "next/link";

export function BuilderShipLogo({
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
      aria-label={`BuilderShip ${subtitle}`.trim()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/buildership-lockup.svg"
        alt="BuilderShip"
        className="h-10 w-auto md:h-14"
      />
      {subtitle ? (
        <span className="text-sm font-semibold tracking-tight text-navy-700 dark:text-ink-50">
          {subtitle}
        </span>
      ) : null}
    </Link>
  );
}
