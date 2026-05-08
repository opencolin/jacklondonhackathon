import Link from "next/link";
import { liveStats } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200 bg-white">
      <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
      <div className="absolute -right-20 -top-20 h-[420px] w-[420px] rounded-full bg-lime/40 blur-3xl" aria-hidden />
      <div className="container-page relative pt-20 pb-24 sm:pt-28 sm:pb-28 lg:pt-36">
        <span className="pill-lime mb-6">
          <span className="live-dot" />
          {liveStats.eventsLive} events live · {liveStats.buildersOnline.toLocaleString()} builders online
        </span>
        <h1 className="h-display max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl lg:text-7xl">
          The operating layer for{" "}
          <span className="relative inline-block">
            <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-lime/80" aria-hidden />
            <span className="relative">OpenClaw events</span>
          </span>
          .
        </h1>
        <p className="mt-7 max-w-2xl text-xl text-ink-600">
          Builders ship. Sponsors see real integration telemetry. Workshops on tap. Powered by Token Factory and Contree.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/builders/login" className="btn-lime px-6 py-3.5 text-sm">Ship it →</Link>
          <Link href="/companies/login" className="btn-outline px-6 py-3.5 text-sm">Host an event</Link>
          <Link href="/workshops/running-openclaw-on-nebius" className="btn-ghost text-sm">Watch the OpenClaw on Nebius workshop →</Link>
        </div>
        <dl className="mt-16 grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
          {[
            ["Ranked builders", liveStats.buildersOnline.toLocaleString()],
            ["Events run", liveStats.eventsRun.toLocaleString()],
            ["Projects shipped", liveStats.projectsShipped.toLocaleString()],
            ["Partner companies", liveStats.partnerCompanies.toString()],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase tracking-widest text-ink-500">{label}</dt>
              <dd className="mt-2 text-3xl font-bold text-navy-700">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
