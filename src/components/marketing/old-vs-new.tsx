import { Section, SectionHeader } from "@/components/section";

const rows = [
  { axis: "How a sponsor sees ROI", old: "Badge scans, post-event guesses", neu: "Per-project SDK call counts, model usage, deploy events" },
  { axis: "What builders bring", old: "Their laptop, half-set-up SDKs", neu: "Nothing — Token Factory keys and SDKs ready on click" },
  { axis: "Demo capture", old: "A friend's iPhone footage", neu: "Wireless base station — webcam + screen + post-production" },
  { axis: "Feedback quality", old: "Survey forms few people fill out", neu: "AI-graded feedback with LLM-score and AI-detection metrics" },
  { axis: "Post-event content", old: "A blog post months later", neu: "Auto-generated public recap with projects, demos, prize winners" },
];

export function OldVsNew() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Developer marketing, rewritten"
        title="The old GTM is a badge scan."
        body="Live events with the SDK preloaded, real-time feedback, attributed leads."
      />
      <div className="overflow-hidden rounded-card border border-ink-200 bg-white">
        <div className="grid grid-cols-12 border-b border-ink-200 bg-ink-50 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-ink-500">
          <div className="col-span-4">Axis</div>
          <div className="col-span-4">Old GTM</div>
          <div className="col-span-4">Nebius Builders</div>
        </div>
        {rows.map((r) => (
          <div key={r.axis} className="grid grid-cols-12 items-start gap-3 border-b border-ink-200 px-6 py-5 text-sm last:border-b-0">
            <div className="col-span-4 font-medium text-ink-900">{r.axis}</div>
            <div className="col-span-4 text-ink-500">{r.old}</div>
            <div className="col-span-4 text-ink-900"><span className="pill-lime mr-2">New</span>{r.neu}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
