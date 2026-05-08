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
      <span className="relative inline-block h-12 w-[180px] md:h-[72px] md:w-[260px]">
        {/* Composio (default) — visible unless [data-theme="composio"] is missing on <html>. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/buildership-wordmark-composio.svg"
          alt="BuilderShip"
          className="absolute inset-0 h-full w-full object-contain bs-logo-composio"
        />
        {/* Nebius — visible only when the data-theme attribute is absent. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/buildership-wordmark-nebius.svg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-contain bs-logo-nebius"
        />
      </span>
      {subtitle ? (
        <span className="text-sm font-semibold tracking-tight text-navy-700 dark:text-ink-50">
          {subtitle}
        </span>
      ) : null}
    </Link>
  );
}
