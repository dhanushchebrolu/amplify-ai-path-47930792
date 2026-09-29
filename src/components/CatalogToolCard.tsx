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
      className="bento-card group relative rounded-2xl border border-foreground/10 hover:border-foreground/25 transition-colors p-5 flex flex-col gap-4 overflow-hidden"
    >
      <div className="bento-spotlight pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start gap-3">
        <CatalogLogo name={tool.name} website={tool.website} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{tool.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{host || "AI Tool"}</p>
        </div>
      </div>

      <div className="relative mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        {categorySlug && subSlug ? (
          <Link
            to="/howto/$category/$sub/$tool"
            params={{ category: categorySlug, sub: subSlug, tool: toolSlug }}
            className="inline-flex items-center gap-1 text-xs font-medium bg-foreground/[0.03] hover:bg-foreground/[0.08] border border-foreground/10 hover:border-foreground/25 rounded-full px-3 py-1.5 transition-colors text-muted-foreground hover:text-foreground"
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
            className="inline-flex items-center gap-1 text-xs font-medium bg-foreground/[0.06] hover:bg-foreground/[0.12] border border-foreground/10 rounded-full px-3 py-1.5 transition-colors"
          >
            Visit <ArrowUpRight className="w-3 h-3" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
