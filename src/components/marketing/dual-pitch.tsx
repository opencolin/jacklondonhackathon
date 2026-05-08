import Link from "next/link";
import { Section } from "@/components/section";

export function DualPitch() {
  return (
    <Section bg="white">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card flex flex-col gap-5 p-10">
          <span className="pill-lime self-start">For builders</span>
          <h3 className="h-display text-3xl font-bold tracking-tight">A league for shippers.</h3>
          <p className="text-ink-600">
            Live events every week. OpenClaw preinstalled and Token Factory keys ready in the terminal.
            Ranked standings by what you ship, not who you know.
          </p>
          <ul className="mt-2 grid gap-2 text-sm text-ink-700">
            {[
              "Workshops with Nebius engineers, recorded and indexed",
              "Snapshot before you demo — never blow up on stage",
              "Auto-generated post-event summary for your portfolio",
            ].map((s) => (
              <li key={s} className="flex gap-2"><span className="text-lime-600">●</span>{s}</li>
            ))}
          </ul>
          <Link href="/builders/login" className="btn-navy mt-4 self-start">Enter the league →</Link>
        </div>
        <div className="card flex flex-col gap-5 bg-navy-700 p-10 text-white hover:border-navy-600">
          <span className="pill-lime self-start">For businesses</span>
          <h3 className="h-display text-3xl font-bold tracking-tight">Stop chasing developers.</h3>
          <p className="text-ink-100">
            Real integration telemetry replaces badge scans. See which builders called your SDK, what model they used,
            and what they shipped. Turnkey events: venue, catering, judging, and capture handled.
          </p>
          <ul className="mt-2 grid gap-2 text-sm text-ink-100">
            {[
              "Per-project SDK call counts and latency",
              "AI-graded feedback you can export to CSV",
              "White-label event pages on Scale",
            ].map((s) => (
              <li key={s} className="flex gap-2"><span className="text-lime">●</span>{s}</li>
            ))}
          </ul>
          <Link href="#contact" className="btn-lime mt-4 self-start">Talk to us →</Link>
        </div>
      </div>
    </Section>
  );
}
