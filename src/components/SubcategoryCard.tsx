import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import type { CatalogSub } from "@/data/catalog";
import { CatalogLogo } from "@/components/CatalogLogo";
import { ArrowRight } from "lucide-react";

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
      className="bento-card group relative block rounded-2xl border border-white/10 hover:border-white/25 transition-colors p-5 h-[180px] overflow-hidden"
    >
      <div className="bento-spotlight pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex flex-col h-full">
        <h3 className="text-base font-medium text-foreground leading-snug line-clamp-2">
          {sub.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{sub.tools.length} tools</p>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex -space-x-2">
            {preview.map((t, i) => (
              <div key={i} className="ring-2 ring-background rounded-full">
                <CatalogLogo name={t.name} website={t.website} size={28} rounded="full" />
              </div>
            ))}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
