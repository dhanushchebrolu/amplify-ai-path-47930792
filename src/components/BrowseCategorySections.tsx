import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { CatalogCategory } from "@/data/catalog";
import { SubcategoryCard } from "@/components/SubcategoryCard";
import { categoryAccent } from "@/lib/category-accent";
import { cn } from "@/lib/utils";

const PREVIEW_COUNT = 6;

/** Jump-link chips to each category section (shared by /browse and the homepage). */
export function BrowseCategoryChips({ categories }: { categories: CatalogCategory[] }) {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {categories.map((c) => (
        <a key={c.slug} href={`#${c.slug}`} className={cn("chip", categoryAccent(c.slug).className)}>
          <span className="cat-dot" />
          {c.short}
        </a>
      ))}
    </div>
  );
}

/** Category → sub-category card sections, as rendered on /browse. */
export function BrowseCategorySections({ categories }: { categories: CatalogCategory[] }) {
  return (
    <div className="mt-12 sm:mt-14 space-y-14 sm:space-y-20">
      {categories.map((c) => {
        const preview = c.subs.slice(0, PREVIEW_COUNT);
        const hasMore = c.subs.length > PREVIEW_COUNT;
        const totalInCat = c.subs.reduce((a, s) => a + s.tools.length, 0);
        const { className: accent } = categoryAccent(c.slug);
        return (
          <section key={c.slug} id={c.slug} className={cn("scroll-mt-24", accent)}>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-[2rem] sm:text-4xl md:text-[2.75rem] leading-tight text-navy">{c.name}</h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
                  {c.subs.length} sub-categories · {totalInCat} tools
                </p>
              </div>
              <Link
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group inline-flex items-center gap-2 h-11 px-5 rounded-full bg-surface border border-navy/15 text-sm font-semibold text-navy shadow-[0_1px_2px_rgb(16_24_40/0.05)] hover:border-[var(--cat)] hover:text-cat transition-colors"
              >
                View more <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {preview.map((sub) => (
                <SubcategoryCard key={sub.slug} catSlug={c.slug} sub={sub} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-5">
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group text-sm font-medium text-muted-foreground hover:text-cat inline-flex items-center gap-1 transition-colors"
                >
                  View all {c.subs.length} sub-categories <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
