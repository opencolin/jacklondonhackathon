import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";

type DocLink = { label: string; href: string; external?: boolean };

type SponsorDoc = {
  slug: string;
  name: string;
  role: string;
  blurb: string;
  highlights: string[];
  primary: DocLink;
  links: DocLink[];
};

const sponsorDocs: SponsorDoc[] = [
  {
    slug: "token-factory",
    name: "Nebius Token Factory",
    role: "Managed inference for open-weight models",
    blurb:
      "OpenAI-compatible API in front of dozens of open-weight models — Llama, Qwen, DeepSeek, Mistral, and more. Drop your existing OpenAI client at the Nebius base URL, change the API key, ship.",
    highlights: [
      "OpenAI-compatible /v1/chat/completions and /v1/embeddings",
      "Streaming, tool use, and JSON mode supported",
      "Per-builder credits — keys auto-rotate post-event",
      "Base URL: https://api.studio.nebius.ai/v1",
    ],
    primary: { label: "Quickstart", href: "https://docs.nebius.com/studio/inference/quickstart", external: true },
    links: [
      { label: "API reference", href: "https://docs.nebius.com/studio/inference/api-reference", external: true },
      { label: "Available models", href: "https://docs.nebius.com/studio/inference/models", external: true },
      { label: "Internal note: Token Factory", href: "/docs/openclaw/token-factory" },
    ],
  },
  {
    slug: "nebius-ai-cloud",
    name: "Nebius AI Cloud",
    role: "GPU compute & serverless deploy",
    blurb:
      "Bare-metal H100/H200/A100 instances when you need raw training power, plus Nebius Serverless for one-command deploys of agents and APIs. Builders get GPU credits scoped to the event.",
    highlights: [
      "GPU instances from H100 to A100 — pay by the minute",
      "Nebius Serverless for stateless agent deploys",
      "Object storage + managed Postgres in the same region",
      "Console at console.nebius.com",
    ],
    primary: { label: "Nebius docs home", href: "https://docs.nebius.com", external: true },
    links: [
      { label: "Compute quickstart", href: "https://docs.nebius.com/compute/quickstart", external: true },
      { label: "Serverless containers", href: "https://docs.nebius.com/serverless-containers", external: true },
      { label: "Object storage", href: "https://docs.nebius.com/storage/object-storage", external: true },
      { label: "Internal: deploy guide", href: "/docs/openclaw/nebius-cpu-serverless" },
    ],
  },
  {
    slug: "composio",
    name: "Composio",
    role: "Agent tools & integrations",
    blurb:
      "One SDK to plug your agent into 250+ apps — Gmail, Slack, GitHub, Linear, Notion, Stripe — with auth, function schemas, and tool-calling already wired. Bring your agent, ship the workflow.",
    highlights: [
      "250+ pre-wired tools, auth handled per-user",
      "Tool schemas in OpenAI / Anthropic / function-calling shape",
      "Triggers and webhooks for event-driven agents",
      "Python and TypeScript SDKs",
    ],
    primary: { label: "Composio quickstart", href: "https://docs.composio.dev/getting-started", external: true },
    links: [
      { label: "Tool catalog", href: "https://app.composio.dev/apps", external: true },
      { label: "Triggers", href: "https://docs.composio.dev/patterns/triggers", external: true },
      { label: "GitHub", href: "https://github.com/ComposioHQ/composio", external: true },
    ],
  },
  {
    slug: "tavily",
    name: "Tavily",
    role: "Search & web extraction for agents",
    blurb:
      "Real-time search API tuned for LLMs — clean, ranked, citable results plus structured web extraction. The retrieval layer for any agent that needs to know what just happened on the internet.",
    highlights: [
      "/search returns ranked passages with citations",
      "/extract pulls clean structured content from a URL",
      "Sub-second latency, designed for agent loops",
      "Free credits across the build period",
    ],
    primary: { label: "Tavily quickstart", href: "https://docs.tavily.com/docs/welcome", external: true },
    links: [
      { label: "REST API reference", href: "https://docs.tavily.com/docs/rest-api/api-reference", external: true },
      { label: "Python SDK", href: "https://docs.tavily.com/docs/python-sdk/tavily-search/getting-started", external: true },
      { label: "JS SDK", href: "https://docs.tavily.com/docs/javascript-sdk/tavily-search/getting-started", external: true },
    ],
  },
  {
    slug: "openclaw",
    name: "OpenClaw",
    role: "Open agent runtime",
    blurb:
      "Open-source agent framework for building, deploying, and operating agents on your terms. Local-first install, ships to Nebius Serverless in one command, plays nicely with Composio and Tavily out of the box.",
    highlights: [
      "Local install — one binary, no cloud dependency",
      "Skill packs for Claude Code workflows",
      "Sandboxed tool execution by default",
      "Deploys to Nebius Serverless with one command",
    ],
    primary: { label: "openclaw-deploy on GitHub", href: "https://github.com/opencolin/openclaw-deploy", external: true },
    links: [
      { label: "README", href: "https://github.com/opencolin/openclaw-deploy#readme", external: true },
      { label: "Internal: install OpenClaw", href: "/docs/builders/install-openclaw" },
      { label: "Internal: local install", href: "/docs/openclaw/local-install" },
      { label: "Internal: Docker", href: "/docs/openclaw/docker" },
    ],
  },
];

