// Centralized mock data for Nebius Builders frontend.
// Replace with API calls as the backend lands.

export type EventFormat =
  | "HACKATHON"
  | "MEETUP"
  | "MINI_CONFERENCE"
  | "OFFICE_HOURS";

export type EventState = "LIVE" | "UPCOMING" | "COMPLETED";

export type Event = {
  id: string;
  slug: string;
  title: string;
  format: EventFormat;
  state: EventState;
  startDateTime: string;
  endDateTime?: string;
  city: string;
  venue: string;
  isOnline: boolean;
  cover: string;
  description: string;
  capacity: number;
  registered: number;
  partners: string[];
  prizePool?: string;
  /** External RSVP page (Luma, Eventbrite, etc.). When set, the UI links here instead of an in-app RSVP. */
  rsvpUrl?: string;
};

export type Workshop = {
  slug: string;
  title: string;
  hosts: { name: string; role: string; company: string; avatarUrl?: string }[];
  recordedAt: string;
  durationSeconds: number;
  videoProvider: "ZOOM" | "YOUTUBE" | "MUX";
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  chapters: { startSec: number; title: string }[];
  tags: string[];
  ctaUrl: string;
  ctaLabel: string;
  watchCount: number;
};

export type Plan = {
  name: string;
  price: string;
  cadence: string;
  eventsPerMonth: string;
  blurb: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

export const partners: { name: string; tag?: string }[] = [
  { name: "Anthropic" },
  { name: "AWS" },
  { name: "GitHub" },
  { name: "Nebius", tag: "host" },
  { name: "OpenAI" },
  { name: "Telnyx" },
  { name: "Wordware" },
  { name: "Zep" },
  { name: "Runpod" },
  { name: "Distil Labs" },
  { name: "Moss" },
  { name: "SovrenAI" },
  { name: "Symbiotic AI" },
  { name: "Tavily" },
  { name: "Qdrant" },
  { name: "Tessl" },
  { name: "MotherDuck" },
  { name: "Stripe" },
  { name: "Redis" },
  { name: "IBM Watsonx" },
  { name: "Tandem AI" },
  { name: "Qualcomm" },
  { name: "ClawMax" },
  { name: "OpenMind" },
  { name: "Tremendous" },
  { name: "OpenClaw" },
];

export const events: Event[] = [
  {
    id: "evt_buildership",
    slug: "buildership",
    title: "BuilderShip",
    format: "HACKATHON",
    state: "LIVE",
    startDateTime: "2026-05-08T00:00:00-07:00",
    endDateTime: "2026-05-30T23:59:00-07:00",
    city: "SF",
    venue: "Remote · finals on the bay, May 30",
    isOnline: false,
    cover: "from-accent-sky via-accent-blue to-navy-700",
    description:
      "Three-week remote AI hackathon hosted by Composio and Nebius. Submit by May 28. Top 30 builders earn a boat day on the bay, May 30. Compete for $10k and a DGX Spark.",
    capacity: 30,
    registered: 0,
    partners: ["Composio", "Nebius", "Tavily", "OpenClaw"],
  },
  {
    id: "evt_oh_mon",
    slug: "office-hours-monday-zoom",
    title: "Office Hours · Monday Zoom",
    format: "OFFICE_HOURS",
    state: "UPCOMING",
    startDateTime: "2026-05-11T12:00:00-07:00",
    endDateTime: "2026-05-11T13:00:00-07:00",
    city: "Remote",
    venue: "Online (Zoom)",
    isOnline: true,
    cover: "from-lime-100 via-lime-200 to-lime-300",
    description:
      "One-hour Zoom drop-in with sponsor developer advocates and solution architects. Bring your blockers. Every Monday at noon Pacific through May 30.",
    capacity: 100,
    registered: 32,
    partners: ["Nebius", "Composio", "Tavily"],
  },
  {
    id: "evt_oh_tue",
    slug: "office-hours-tuesday-frontier-tower",
    title: "Office Hours · Tuesday at Frontier Tower",
    format: "OFFICE_HOURS",
    state: "UPCOMING",
    startDateTime: "2026-05-12T12:00:00-07:00",
    endDateTime: "2026-05-12T14:00:00-07:00",
    city: "SF",
    venue: "Frontier Tower, San Francisco",
    isOnline: false,
    cover: "from-navy-300 via-navy-500 to-navy-700",
    description:
      "Two hours of in-person office hours at Frontier Tower. Drop in for whiteboard sessions, code review, and a sandwich. Every Tuesday 12–2pm through May 30.",
    capacity: 40,
    registered: 18,
    partners: ["Nebius", "Composio", "Tavily"],
  },
  {
    id: "evt_oh_wed",
    slug: "office-hours-wednesday-homebrew",
    title: "Office Hours · Wednesday at Homebrew",
    format: "OFFICE_HOURS",
    state: "UPCOMING",
    startDateTime: "2026-05-13T12:00:00-07:00",
    endDateTime: "2026-05-13T14:00:00-07:00",
    city: "SF",
    venue: "Homebrew, San Francisco",
    isOnline: false,
    cover: "from-lime-200 via-lime-300 to-navy-500",
    description:
      "Two hours of in-person office hours at Homebrew. Drop in for whiteboard sessions, code review, and a sandwich. Every Wednesday 12–2pm through May 30.",
    capacity: 30,
    registered: 12,
    partners: ["Nebius", "Composio", "Tavily"],
  },
  {
    id: "evt_oh_thu",
    slug: "office-hours-thursday-frontier-tower",
    title: "Office Hours · Thursday at Frontier Tower",
    format: "OFFICE_HOURS",
    state: "UPCOMING",
    startDateTime: "2026-05-14T12:00:00-07:00",
    endDateTime: "2026-05-14T14:00:00-07:00",
    city: "SF",
    venue: "Frontier Tower, San Francisco",
    isOnline: false,
    cover: "from-navy-300 via-navy-500 to-navy-700",
    description:
      "Two hours of in-person office hours at Frontier Tower. Drop in for whiteboard sessions, code review, and a sandwich. Every Thursday 12–2pm through May 30.",
    capacity: 40,
    registered: 21,
    partners: ["Nebius", "Composio", "Tavily"],
  },
  {
    id: "evt_oh_fri",
    slug: "office-hours-friday-zoom",
    title: "Office Hours · Friday Zoom",
    format: "OFFICE_HOURS",
    state: "UPCOMING",
    startDateTime: "2026-05-15T12:00:00-07:00",
    endDateTime: "2026-05-15T13:00:00-07:00",
    city: "Remote",
    venue: "Online (Zoom)",
    isOnline: true,
    cover: "from-lime-100 via-lime-200 to-lime-300",
    description:
      "One-hour Zoom drop-in with sponsor developer advocates and solution architects. Bring your blockers. Every Friday at noon Pacific through May 30.",
    capacity: 100,
    registered: 27,
    partners: ["Nebius", "Composio", "Tavily"],
  },
  {
    id: "evt_clawcamp_humantech",
    slug: "clawcamp-human-tech",
    title: "ClawCamp @ Human+Tech Week",
    format: "MINI_CONFERENCE",
    state: "UPCOMING",
    startDateTime: "2026-05-11T10:00:00-07:00",
    endDateTime: "2026-05-11T17:00:00-07:00",
    city: "SF",
    venue: "The Hibernia Bank, 1 Jones St, San Francisco, CA",
    isOnline: false,
    cover: "from-lime-200 via-lime-300 to-navy-500",
    description:
      "How OpenClaw and personal agents increase abilities — talks, panels, and a hands-on workshop where you launch your own agent. Doors 10am, programming 10:30am – 5pm.",
    capacity: 250,
    registered: 142,
    partners: ["You.com", "Apify", "Venn.ai", "Cline", "Fetch.ai", "Nebius", "HackerSquad", "STAK Ventures"],
    rsvpUrl: "https://luma.com/clawcamp-human-tech",
  },
  {
    id: "evt_clawcamp_518",
    slug: "clawcamp-5-18",
    title: "ClawCamp Weekly Campfire — Hands-on OpenClaw Meetup",
    format: "MEETUP",
    state: "UPCOMING",
    startDateTime: "2026-05-18T18:00:00-07:00",
    endDateTime: "2026-05-18T20:00:00-07:00",
    city: "SF",
    venue: "Frontier Tower, 9th Floor, 995 Market St, San Francisco, CA",
    isOnline: false,
    cover: "from-navy-300 via-navy-500 to-lime-400",
    description:
      "Weekly hands-on training in agent orchestration, workflows, security, and token optimization. All levels welcome — show up with a laptop.",
    capacity: 80,
    registered: 47,
    partners: ["Nebius", "You.com", "Apify", "Fetch.ai", "ASI:One", "HackerSquad", "STAK Ventures"],
    rsvpUrl: "https://luma.com/clawcamp-5-18",
  },
];

export const workshops: Workshop[] = [
  {
    slug: "running-openclaw-on-nebius",
    title: "Running OpenClaw on Nebius",
    hosts: [
      { name: "Colin Lowenberg", role: "Host", company: "Nebius Builders" },
      { name: "Michal", role: "Solutions Engineer", company: "Nebius" },
    ],
    recordedAt: "2026-04-22T17:00:00+00:00",
    durationSeconds: 60 * 58,
    videoProvider: "ZOOM",
    videoUrl:
      "https://nebius.zoom.us/rec/share/W7W_7xxYZBSGjcHEro0egvt2xhH00z3CIjdcSwuLI0-AZ0sDr7PiYrPJ5WeB_rnC.YsDri-mrKWuiSVj8",
    thumbnailUrl: "",
    description:
      "Colin Lowenberg and Michal from Nebius hosted a webinar demonstrating how to run OpenClaw on Nebius' cloud infrastructure, specifically using Token Factory and Serverless AI services. The presentation covered installing OpenClaw locally and connecting it to Token Factory's API for accessing various open-source language models at lower costs compared to proprietary services like ChatGPT. Michal explained how to deploy OpenClaw to Nebius Serverless using Docker containers, showing the process through a CLI skill that automates the deployment. The session included live demonstrations of configuring different models, setting up sub-agents, and managing security considerations. Participants asked questions about phone number integration, model switching, cost estimation, and deployment from GitHub, with Michal confirming that GitHub deployment is on their roadmap. The webinar concluded with discussions about AI's impact on jobs and recommendations for using Tavily for web search capabilities within OpenClaw.",
    chapters: [
      { startSec: 0, title: "Intro & agenda" },
      { startSec: 180, title: "Install OpenClaw locally" },
      { startSec: 540, title: "Connect to Token Factory" },
      { startSec: 900, title: "Model selection & cost estimation" },
      { startSec: 1380, title: "Configure sub-agents" },
      { startSec: 1860, title: "Deploy to Nebius Serverless via Docker" },
      { startSec: 2280, title: "CLI deploy skill walkthrough" },
      { startSec: 2700, title: "Security considerations" },
      { startSec: 2940, title: "Q&A — phone, GitHub deploy, jobs, Tavily" },
    ],
    tags: ["openclaw", "nebius", "token-factory", "serverless", "deploy", "workshop"],
    ctaUrl: "https://github.com/opencolin/openclaw-deploy",
    ctaLabel: "Run on Nebius →",
    watchCount: 412,
  },
  {
    slug: "token-factory-101",
    title: "Token Factory 101: Inference economics for builders",
    hosts: [{ name: "Anya Kuznetsova", role: "Product", company: "Nebius" }],
    recordedAt: "2026-04-08T16:00:00+00:00",
    durationSeconds: 60 * 32,
    videoProvider: "MUX",
    videoUrl: "#",
    thumbnailUrl: "",
    description:
      "How Token Factory routes requests across open-source models, what the cost curve looks like at scale, and the three patterns we see top builders use to keep their burn flat.",
    chapters: [
      { startSec: 0, title: "What is Token Factory" },
      { startSec: 240, title: "Model catalog walkthrough" },
      { startSec: 720, title: "Cost patterns" },
      { startSec: 1320, title: "Live: switching models in OpenClaw" },
    ],
    tags: ["token-factory", "inference", "cost", "tutorial"],
    ctaUrl: "/ide",
    ctaLabel: "Try it in the IDE →",
    watchCount: 318,
  },
  {
    slug: "composio-connect-ai-agents-250-tools",
    title: "Composio: connect AI agents to 250+ tools in minutes",
    hosts: [{ name: "Composio team", role: "Engineers", company: "Composio" }],
    recordedAt: "2025-04-15T17:00:00+00:00",
    durationSeconds: 60 * 18,
    videoProvider: "YOUTUBE",
    videoUrl: "https://www.youtube.com/watch?v=oVmHJvErnf8",
    thumbnailUrl: "https://img.youtube.com/vi/oVmHJvErnf8/maxresdefault.jpg",
    description:
      "How to wire your agent into Gmail, Slack, GitHub, Linear, Notion, and 250+ other apps without writing OAuth flows or per-tool schemas. Composio handles auth, function schemas, and tool calling — you bring the agent.",
    chapters: [
      { startSec: 0, title: "What Composio is" },
      { startSec: 240, title: "Auth flow per user" },
      { startSec: 600, title: "Tool catalog walkthrough" },
      { startSec: 900, title: "Live: hooking up GitHub + Slack" },
    ],
    tags: ["composio", "tools", "integrations", "agents", "tutorial"],
    ctaUrl: "https://docs.composio.dev/getting-started",
    ctaLabel: "Composio quickstart →",
    watchCount: 287,
  },
  {
    slug: "tavily-agentic-search",
    title: "Agentic search with Tavily",
    hosts: [{ name: "Noah Nefsky", role: "Developer Advocate", company: "Tavily" }],
    recordedAt: "2026-04-04T18:00:00+00:00",
    durationSeconds: 60 * 47,
    videoProvider: "YOUTUBE",
    videoUrl: "https://www.youtube.com/watch?v=WqdhxthHL04",
    thumbnailUrl: "https://img.youtube.com/vi/WqdhxthHL04/maxresdefault.jpg",
    description:
      "Tavily's search and extract APIs are tuned for LLMs — clean ranked passages with citations, and structured extraction from any URL. This walkthrough shows the agent loop pattern: search → read → reason → cite, with sub-second latency tuned for production agent workflows.",
    chapters: [
      { startSec: 0, title: "Why agents need a different search API" },
      { startSec: 360, title: "/search anatomy + ranking" },
      { startSec: 900, title: "/extract for structured pulls" },
      { startSec: 1620, title: "Live: research agent in 50 lines" },
      { startSec: 2400, title: "Citations + grounding patterns" },
    ],
    tags: ["tavily", "search", "extract", "agents", "tutorial"],
    ctaUrl: "https://docs.tavily.com/docs/welcome",
    ctaLabel: "Tavily quickstart →",
    watchCount: 192,
  },
  {
    slug: "contree-fork-and-snapshot",
    title: "Contree fork & snapshot: agent ergonomics",
    hosts: [{ name: "Marek Fischer", role: "Engineer", company: "Nebius" }],
    recordedAt: "2026-03-25T18:00:00+00:00",
    durationSeconds: 60 * 41,
    videoProvider: "MUX",
    videoUrl: "#",
    thumbnailUrl: "",
    description:
      "Why VM-isolated sandboxes with Git-like branching change how AI coding agents explore solutions — and how to wire it into your hackathon workflow.",
    chapters: [
      { startSec: 0, title: "Why branching" },
      { startSec: 360, title: "Snapshot anatomy" },
      { startSec: 900, title: "Demo-from-snapshot pattern" },
      { startSec: 1620, title: "MCP integration" },
    ],
    tags: ["contree", "sandbox", "agents", "tooling"],
    ctaUrl: "https://docs.contree.dev/",
    ctaLabel: "Read the docs →",
    watchCount: 256,
  },
];

export const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "/mo",
    eventsPerMonth: "3 events / month",
    blurb: "Run a small meetup or test the platform.",
    features: ["Streaming", "Basic analytics", "Project view", "Public event page"],
    cta: { label: "Start free", href: "/companies/login" },
  },
  {
    name: "Starter",
    price: "$1,000",
    cadence: "/mo",
    eventsPerMonth: "10 events / month",
    blurb: "Capture content from every event you run.",
    features: ["Everything in Free", "Content recording", "Feedback capture", "Raffle tools"],
    cta: { label: "Choose Starter", href: "/companies/login" },
  },
  {
    name: "Pro",
    price: "$2,000",
    cadence: "/mo",
    eventsPerMonth: "15 events / month",
    blurb: "Most teams pick this — IDE included.",
    features: [
      "Everything in Starter",
      "1,000 IDE workspace minutes",
      "Token Factory integration",
      "Advanced analytics",
      "Nebius CPU Serverless deploy",
    ],
    cta: { label: "Choose Pro", href: "/companies/login" },
    highlight: true,
  },
  {
    name: "Scale",
    price: "$3,500",
    cadence: "/mo",
    eventsPerMonth: "25 events / month",
    blurb: "For DevRel orgs running global programs.",
    features: [
      "Everything in Pro",
      "2,000 IDE workspace minutes",
      "Nebius GPU Serverless (NemoClaw)",
      "White-label event pages",
      "Priority support",
    ],
    cta: { label: "Choose Scale", href: "/companies/login" },
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    eventsPerMonth: "Unlimited",
    blurb: "Dedicated Contree pool, SLAs, on-prem option.",
    features: ["Everything in Scale", "SSO (SAML / OIDC)", "Custom SLAs", "Dedicated Contree pool", "On-prem option"],
    cta: { label: "Talk to us", href: "#contact" },
  },
];

