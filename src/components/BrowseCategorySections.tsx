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
        const { className: accent } = categoryAccent(c.slug);
        return (
          <section key={c.slug} id={c.slug} className={cn("scroll-mt-24", accent)}>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="min-w-0">
                <span className="eyebrow cat-eyebrow">{c.name}</span>
                <h2 className="mt-3 font-display text-[2.1rem] sm:text-5xl md:text-[3.25rem] leading-[1.05] tracking-[-0.02em] text-navy">{c.name}</h2>
                <p className="mt-2.5 text-base sm:text-lg text-[#475467]">
                  <span className="font-semibold text-navy tabular-nums">{c.subs.length}</span> sub-categories
                  <span className="mx-2.5 text-[#98A2B3]">·</span>
                  <span className="font-semibold text-navy tabular-nums">{totalInCat}</span> tools
                </p>
              </div>
              <Link
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group inline-flex items-center gap-2 text-base font-semibold text-cat"
              >
                View category <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {preview.map((sub) => (
                <SubcategoryCard key={sub.slug} catSlug={c.slug} sub={sub} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 pt-6 border-t border-border">
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group inline-flex items-center gap-2 text-base font-semibold text-cat"
                >
                  View all {c.subs.length} sub-categories <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
