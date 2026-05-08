import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { WorkshopCard } from "@/components/workshop-card";
import { workshops } from "@/lib/data";

const tags = ["All", "openclaw", "nebius", "token-factory", "contree", "tutorial"];

export default function WorkshopsIndex() {
  const [featured, ...rest] = workshops;
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="container-page py-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Workshops</p>
            <h1 className="h-display text-4xl font-bold tracking-tight text-ink-900 md:text-5xl dark:text-ink-50">Watch what shipped. Run it yourself.</h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-600 dark:text-ink-300">Every workshop links to a Contree workspace preconfigured for the lesson. Hit play, then hit your terminal.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((t) => (
                <button key={t} className={t === "All" ? "btn-navy text-xs" : "btn-outline text-xs"}>{t}</button>
              ))}
            </div>
          </div>
        </section>
        <section className="section bg-ink-50 dark:bg-ink-800">
          <div className="container-page">
            <WorkshopCard workshop={featured} featured />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((w) => <WorkshopCard key={w.slug} workshop={w} />)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
