import { useRef } from "react";
import type { CatalogTool } from "@/data/catalog";
import { CatalogLogo } from "@/components/CatalogLogo";
import { ArrowUpRight } from "lucide-react";

export function CatalogToolCard({ tool }: { tool: CatalogTool }) {
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

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className="bento-card group relative rounded-2xl border border-white/10 hover:border-white/25 transition-colors p-5 flex flex-col gap-4 overflow-hidden"
    >
      <div className="bento-spotlight pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start gap-3">
        <CatalogLogo name={tool.name} website={tool.website} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{tool.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{host || "AI Tool"}</p>
        </div>
      </div>

      <div className="relative mt-auto pt-3 border-t border-border/60 flex items-center justify-end">
        {tool.website ? (
          <a
            href={tool.website}
            target="_blank"
            rel="noopener sponsored"
            className="inline-flex items-center gap-1 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-full px-3 py-1.5 transition-colors"
          >
            Visit <ArrowUpRight className="w-3 h-3" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
