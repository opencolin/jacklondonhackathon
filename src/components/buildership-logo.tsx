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
      <span
        className="relative inline-block h-10 md:h-14"
        style={{ aspectRatio: "1240 / 240" }}
      >
        <ComposioLockup className="absolute inset-0 h-full w-full bs-lockup-composio" />
        <NebiusLockup
          className="absolute inset-0 h-full w-full bs-lockup-nebius"
          aria-hidden
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

function ComposioLockup({
  className,
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1240 240"
      role="img"
      aria-label="BuilderShip"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="cBuilder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#51A2FF" />
          <stop offset="55%" stopColor="#0089FF" />
          <stop offset="100%" stopColor="#0007CD" />
        </linearGradient>
        <linearGradient id="cShip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7FE9FF" />
          <stop offset="55%" stopColor="#51A2FF" />
          <stop offset="100%" stopColor="#0089FF" />
        </linearGradient>
        <linearGradient id="cBadge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7FE9FF" />
          <stop offset="55%" stopColor="#51A2FF" />
          <stop offset="100%" stopColor="#0089FF" />
        </linearGradient>
      </defs>
      <g transform="translate(40, 50) scale(1.5625)">
        <rect
          width="96"
          height="96"
          rx="19"
          fill="url(#cBadge)"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <line x1="48" y1="17" x2="48" y2="63" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path d="M 51 22 L 51 58 L 76 58 Z" fill="#fff" />
        <path d="M 45 30 L 45 58 L 27 58 Z" fill="#fff" opacity="0.92" />
        <path d="M 14 63 Q 19 80, 35 80 L 61 80 Q 77 80, 82 63 Z" fill="#fff" />
        <path
          d="M 12 86 Q 27 82, 41 86 T 66 86 T 86 86"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <text
        x="220"
        y="170"
        textAnchor="start"
        fontFamily="'Cinzel', 'Trajan Pro', 'Times New Roman', serif"
        fontSize="108"
        fontWeight="700"
        letterSpacing="2"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeMiterlimit="2"
        paintOrder="stroke"
      >
        <tspan fill="url(#cBuilder)">BUILDER</tspan>
        <tspan fill="url(#cShip)">SHIP</tspan>
      </text>
    </svg>
  );
}

function NebiusLockup({
  className,
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1240 240"
      role="img"
      aria-label="BuilderShip"
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="nBuilder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E3F5C" />
          <stop offset="55%" stopColor="#073149" />
          <stop offset="100%" stopColor="#052B42" />
        </linearGradient>
        <linearGradient id="nShip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFFF92" />
          <stop offset="55%" stopColor="#E0FF4F" />
          <stop offset="100%" stopColor="#D6F73A" />
        </linearGradient>
        <linearGradient id="nBadge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E3F5C" />
          <stop offset="100%" stopColor="#052B42" />
        </linearGradient>
      </defs>
      <g transform="translate(40, 50) scale(1.5625)">
        <rect width="96" height="96" rx="19" fill="url(#nBadge)" />
        <line x1="48" y1="17" x2="48" y2="63" stroke="#E0FF4F" strokeWidth="3" strokeLinecap="round" />
        <path d="M 51 22 L 51 58 L 76 58 Z" fill="#E0FF4F" />
        <path d="M 45 30 L 45 58 L 27 58 Z" fill="#E0FF4F" opacity="0.92" />
        <path d="M 14 63 Q 19 80, 35 80 L 61 80 Q 77 80, 82 63 Z" fill="#E0FF4F" />
        <path
          d="M 12 86 Q 27 82, 41 86 T 66 86 T 86 86"
          fill="none"
          stroke="#E0FF4F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <text
        x="220"
        y="170"
        textAnchor="start"
        fontFamily="'Cinzel', 'Trajan Pro', 'Times New Roman', serif"
        fontSize="108"
        fontWeight="700"
        letterSpacing="2"
        strokeLinejoin="round"
        strokeMiterlimit="2"
        paintOrder="stroke"
      >
        <tspan fill="url(#nBuilder)" stroke="#E0FF4F" strokeWidth="5">BUILDER</tspan>
        <tspan fill="url(#nShip)" stroke="#052B42" strokeWidth="5">SHIP</tspan>
      </text>
    </svg>
  );
}
