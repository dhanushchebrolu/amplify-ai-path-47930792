import { Link } from "@tanstack/react-router";
import type { CatalogSub } from "@/data/catalog";
import { CatalogLogo } from "@/components/CatalogLogo";
import { subDescription, subIcon } from "@/data/subcategory-meta";
import { ArrowRight } from "lucide-react";

/** Sub-category card. Picks up --cat/--cat-tint from an enclosing .cat-* scope. */
export function SubcategoryCard({
  catSlug,
  sub,
}: {
  catSlug: string;
  sub: CatalogSub;
}) {
  const preview = sub.tools.slice(0, 4);
  const extra = sub.tools.length - preview.length;
  const Icon = subIcon(sub.name);

  return (
    <Link
      to="/category/$slug/$sub"
      params={{ slug: catSlug, sub: sub.slug }}
      className="sub-card group flex h-full flex-col rounded-xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="grid shrink-0 place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#F1F4FB] text-navy/80 transition-colors group-hover:bg-cat-tint group-hover:text-cat">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-[1.3rem] sm:text-[1.4rem] leading-tight tracking-[-0.01em] text-navy group-hover:text-cat transition-colors">
            {sub.name}
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground line-clamp-2">
            {subDescription(catSlug, sub.slug, sub.name)}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6 flex items-center">
        <span className="shrink-0 text-sm text-[#475467] tabular-nums">{sub.tools.length} tools</span>
        <span aria-hidden className="mx-4 sm:mx-5 h-8 w-px bg-border" />
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {preview.map((t, i) => (
            <span key={i} className={i >= 3 ? "hidden xl:inline-flex" : "inline-flex"}>
              <CatalogLogo name={t.name} website={t.website} size={30} rounded="lg" className="shadow-none ring-0" />
            </span>
          ))}
          {/* Three logos below xl, four from xl: the "+N" count follows. */}
          {extra + 1 > 0 && preview.length > 3 && (
            <span className="xl:hidden shrink-0 rounded-full bg-[#F1F4FB] px-2.5 py-1 text-xs font-medium text-[#475467] tabular-nums">
              +{extra + 1}
            </span>
          )}
          {extra > 0 && (
            <span className="hidden xl:inline shrink-0 rounded-full bg-[#F1F4FB] px-2.5 py-1 text-xs font-medium text-[#475467] tabular-nums">
              +{extra}
            </span>
          )}
        </div>
        <span className="ml-auto pl-3 shrink-0">
          <span className="grid place-items-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F1F4FB] text-navy transition-all duration-200 group-hover:bg-cat-tint group-hover:text-cat group-hover:translate-x-0.5">
            <ArrowRight className="w-[18px] h-[18px]" />
          </span>
        </span>
      </div>
    </Link>
  );
}
