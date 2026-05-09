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
      <span className="relative inline-block h-10 md:h-14" style={{ aspectRatio: "1240 / 240" }}>
        {/* Composio variant — visible by default (data-theme="composio" is the default). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/buildership-lockup-composio.svg"
          alt="BuilderShip"
          className="absolute inset-0 h-full w-full object-contain bs-lockup-composio"
        />
        {/* Nebius variant — visible only when no data-theme attribute is set. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/buildership-lockup-nebius.svg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-contain bs-lockup-nebius"
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
