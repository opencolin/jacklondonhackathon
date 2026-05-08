import Link from "next/link";
import { TopNav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { docSections } from "@/lib/data";
import { notFound } from "next/navigation";

const docContent: Record<string, { title: string; eyebrow: string; body: React.ReactNode }> = {
  quickstart: {
    eyebrow: "Get started",
    title: "Quickstart",
    body: (
      <>
        <p>Three minutes to your first OpenClaw event experience.</p>
        <ol>
          <li><strong>Sign in</strong> at <Link href="/builders/login">/builders/login</Link> with GitHub.</li>
          <li><strong>Pick an event</strong> from the directory and hit <em>Register</em>.</li>
          <li><strong>Open the IDE</strong>. A Contree workspace boots with OpenClaw and your Token Factory key already loaded.</li>
        </ol>
        <pre><code>{`▸ openclaw --version
openclaw 0.9.0
▸ openclaw doctor
✓ TOKEN_FACTORY_API_KEY scoped
✓ contree instance ready
✓ code-server bound to https://ws-7af.builders.nebius.com`}</code></pre>
      </>
    ),
  },
  index: {
    eyebrow: "Get started",
    title: "Welcome to Nebius Builders",
    body: (
      <>
        <p>Nebius Builders is the operating layer for OpenClaw events. It bundles the marketing site, the builder app, the event-manager portal, and a Cloud IDE that ships into Nebius Serverless on one click.</p>
        <p>Two audiences:</p>
        <ul>
          <li><strong>Builders</strong> show up and ship.</li>
          <li><strong>Companies</strong> host events and see real integration telemetry.</li>
        </ul>
      </>
    ),
  },
};

function findPage(slug: string[]) {
  for (const s of docSections) for (const p of s.pages) if (p.slug === slug.join("/")) return { section: s, page: p };
  return null;
}

export default function DocPage({ params }: { params: { slug: string[] } }) {
  const found = findPage(params.slug);
  if (!found) return notFound();
  const slugStr = params.slug.join("/");
  const last = params.slug[params.slug.length - 1];
  const content = docContent[slugStr] ?? docContent[last] ?? {
    eyebrow: found.section.title,
    title: found.page.title,
    body: (
      <>
        <p>This page is under construction. The PRD section that drives this doc lives at <code>/PRD.md</code> in the repo.</p>
        <p>Use the navigation on the left to keep exploring.</p>
      </>
    ),
  };

  return (
    <>
      <TopNav />
      <main className="bg-white dark:bg-ink-900">
        <div className="container-page grid gap-10 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-6 text-sm">
              {docSections.map((s) => (
                <div key={s.title}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">{s.title}</p>
                  <ul className="space-y-1">
                    {s.pages.map((p) => {
                      const active = p.slug === slugStr;
                      return (
                        <li key={p.slug}>
                          <Link
                            href={`/docs/${p.slug}`}
                            className={`block rounded px-2 py-1 ${
                              active
                                ? "bg-navy-700 text-white dark:bg-lime dark:text-navy-700"
                                : "text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-ink-50"
                            }`}
                          >
                            {p.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
          <article className="prose prose-slate max-w-none dark:prose-invert">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">{content.eyebrow}</p>
            <h1 className="h-display text-4xl font-bold tracking-tight text-ink-900 dark:text-ink-50">{content.title}</h1>
            <div className="mt-6 space-y-4 text-ink-800 dark:text-ink-100 [&_strong]:text-ink-900 dark:[&_strong]:text-ink-50 [&_pre]:mt-4 [&_pre]:rounded-card [&_pre]:bg-navy-700 [&_pre]:p-5 [&_pre]:text-sm [&_pre]:text-ink-100 dark:[&_pre]:bg-ink-800 [&_code]:font-mono [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_a]:font-medium [&_a]:text-navy-700 dark:[&_a]:text-lime [&_a:hover]:underline">
              {content.body}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function generateStaticParams() {
  return docSections.flatMap((s) => s.pages.map((p) => ({ slug: p.slug.split("/") })));
}
