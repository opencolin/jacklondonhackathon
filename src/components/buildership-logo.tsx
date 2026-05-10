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
        <ComposioLockup className="absolute inset-0 h-full w-full bs-lockup-orange" />
        <NebiusLockup
          className="absolute inset-0 h-full w-full bs-lockup-green"
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

// Auto-traced yacht silhouette (right-half bow). Imported from
// public/brand/buildership-mark.svg so the inline lockup matches the
// standalone mark file.
const YACHT_PATH_D =
  "M80 2090 c0 -6 7 -13 15 -16 12 -5 13 -10 4 -20 -17 -20 -49 -17 -76 8 l-23 21 0 -156 c0 -154 0 -156 23 -159 37 -5 40 -174 2 -184 l-25 -6 0 -619 0 -619 1133 -3 1132 -2 -1132 -3 -1133 -2 0 -165 0 -165 1440 0 c792 0 1440 2 1440 4 0 2 -23 52 -51 112 -29 60 -60 132 -70 159 l-17 50 251 5 252 6 -252 2 -253 2 26 73 c29 81 179 387 225 459 27 41 51 62 122 104 37 23 42 32 23 53 -18 20 -17 22 27 82 39 52 45 65 36 82 -7 13 -10 87 -8 210 3 146 1 191 -8 194 -7 3 -13 -2 -13 -10 0 -8 -31 -26 -77 -44 -91 -35 -121 -83 -51 -82 18 1 54 -9 81 -20 l47 -22 0 -119 0 -118 -47 -6 c-86 -11 -507 -46 -559 -46 -38 0 -58 6 -83 24 -31 23 -41 25 -128 22 -74 -3 -96 -1 -100 10 -6 16 -71 14 -81 -3 -4 -5 -28 -13 -53 -16 -78 -10 -99 -22 -99 -57 0 -22 -5 -30 -17 -30 -10 0 -99 -7 -198 -15 -99 -8 -225 -17 -280 -20 l-100 -4 94 14 c52 8 96 17 99 20 3 3 -35 58 -85 122 l-90 118 -48 3 c-40 3 -45 5 -30 16 15 11 11 21 -44 113 -71 117 -71 117 -31 133 84 35 -11 42 -170 14 l-85 -16 -34 39 c-62 71 -149 190 -153 208 -3 20 17 28 105 40 51 7 61 21 22 31 -41 10 -33 44 10 44 l35 0 0 80 0 80 -105 0 c-119 0 -112 6 -117 -102 -3 -49 0 -59 17 -67 17 -8 14 -10 -17 -10 l-38 -1 -1 93 c-1 61 -4 84 -9 67 -8 -24 -8 -24 -9 -2 -1 20 -21 33 -21 13 0 -6 -12 -6 -32 0 -107 30 -216 -38 -149 -92 36 -29 22 -89 -19 -89 -33 0 -36 9 -21 73 5 20 5 37 1 37 -5 0 -12 -25 -15 -55 l-7 -55 -46 0 -45 0 7 95 c10 127 -9 125 -21 -2 l-10 -98 -2 98 c-1 79 -4 97 -16 97 -11 0 -15 -11 -15 -39 0 -54 -11 -131 -20 -131 -21 0 -70 91 -70 129 0 23 -4 41 -10 41 -5 0 -10 -13 -10 -30 0 -19 -5 -30 -14 -30 -22 0 -28 16 -11 30 27 23 15 30 -50 30 -38 0 -65 -4 -65 -10z m814 -381 c72 -86 74 -99 14 -99 -26 0 -158 143 -158 171 0 44 78 5 144 -72z m-519 -19 l0 -85 -30 -6 c-16 -4 -78 -7 -137 -8 -125 -1 -121 -4 -116 109 l3 65 35 6 c19 4 82 6 140 5 l105 -1 0 -85z m381 9 c80 -96 78 -100 -46 -97 l-85 3 -9 72 c-16 136 38 144 140 22z m-191 -14 l0 -80 -38 -3 c-55 -5 -67 10 -67 82 0 74 11 88 65 84 l40 -3 0 -80z m421 -261 c21 -6 52 -49 42 -59 -11 -11 -272 -25 -282 -15 -22 22 7 65 49 71 54 8 165 10 191 3z m122 -246 c5 -7 12 -33 13 -58 l4 -45 -87 -3 -88 -3 0 55 c0 62 1 63 91 65 34 1 61 -4 67 -11z m-304 -59 c8 -72 2 -81 -50 -77 l-39 3 -5 58 c-6 67 1 77 51 77 l36 0 7 -61z m-266 -22 l3 -68 -43 3 -43 3 -8 53 c-12 74 -6 84 45 80 l43 0 0 -68z";

