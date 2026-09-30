import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { CatalogCategory } from "@/data/catalog";
import { CatalogLogo } from "@/components/CatalogLogo";
import { categoryAccent } from "@/lib/category-accent";
import { cn } from "@/lib/utils";

const SUB_PREVIEW = 6;
const SUB_PREVIEW_MOBILE = 4;
const LOGO_PREVIEW = 4;

/** Homepage category card: accent icon, counts, logo stack and a sub-category list. */
export function CategoryPanel({ category }: { category: CatalogCategory }) {
  const { className: accent, icon: Icon } = categoryAccent(category.slug);
  const tools = category.subs.flatMap((s) => s.tools);
  const subs = category.subs.slice(0, SUB_PREVIEW);
  const moreSubs = category.subs.length - subs.length;

  return (
    <article id={category.slug} className={cn("cat-panel group flex flex-col p-5 sm:p-6 scroll-mt-24", accent)}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-lg bg-cat-soft text-cat ring-1 ring-[color-mix(in_oklab,var(--cat)_22%,transparent)]">
          <Icon className="w-5 h-5" strokeWidth={1.8} />
        </span>
        <div className="logo-stack flex items-center" aria-hidden>
          {tools.slice(0, LOGO_PREVIEW).map((t, i) => (
            <span key={`${t.name}-${i}`} className="rounded-full ring-2 ring-white shadow-sm" style={{ zIndex: LOGO_PREVIEW - i }}>
              <CatalogLogo name={t.name} website={t.website} size={30} rounded="full" className="shadow-none ring-0" />
            </span>
          ))}
        </div>
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-tight text-navy leading-snug">
        <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-cat transition-colors">
          {category.name}
        </Link>
      </h3>
      <p className="mt-1 text-[13px] text-muted-foreground">
        <span className="font-semibold text-navy tabular-nums">{tools.length}</span> tools
        <span className="mx-1.5 text-border">•</span>
        <span className="font-semibold text-navy tabular-nums">{category.subs.length}</span> sub-categories
      </p>

      <ul className="mt-4 pt-4 border-t border-[color-mix(in_oklab,var(--cat)_14%,var(--border))] grid gap-0.5">
        {subs.map((s, i) => (
          <li key={s.slug} className={cn(i >= SUB_PREVIEW_MOBILE && "max-sm:hidden")}>
            <Link
              to="/category/$slug/$sub"
              params={{ slug: category.slug, sub: s.slug }}
              className="group/sub flex items-center gap-2.5 rounded-md -mx-2 px-2 py-1.5 text-sm text-[#344054] hover:bg-white hover:text-navy transition-colors"
            >
              <span className="cat-dot shrink-0 opacity-50 group-hover/sub:opacity-100 transition-opacity" />
              <span className="truncate">{s.name}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">{s.tools.length}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {moreSubs > 0 ? `+${moreSubs} more sub-categories` : "All sub-categories shown"}
        </span>
        <Link
          to="/category/$slug"
          params={{ slug: category.slug }}
          aria-label={`View ${category.name}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-cat"
        >
          View category
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
