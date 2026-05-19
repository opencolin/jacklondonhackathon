import Link from "next/link";
import { Section, SectionHeader } from "@/components/section";

export function IdePreview() {
  return (
    <Section bg="white">
      <SectionHeader
        eyebrow="Cloud IDE"
        title="Warm OpenClaw workspace. Token Factory loaded. Deploy in one click."
        body="Contree spins a sandboxed VM with code-server and OpenClaw preinstalled. Snapshot at any moment, fork to try a different approach, demo from a known-good state."
      />
      <div className="overflow-hidden rounded-card border border-ink-200 bg-navy-700 shadow-soft">
        <div className="flex items-center justify-between border-b border-navy-600 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-3 text-xs font-mono text-ink-100">muglife · main · agent.ts</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="pill bg-navy-600 text-ink-100">contree · ws-7af</span>
            <span className="pill bg-lime text-navy-700">GLM-5</span>
            <span className="pill-lime">Deploy ▸</span>
          </div>
        </div>
        <div className="grid grid-cols-12 font-mono text-[13px] leading-relaxed">
          <div className="col-span-3 hidden border-r border-navy-600 p-4 text-ink-100 md:block">
            <p className="mb-2 text-xs uppercase tracking-widest text-ink-100/70">Snapshots</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> ready-for-demo</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-lime" /> tavily-wired</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-ink-300" /> baseline</li>
            </ul>
            <p className="mt-6 mb-2 text-xs uppercase tracking-widest text-ink-100/70">Telemetry</p>
            <dl className="grid grid-cols-2 gap-y-1 text-xs">
              <dt className="text-ink-100/70">Cold start</dt><dd>1.42s</dd>
              <dt className="text-ink-100/70">p50 latency</dt><dd>312ms</dd>
              <dt className="text-ink-100/70">TF calls</dt><dd>1,284</dd>
              <dt className="text-ink-100/70">Sub-agents</dt><dd>3</dd>
            </dl>
          </div>
          <pre className="col-span-12 overflow-x-auto p-5 text-ink-100 md:col-span-9"><code>{`import { OpenClaw } from "@openclaw/sdk";
import { tavily } from "tavily";

const claw = new OpenClaw({
  baseURL: process.env.TOKEN_FACTORY_URL,
  apiKey: process.env.TOKEN_FACTORY_API_KEY,
  model: "zai-org/GLM-5",
});

claw.tools.add("search", tavily({ apiKey: process.env.TAVILY_API_KEY }));
claw.subAgent("router").route(["latte-runner", "loyalty-bot", "checkout"]);

export default async function handler(req, res) {
  const out = await claw.run(req.body.message);
  res.json(out);
}`}</code></pre>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy-600 px-4 py-3 text-xs text-ink-100">
          <span className="font-mono">▸ openclaw deploy --target nebius-cpu</span>
          <span className="flex items-center gap-2"><span className="live-dot" /> Deployed · https://muglife.serverless.nebius.com</span>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href="https://github.com/opencolin/openclaw-deploy" className="btn-navy">openclaw-deploy on GitHub ↗</Link>
      </div>
    </Section>
  );
}
