import Link from "next/link";
import type { Metadata } from "next";
import { TopNav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Section, SectionHeader } from "@/components/section";

export const metadata: Metadata = {
  title: "Sponsors only — BuilderShip",
  description: "Venue partners for BuilderShip finals day. Internal preview.",
  robots: { index: false, follow: false, nocache: true },
};

const venues = [
  {
    name: "Dragon Lady",
    role: "Bay crossing · sunset cruise · floating workshop",
    blurb:
      "80-foot motor yacht docked at the Jack London Square marina. Five staterooms, hot tub on the top deck, and a salon big enough to host the cruise crowd. Morning bay crossing from South Beach, sunset networking cruise, and hacking space when she's docked.",
    href: "https://jerrysfaeries.com/toi-toi-toi/",
    cta: "Boat listing",
    image: "/boat/rainbow-cruising.jpg",
    imageAlt: "Dragon Lady cruising on the bay with rainbow flag flying",
  },
  {
    name: "Plank",
    role: "Hackathon HQ · lunch · arcade · bowling",
    blurb:
      "Two-floor restaurant and event space steps from the marina. Indoor tables, a covered heated patio, arcade rooms, and a bowling alley — all yours for the day. Outside cable run for our own Starlink confirmed.",
    href: "https://www.plankoakland.com/",
    cta: "plankoakland.com",
    secondary: {
      label: "2025 event guide (PDF)",
      href: "https://www.plankoakland.com/wp-content/uploads/2025/11/Plank-Event-Guide-2025-interactive.pdf",
    },
    image: "/venues/plank/hub-bar-bowling.jpg",
    imageAlt: "Plank's hub bar and bowling lanes with screens overhead",
  },
  {
    name: "Bicycle Coffee",
    role: "Coffee tickets · Jack London Square stroll",
    blurb:
      "Oakland-roasted coffee a short walk from Plank. Builders get redeemable tickets, an excuse to stretch, and a chance to actually see Jack London Square between rounds of hacking.",
    href: "https://www.bicyclecoffeeco.com/",
    cta: "bicyclecoffeeco.com",
    image: "/venues/bicycle/hero.jpg",
    imageAlt: "Bicycle Coffee branded coffee bag",
  },
  {
    name: "Farmhouse Kitchen Thai",
    role: "Dinner · presentations",
    blurb:
      "Award-winning Thai restaurant in Jack London Square. Where we sit down after the sunset cruise for a real dinner and project presentations on the screens — chef-driven food, family-style tables, room for fifty.",
    href: "https://farmhousethai.com/oakland",
    cta: "farmhousethai.com/oakland",
    image: "/venues/farmhouse/hero.jpg",
    imageAlt: "Farmhouse Kitchen Thai feast on banana leaves — lobster, fried chicken, blue rice",
  },
] as const;

export default function SponsorsOnlyPage() {
  return (
    <>
      <TopNav />
      <main>
        <Section bg="tint">
          <SectionHeader
            eyebrow="Venue partners"
            title="Local Jack London Square businesses. The best spots right on the waterfront."
            body="The wedge of this hackathon is the place. Every venue is walking distance from the dock — and every one of them is on the program."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {venues.map((v) => (
              <div key={v.name} className="card flex h-full flex-col overflow-hidden p-0">
                <img
                  src={v.image}
                  alt={v.imageAlt}
                  className="aspect-[16/9] w-full object-cover"
                  loading="lazy"
                />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="h-display text-2xl font-bold text-ink-900 dark:text-ink-50">{v.name}</h3>
                    <span className="pill-ink whitespace-nowrap">{v.role.split("·")[0].trim()}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{v.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{v.blurb}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    <Link href={v.href} className="btn-outline text-xs" target="_blank" rel="noreferrer">
                      {v.cta} ↗
                    </Link>
                    {"secondary" in v && v.secondary ? (
                      <Link
                        href={v.secondary.href}
                        className="btn-ghost text-xs"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {v.secondary.label} ↗
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
