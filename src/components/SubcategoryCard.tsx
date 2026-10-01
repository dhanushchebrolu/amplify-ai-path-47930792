import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import type { CatalogSub } from "@/data/catalog";
import { CatalogLogo } from "@/components/CatalogLogo";
import { CardArt, artForSub, artMirror } from "@/components/CardArt";
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
  const extra = sub.tools.length - preview.length;

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
      className="bento-card cat-edge group relative block rounded-xl border border-border p-5 h-[176px] overflow-hidden"
    >
      <div className="bento-spotlight pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardArt
        kind={artForSub(sub.name, sub.slug, catSlug)}
        mirror={artMirror(sub.slug)}
        className="absolute right-0 top-0 h-[104px] sm:h-[112px] w-[40%] sm:w-[46%] origin-top-right transition-transform duration-300 group-hover:scale-[1.04]"
      />

      <div className="relative flex flex-col h-full">
        <h3 className="max-w-[56%] text-base font-semibold text-navy leading-snug line-clamp-2 group-hover:text-cat transition-colors">
          {sub.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="font-semibold text-navy tabular-nums">{sub.tools.length}</span> tools
        </p>

        <div className="mt-auto flex items-end justify-between">
          <div className="logo-stack flex items-center">
            {preview.map((t, i) => (
              <span key={i} className="rounded-full ring-2 ring-white shadow-sm" style={{ zIndex: preview.length - i }}>
                <CatalogLogo name={t.name} website={t.website} size={30} rounded="full" className="shadow-none ring-0" />
              </span>
            ))}
            {extra > 0 && (
              <span className="relative z-10 grid place-items-center h-[30px] min-w-[34px] px-2 rounded-full ring-2 ring-white bg-cat-tint text-[10px] font-semibold text-cat tabular-nums">
                +{extra}
              </span>
            )}
          </div>
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-cat-tint text-cat transition-transform duration-200 group-hover:translate-x-1">
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
