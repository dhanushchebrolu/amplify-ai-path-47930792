import { createFileRoute, Link } from "@tanstack/react-router";
import { catalog, catalogTotalTools } from "@/data/catalog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SubcategoryCard } from "@/components/SubcategoryCard";
import { ArrowRight } from "lucide-react";

const PREVIEW_COUNT = 6;

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse All AI Tools by Category — NeuroHub" },
      { name: "description", content: `Explore ${catalogTotalTools()}+ AI tools across ${catalog.length} categories and 130+ sub-categories. The complete directory.` },
      { property: "og:title", content: "Browse All AI Tools by Category — NeuroHub" },
      { property: "og:description", content: "The complete AI directory — categories, sub-categories, and curated tools." },
      { property: "og:url", content: "/browse" },
    ],
    links: [{ rel: "canonical", href: "/browse" }],
  }),
  component: Browse,
});

function Browse() {
  const total = catalogTotalTools();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-20 w-full">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        <h1 className="font-display text-5xl md:text-6xl mt-3">Browse all AI tools</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          {total}+ curated tools across {catalog.length} categories. Pick a sub-category to dive deeper.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {catalog.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
            >
              {c.short}
            </a>
          ))}
        </div>

        <div className="mt-14 space-y-16">
          {catalog.map((c) => {
            const preview = c.subs.slice(0, PREVIEW_COUNT);
            const hasMore = c.subs.length > PREVIEW_COUNT;
            const totalInCat = c.subs.reduce((a, s) => a + s.tools.length, 0);
            return (
              <section key={c.slug} id={c.slug} className="scroll-mt-24">
                <div className="flex items-end justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="font-display text-3xl md:text-4xl">{c.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {c.subs.length} sub-categories · {totalInCat} tools
                    </p>
                  </div>
                  <Link
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-full px-4 py-2 transition-colors"
                  >
                    View more <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {preview.map((sub) => (
                    <SubcategoryCard key={sub.slug} catSlug={c.slug} sub={sub} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-5">
                    <Link
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      View all {c.subs.length} sub-categories <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
