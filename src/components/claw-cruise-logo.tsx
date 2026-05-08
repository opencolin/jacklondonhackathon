"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LOGOS = [
  { src: "/brand/clawcruise-red.png", alt: "ClawCruise" },
  { src: "/brand/agenthack-red.png", alt: "AgentHack" },
  { src: "/brand/clawcruise-blue.png", alt: "ClawCruise" },
  { src: "/brand/agenthack-blue.png", alt: "AgentHack" },
] as const;

const INTERVAL_MS = 5000;

export function ClawCruiseLogo({
  subtitle = "",
  href = "/",
}: {
  subtitle?: string;
  href?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % LOGOS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const logo = LOGOS[index];

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3"
      aria-label={`${logo.alt} ${subtitle}`.trim()}
    >
      <span className="relative inline-block h-9 w-[140px]">
        {LOGOS.map((l, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={l.src}
            src={l.src}
            alt={i === index ? l.alt : ""}
            aria-hidden={i !== index}
            className={`absolute inset-0 h-full w-auto object-contain transition-opacity duration-500 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </span>
      {subtitle ? (
        <span className="text-sm font-semibold tracking-tight text-navy-700 dark:text-ink-50">
          {subtitle}
        </span>
      ) : null}
    </Link>
  );
}
