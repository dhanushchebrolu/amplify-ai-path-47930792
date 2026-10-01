import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import type { CatalogSub } from "@/data/catalog";
import { CatalogLogo } from "@/components/CatalogLogo";
import { ArrowRight } from "lucide-react";

/** Sub-category card. Picks up --cat/--cat-tint from an enclosing .cat-* scope. */
export function SubcategoryCard({
  catSlug,
  sub,
}: {
  catSlug: string;
  sub: CatalogSub;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const preview = sub.tools.slice(0, 4);

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <Link
      ref={ref}
      to="/category/$slug/$sub"
      params={{ slug: catSlug, sub: sub.slug }}
      onMouseMove={handleMove}
      className="bento-card group relative block rounded-2xl border border-border hover:border-[color-mix(in_oklab,var(--cat,var(--brand))_40%,var(--border))] p-5 sm:p-6 h-[170px] sm:h-[224px] overflow-hidden"
    >
      <div className="bento-spotlight pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex flex-col h-full">
        <h3 className="text-[1.15rem] font-semibold tracking-[-0.01em] text-navy leading-snug line-clamp-2 group-hover:text-cat transition-colors">
          {sub.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5">{sub.tools.length} tools</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="logo-stack flex items-center">
            {preview.map((t, i) => (
              <span key={i} className="rounded-full ring-2 ring-white shadow-sm" style={{ zIndex: preview.length - i }}>
                <CatalogLogo name={t.name} website={t.website} size={34} rounded="full" className="shadow-none ring-0" />
              </span>
            ))}
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground transition-all duration-200 group-hover:text-cat group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