export const liveStats = {
  buildersOnline: 25_482,
  eventsLive: 9,
  workshopMinutesWatched: 184_322,
  partnerCompanies: partners.length,
  projectsShipped: 752,
  eventsRun: 121,
};

export const currentUser = {
  id: "u_colin",
  name: "Colin Lowenberg",
  email: "colin@lowenberg.org",
  phone: null as string | null,
  image:
    "https://lh3.googleusercontent.com/a/ACg8ocKTnbT2BnjWt0ivcEbGHnVBACUTTF1Ma4WwZJOXbNG5UkCTEz9ZsQ=s96-c",
  memberSince: "December 31, 2025",
  linkedInUrl: null as string | null,
  githubUrl: "https://github.com/opencolin",
  discordHandle: null as string | null,
  twitterHandle: null as string | null,
};

export const teamsAsLeader = [
  {
    id: "team_muglife",
    name: "Muglife",
    event: events.find((e) => e.id === "evt_buildership")!,
    invitations: [{ email: "alex@example.com", status: "PENDING" as const }],
    members: [
      { name: "Colin Lowenberg", role: "Lead" },
      { name: "Priya Iyer", role: "Frontend" },
    ],
    project: { name: "Muglife", status: "DRAFT" as const, hasVideo: false },
  },
];

