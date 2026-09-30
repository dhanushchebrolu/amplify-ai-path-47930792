import { useRef } from "react";
import type { CatalogTool } from "@/data/catalog";
import { CatalogLogo } from "@/components/CatalogLogo";
import { ArrowUpRight, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";

function toToolSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CatalogToolCard({
  tool, categorySlug, subSlug,
}: { tool: CatalogTool; categorySlug?: string; subSlug?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  let host = "";
  try { host = tool.website ? new URL(tool.website).hostname.replace(/^www\./, "") : ""; } catch { /* */ }

  const toolSlug = toToolSlug(tool.name);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className="bento-card group relative rounded-xl border border-border hover:border-brand/30 p-5 flex flex-col gap-4 overflow-hidden"
    >
      <div className="bento-spotlight pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start gap-3">
        <CatalogLogo name={tool.name} website={tool.website} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-navy truncate group-hover:text-brand-dark transition-colors">{tool.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{host || "AI Tool"}</p>
        </div>
      </div>

      <div className="relative mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        {categorySlug && subSlug ? (
          <Link
            to="/howto/$category/$sub/$tool"
            params={{ category: categorySlug, sub: subSlug, tool: toolSlug }}
            className="inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-3 py-1.5 bg-surface-blue text-brand-dark border border-brand/15 hover:border-brand/40 transition-colors"
            aria-label={`How to use ${tool.name}`}
          >
            <Info className="w-3.5 h-3.5" /> Full guide
          </Link>
        ) : <span />}
        {tool.website ? (
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy bg-surface border border-navy/15 hover:border-brand hover:text-brand-dark rounded-lg px-3 py-1.5 transition-colors"
          >
            Visit <ArrowUpRight className="w-3 h-3" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
