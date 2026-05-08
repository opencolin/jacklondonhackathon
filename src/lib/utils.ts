import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Event timezone. CodeCruise + every office-hours session run on Pacific
// time, so we pin formatters here. Server-rendered output ignores Vercel's
// UTC default; client output ignores the user's local TZ. Both render Pacific.
const EVENT_TZ = "America/Los_Angeles";

export function formatDate(d: Date | string, opts: Intl.DateTimeFormatOptions = {}) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: EVENT_TZ,
    ...opts,
  }).format(date);
}

export function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: EVENT_TZ,
  }).format(date);
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function pluralize(n: number, singular: string, plural?: string) {
  return `${n.toLocaleString()} ${n === 1 ? singular : plural ?? singular + "s"}`;
}
