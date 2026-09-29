import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { CatalogCategory } from "@/data/catalog";
import { SubcategoryCard } from "@/components/SubcategoryCard";

const PREVIEW_COUNT = 6;

/** Jump-link chips to each category section (shared by /browse and the homepage). */
export function BrowseCategoryChips({ categories }: { categories: CatalogCategory[] }) {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {categories.map((c) => (
        <a
          key={c.slug}
          href={`#${c.slug}`}
          className="text-xs px-3 py-1.5 rounded-full border border-foreground/10 bg-foreground/[0.04] text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
        >
          {c.short}
        </a>
      ))}
    </div>
  );
}

/** Category → sub-category card sections, as rendered on /browse. */
export function BrowseCategorySections({ categories }: { categories: CatalogCategory[] }) {
  return (
    <div className="mt-14 space-y-16">
      {categories.map((c) => {
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
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground bg-foreground/[0.06] hover:bg-foreground/[0.12] border border-foreground/10 rounded-full px-4 py-2 transition-colors"
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
  );
}