export const teamsAsMember: typeof teamsAsLeader = [];

export const pendingInvitations = [
  {
    id: "inv_1",
    teamName: "Token Brigade",
    eventName: "BuilderShip",
    leaderName: "Marcus Yang",
  },
];

export type ProjectSummary = {
  id: string;
  rank: number;
  name: string;
  team: string;
  description: string;
  technologies: string[];
  partners: string[];
  votes: number;
  demoApproved: boolean;
};

export const eventProjects: ProjectSummary[] = [
  {
    id: "proj_muglife",
    rank: 1,
    name: "Muglife",
    team: "Muglife",
    description: "An OpenClaw-driven coffee-shop concierge agent that books, reorders, and routes loyalty perks across chains.",
    technologies: ["OpenClaw", "Token Factory", "Tavily", "Stripe"],
    partners: ["Nebius", "OpenClaw", "Stripe", "Tavily"],
    votes: 142,
    demoApproved: true,
  },
  {
    id: "proj_quiver",
    rank: 2,
    name: "Quiver",
    team: "Arrow Labs",
    description: "Vector memory benchmarking harness with deterministic replay across MotherDuck and Qdrant.",
    technologies: ["OpenClaw", "MotherDuck", "Qdrant"],
    partners: ["Qdrant", "MotherDuck", "Nebius"],
    votes: 121,
    demoApproved: true,
  },
  {
    id: "proj_orbital",
    rank: 3,
    name: "Orbital",
    team: "Heliotrope",
    description: "Multi-agent ground-station scheduler that ranks burn windows and auto-files FCC paperwork.",
    technologies: ["OpenClaw", "Token Factory", "GLM-5"],
    partners: ["Nebius", "OpenClaw"],
    votes: 98,
    demoApproved: false,
  },
  {
    id: "proj_thunder",
    rank: 4,
    name: "Thunder",
    team: "Sky Patrol",
    description: "Weather-aware power-grid agent that pre-buys hedges before storms hit.",
    technologies: ["OpenClaw", "Token Factory"],
    partners: ["Nebius", "OpenClaw"],
    votes: 87,
    demoApproved: true,
  },
];