export default function DocsHome() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="container-page py-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Docs</p>
            <h1 className="h-display text-4xl font-bold tracking-tight text-ink-900 md:text-5xl dark:text-ink-50">Wire up the stack.</h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-600 dark:text-ink-300">
              Five SDKs, three weeks. Quickstarts and official docs for every sponsor — Composio, Nebius Token Factory,
              Nebius AI Cloud, Tavily, OpenClaw — plus the BuilderShip platform docs.
            </p>
            <div className="mt-6 max-w-xl">
              <input type="search" className="input" placeholder="Search docs… (⌘K)" />
            </div>
            <nav className="mt-6 flex flex-wrap gap-2 text-sm">
              {sponsorDocs.map((s) => (
                <a
                  key={s.slug}
                  href={`#${s.slug}`}
                  className="rounded-pill border border-ink-200 bg-white px-3 py-1.5 font-medium text-ink-700 hover:border-navy-700 hover:text-navy-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-lime dark:hover:text-lime"
                >
                  {s.name}
                </a>
              ))}
            </nav>
          </div>
        </section>

        <section className="bg-ink-50 py-16 dark:bg-ink-800 sm:py-20">
          <div className="container-page space-y-10">
            {sponsorDocs.map((s) => (
              <article
                key={s.slug}
                id={s.slug}
                className="card scroll-mt-24 grid gap-6 lg:grid-cols-[1.4fr_1fr]"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-navy-700 dark:text-lime">{s.role}</p>
                  <h2 className="h-display mt-2 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">{s.name}</h2>
                  <p className="mt-3 text-base leading-relaxed text-ink-700 dark:text-ink-200">{s.blurb}</p>
                  <ul className="mt-5 grid gap-2 text-sm">
                    {s.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3 text-ink-800 dark:text-ink-100">
                        <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-lime text-navy-700">
                          <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                            <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-card border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
                  <Link
                    href={s.primary.href}
                    className="btn-navy w-full text-sm"
                    target={s.primary.external ? "_blank" : undefined}
                    rel={s.primary.external ? "noreferrer" : undefined}
                  >
                    {s.primary.label} {s.primary.external ? "↗" : "→"}
                  </Link>
                  <ul className="mt-4 space-y-2 text-sm">
                    {s.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="block rounded-md px-2 py-1 text-ink-700 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-ink-50"
                          target={l.external ? "_blank" : undefined}
                          rel={l.external ? "noreferrer" : undefined}
                        >
                          → {l.label} {l.external ? "↗" : ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