function YachtMark({
  badgeFill,
  detailColor,
  clipId,
}: {
  badgeFill: string;
  detailColor: string;
  clipId: string;
}) {
  return (
    <g>
      <rect width="96" height="96" rx="19" fill={badgeFill} />
      <g clipPath={`url(#${clipId})`}>
        {/* Auto-traced yacht silhouette */}
        <svg
          x="-3"
          y="14"
          width="92"
          height="60"
          viewBox="0 0 324.5 210"
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            transform="translate(0,210.104538) scale(0.1,-0.1)"
            fill={detailColor}
            stroke="none"
          >
            <path d={YACHT_PATH_D} />
          </g>
        </svg>
        {/* Three layers of scalloped waves */}
        <path
          d="M 0 78 q 4 -3 8 0 q 4 -3 8 0 q 4 -3 8 0 q 4 -3 8 0 q 4 -3 8 0 q 4 -3 8 0 q 4 -3 8 0 q 4 -3 8 0 q 4 -3 8 0 q 4 -3 8 0 q 4 -3 8 0 q 4 -3 8 0"
          fill="none"
          stroke={detailColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M 0 85 q 6 -4 12 0 q 6 -4 12 0 q 6 -4 12 0 q 6 -4 12 0 q 6 -4 12 0 q 6 -4 12 0 q 6 -4 12 0 q 6 -4 12 0"
          fill="none"
          stroke={detailColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 0 92 q 8 -5 16 0 q 8 -5 16 0 q 8 -5 16 0 q 8 -5 16 0 q 8 -5 16 0 q 8 -5 16 0"
          fill="none"
          stroke={detailColor}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </g>
    </g>
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
          <stop offset="0%" stopColor="#FFA37A" />
          <stop offset="55%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#C44A1A" />
        </linearGradient>
        <linearGradient id="cShip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFC4A3" />
          <stop offset="55%" stopColor="#FFA37A" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>
        <linearGradient id="cBadge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFC4A3" />
          <stop offset="55%" stopColor="#FFA37A" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>
        <clipPath id="cMarkClip">
          <rect width="96" height="96" rx="19" />
        </clipPath>
      </defs>
      <g transform="translate(40, 45) scale(1.5625)">
        <YachtMark badgeFill="url(#cBadge)" detailColor="#0a1929" clipId="cMarkClip" />
      </g>
      <text
        x="220"
        y="170"
        textAnchor="start"
        fontFamily="'Trade Winds', 'Pacifico', 'Brush Script MT', cursive"
        fontSize="108"
        fontWeight="400"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeMiterlimit="2"
        paintOrder="stroke"
      >
        <tspan fill="url(#cBuilder)">Builder</tspan>
        <tspan fill="url(#cShip)">Ship</tspan>
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
        <clipPath id="nMarkClip">
          <rect width="96" height="96" rx="19" />
        </clipPath>
      </defs>
      <g transform="translate(40, 45) scale(1.5625)">
        <YachtMark badgeFill="url(#nBadge)" detailColor="#E0FF4F" clipId="nMarkClip" />
      </g>
      <text
        x="220"
        y="170"
        textAnchor="start"
        fontFamily="'Trade Winds', 'Pacifico', 'Brush Script MT', cursive"
        fontSize="108"
        fontWeight="400"
        strokeLinejoin="round"
        strokeMiterlimit="2"
        paintOrder="stroke"
      >
        <tspan fill="url(#nBuilder)" stroke="#E0FF4F" strokeWidth="5">Builder</tspan>
        <tspan fill="url(#nShip)" stroke="#052B42" strokeWidth="5">Ship</tspan>
      </text>
    </svg>
  );
}