export const eventBlasts = [
  {
    id: "blast_1",
    sentAt: "2026-05-06T18:15:00-07:00",
    body: "Pizza is here on the second floor. Sponsor table for Wordware just opened — first 20 builders get an early-access invite.",
  },
  {
    id: "blast_2",
    sentAt: "2026-05-06T16:30:00-07:00",
    body: "Token Factory keys are loaded into your IDE. Default model is GLM-5; switch from the model picker if you need vision.",
  },
];

export const eventPrizes = [
  { title: "Best Use of OpenClaw", value: "$2,500", dollarValue: 2500 },
  { title: "Best Token Factory Build", value: "$1,500", dollarValue: 1500 },
  { title: "Best Demo", value: "$1,000", dollarValue: 1000 },
];

export const eventVolunteerOpportunities = [
  { title: "Check-in Support", category: "Reception", timeSlot: "5:00 PM - 7:00 PM", location: "Lobby", filled: 2, max: 3 },
  { title: "Pizza Captain", category: "Food", timeSlot: "7:00 PM - 8:00 PM", location: "Kitchen", filled: 1, max: 2 },
  { title: "Demo Stage MC", category: "Stage", timeSlot: "9:00 PM - 10:00 PM", location: "Main hall", filled: 1, max: 1 },
];

