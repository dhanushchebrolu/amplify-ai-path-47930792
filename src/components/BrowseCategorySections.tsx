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
    <div className="mt-14 space-y-16 sm:space-y-20">
      {categories.map((c) => {
        const preview = c.subs.slice(0, PREVIEW_COUNT);
        const hasMore = c.subs.length > PREVIEW_COUNT;
        const totalInCat = c.subs.reduce((a, s) => a + s.tools.length, 0);
        const { className: accent, icon: Icon } = categoryAccent(c.slug);
        return (
          <section key={c.slug} id={c.slug} className={cn("scroll-mt-24", accent)}>
            <div className="flex items-end justify-between flex-wrap gap-4 pb-5 border-b border-border">
              <div className="flex items-start gap-4 min-w-0">
                <span className="hidden sm:grid shrink-0 place-items-center w-12 h-12 rounded-xl bg-cat-soft text-cat ring-1 ring-[color-mix(in_oklab,var(--cat)_22%,transparent)]">
                  <Icon className="w-6 h-6" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-[1.75rem] sm:text-3xl md:text-4xl leading-tight text-navy">{c.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
                    <span className="cat-dot" />
                    <span className="font-semibold text-navy tabular-nums">{c.subs.length}</span> sub-categories
                    <span className="text-border">•</span>
                    <span className="font-semibold text-navy tabular-nums">{totalInCat}</span> tools
                  </p>
                </div>
              </div>
              <Link
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-cat"
              >
                View category <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
