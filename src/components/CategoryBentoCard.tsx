import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import type { CatalogCategory } from "@/data/catalog";
import { CatalogLogo } from "@/components/CatalogLogo";
import { ArrowRight } from "lucide-react";

// Well-spaced 6-bubble layout — leaves room for labels under each icon
const LAYOUT: [number, number, number][] = [
  [20, 26, 56], [52, 22, 60], [84, 32, 48],
  [22, 70, 50], [56, 74, 54], [86, 66, 46],
];

export function CategoryBentoCard({ category }: { category: CatalogCategory }) {
  const allTools = category.subs.flatMap((s) => s.tools);
  const sample = allTools.slice(0, LAYOUT.length);
  const total = allTools.length;
  const ref = useRef<HTMLAnchorElement>(null);

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
      to="/category/$slug"
      params={{ slug: category.slug }}
      onMouseMove={handleMove}
      aria-label={`Browse AI ${category.short} tools`}
      style={{ display: "block", width: "100%" }}
      className="bento-card group relative h-[360px] overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-white/25"
    >
      <div className="bento-spotlight pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-20">
        <span className="text-[13px] font-medium text-foreground/90">{category.short}</span>
        <span className="text-[11px] text-muted-foreground bg-white/[0.04] border border-white/10 rounded-full px-2 py-0.5">
          {total}+
        </span>
      </div>

      <div className="absolute inset-x-0 top-14 bottom-14 z-10">
        {sample.map((tool, i) => {
          const [x, y, size] = LAYOUT[i];
          const delay = (i * 0.4) % 2.5;
          const duration = 5 + (i % 4) * 0.8;
          const short = tool.name.split(/[\s(]/)[0];
          return (
            <div
              key={`${tool.name}-${i}`}
              className="absolute bubble-float will-change-transform"
              style={{
                left: `${x}%`, top: `${y}%`,
                transform: "translate(-50%, -50%)",
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                zIndex: i + 1,
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <CatalogLogo name={tool.name} website={tool.website} size={size} rounded="full" />
                <span
                  className="text-[10px] text-muted-foreground/90 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] text-center"
                  title={tool.name}
                >
                  {short}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between z-20">
        <span className="text-sm text-muted-foreground">
          {category.subs.length} sub-categories
        </span>
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors inline-flex items-center gap-1.5">
          Explore
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
