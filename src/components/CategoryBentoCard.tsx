import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import type { Category, Tool } from "@/data/tools";
import { toolsByCategory } from "@/data/tools";
import { ToolLogo } from "@/components/ToolLogo";
import { ArrowRight } from "lucide-react";

interface BubbleSpec {
  tool: Tool;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

// Hand-tuned constellation layout — non-overlapping, balanced, three soft rows.
const LAYOUT: [number, number, number][] = [
  [28, 30, 56], [58, 22, 64], [82, 36, 50],
  [18, 56, 46], [44, 58, 58], [70, 60, 56], [90, 64, 44],
  [32, 86, 48], [64, 86, 46],
];

function buildBubbles(tools: Tool[]): BubbleSpec[] {
  return tools.slice(0, LAYOUT.length).map((tool, i) => {
    const [x, y, size] = LAYOUT[i];
    return {
      tool, x, y, size,
      delay: (i * 0.35) % 2.5,
      duration: 5 + (i % 4) * 0.8,
    };
  });
}

export function CategoryBentoCard({ category }: { category: Category }) {
  const all = toolsByCategory(category.slug);
  const bubbles = buildBubbles(all);
  const extra = Math.max(0, all.length - bubbles.length);
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
      aria-label={`Browse AI ${category.name} tools`}
      style={{ display: "block", width: "100%" }}
      className="bento-card group relative h-[340px] overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-white/25"
    >
      {/* cursor spotlight */}
      <div className="bento-spotlight pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* header */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-20">
        <span className="text-[13px] font-medium text-foreground/90">{category.short}</span>
        <span className="text-[11px] text-muted-foreground bg-white/[0.04] border border-white/10 rounded-full px-2 py-0.5">
          +{all.length}
        </span>
      </div>

      {/* bubble field — inset so they don't crash into header / footer */}
      <div className="absolute inset-x-0 top-14 bottom-14 z-10">
        {bubbles.map((b, i) => (
          <div
            key={b.tool.slug}
            className="absolute bubble-float will-change-transform"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
              zIndex: i + 1,
            }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <ToolLogo tool={b.tool} size={b.size} rounded="full" />
              <span className="text-[10px] text-muted-foreground/90 font-medium whitespace-nowrap">
                {b.tool.shortName ?? b.tool.name.split(" ")[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* footer */}
      <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between z-20">
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors inline-flex items-center gap-1.5">
          View all {extra > 0 ? `(+${extra} more)` : ""}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
