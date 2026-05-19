import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { WorkshopCard } from "@/components/workshop-card";
import { workshops } from "@/lib/data";

const tags = ["All", "nebius", "aicloud", "token-factory", "composio", "tavily", "openclaw", "agents", "tutorial"];

export default function WorkshopsIndex({
  searchParams,
}: {
  searchParams?: { tag?: string };
}) {
  const activeTag = searchParams?.tag ?? "All";
  const filtered =
    activeTag === "All"
      ? workshops
      : workshops.filter((w) => w.tags.includes(activeTag));
  const [featured, ...rest] = filtered;
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="container-page py-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Workshops</p>
            <h1 className="h-display text-4xl font-bold tracking-tight text-ink-900 md:text-5xl dark:text-ink-50">Watch what shipped. Run it yourself.</h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-600 dark:text-ink-300">Sponsor-led workshops on Nebius Token Factory, OpenClaw, Composio, and Tavily. Hit play, then hit your terminal.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link
                  key={t}
                  href={t === "All" ? "/workshops" : `/workshops?tag=${t}`}
                  className={t === activeTag ? "btn-navy text-xs" : "btn-outline text-xs"}
                  scroll={false}
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="section bg-ink-50 dark:bg-ink-800">
          <div className="container-page">
            {featured ? (
              <>
                <WorkshopCard workshop={featured} featured />
                {rest.length > 0 ? (
                  <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rest.map((w) => <WorkshopCard key={w.slug} workshop={w} />)}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-ink-500 dark:text-ink-400">No workshops with that tag yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
