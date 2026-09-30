import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import type { Tool } from "@/data/tools";
import { ToolLogo } from "@/components/ToolLogo";
import { ArrowUpRight } from "lucide-react";

export function ToolCard({ tool }: { tool: Tool }) {
  const ref = useRef<HTMLDivElement>(null);
  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className="bento-card group relative rounded-xl border border-border hover:border-brand/30 p-5 flex flex-col gap-4 h-full overflow-hidden"
    >
      <div className="bento-spotlight pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ToolLogo tool={tool} size={44} />
          <div>
            <Link
              to="/tool/$slug"
              params={{ slug: tool.slug }}
              className="font-semibold text-navy hover:text-brand-dark transition-colors"
            >
              {tool.name}
            </Link>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="capitalize">{tool.category}</span>
              {tool.trending && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[#8A6100]">
                    <span className="w-1.5 h-1.5 rounded-full bg-highlight ring-2 ring-highlight/30 animate-pulse" />
                    Trending
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-wrap gap-1.5">
        {tool.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-blue border border-brand/10 text-brand-dark"
          >
            {t}
          </span>
        ))}
      </div>

      <p className="relative text-sm text-muted-foreground/90 leading-relaxed line-clamp-3 min-h-[60px]">
        {tool.description}
      </p>

      <div className="relative mt-auto flex items-center justify-between pt-3 border-t border-border/60">
        <span className="text-xs font-medium text-navy/80">{tool.priceFrom ?? tool.pricing}</span>
        <a
          href={tool.website}
          target="_blank"
          rel="noopener sponsored"
          className="inline-flex items-center gap-1 text-xs font-semibold text-navy bg-surface border border-navy/15 hover:border-brand hover:text-brand-dark rounded-lg px-3 py-1.5 transition-colors"
        >
          Visit <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