export const eventSpeakers = [
  { name: "Filip Janik", company: "Wordware", status: "APPROVED" as const, talk: "Planner stacks with sub-agents" },
  { name: "Sara Chen", company: "OpenMind", status: "APPROVED" as const, talk: "OM1 architecture" },
  { name: "Devon Park", company: "Qdrant", status: "INVITED" as const, talk: "Vector memory in production" },
];

// (Event manager nav lives in components/event-manager-shell.tsx and is rendered relative to the active event slug.)

export const docSections = [
  {
    title: "Get started",
    pages: [
      { slug: "quickstart", title: "Quickstart" },
      { slug: "index", title: "Welcome to Nebius Builders" },
    ],
  },
  {
    title: "Builders",
    pages: [
      { slug: "builders/install-openclaw", title: "Install OpenClaw" },
      { slug: "builders/create-a-team", title: "Create a team" },
      { slug: "builders/submit-a-project", title: "Submit a project" },
    ],
  },
  {
    title: "Event managers",
    pages: [
      { slug: "event-managers/create-an-event", title: "Create an event" },
      { slug: "event-managers/host-an-event", title: "Manage an event" },
      { slug: "event-managers/manage-event-managers", title: "Manage event managers" },
      { slug: "event-managers/manage-partner-companies", title: "Manage partner companies" },
      { slug: "event-managers/manage-prizes", title: "Manage prizes" },
      { slug: "event-managers/manage-volunteers", title: "Manage volunteers" },
      { slug: "event-managers/manage-feedback", title: "Manage feedback" },
      { slug: "event-managers/capture-live-demos", title: "Capture live demos" },
      { slug: "event-managers/capture-live-presentations", title: "Capture live presentations" },
      { slug: "event-managers/view-projects", title: "View projects" },
      { slug: "event-managers/send-event-blast", title: "Send event blast" },
      { slug: "event-managers/share-event-link", title: "Share event link" },
      { slug: "event-managers/post-event-summary", title: "Post-event summary" },
    ],
  },
  {
    title: "OpenClaw on Nebius",
    pages: [
      { slug: "openclaw/local-install", title: "Local install" },
      { slug: "openclaw/docker", title: "Docker" },
      { slug: "openclaw/nebius-cpu-serverless", title: "Nebius CPU Serverless" },
      { slug: "openclaw/nebius-gpu-serverless", title: "Nebius GPU Serverless" },
      { slug: "openclaw/token-factory", title: "Token Factory" },
    ],
  },
];

export const testimonial = {
  quote:
    "We rewrote our DevRel motion around Nebius Builders. Real integration telemetry meant our engineers stopped chasing badge scans and started reading code.",
  attribution: "Director of Developer Relations, Contextual AI",
};
