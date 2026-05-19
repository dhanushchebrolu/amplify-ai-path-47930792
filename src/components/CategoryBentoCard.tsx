import { Link } from "@tanstack/react-router";
import type { Category, Tool } from "@/data/tools";
import { toolsByCategory } from "@/data/tools";
import { ToolLogo } from "@/components/ToolLogo";
import { ArrowRight } from "lucide-react";

interface BubbleSpec {
  tool: Tool;
  x: number; // %
  y: number; // %
  size: number; // px
  delay: number; // s
}

// Hand-tuned positions per category — produces the constellation look from
// the reference without overlapping. Falls back to a circular layout if a
// category has more bubbles than positions.
const positions: number[][][] = [
  // 9-bubble layout
  [
    [22, 28, 56], [50, 18, 62], [78, 30, 50],
    [14, 60, 44], [38, 58, 56], [64, 56, 58], [86, 62, 46],
    [30, 86, 44], [62, 84, 46],
  ],
];

function buildBubbles(tools: Tool[]): BubbleSpec[] {
  const layout = positions[0];
  return tools.slice(0, layout.length).map((tool, i) => ({
    tool,
    x: layout[i][0],
    y: layout[i][1],
    size: layout[i][2],
    delay: (i % 5) * 0.4,
  }));
}

export function CategoryBentoCard({ category }: { category: Category }) {
  const all = toolsByCategory(category.slug);
  const bubbles = buildBubbles(all);
  const extra = Math.max(0, all.length - bubbles.length);

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="card-surface group relative block h-[280px] overflow-hidden transition-colors hover:border-white/20"
    >
      <div className="absolute top-4 left-5 right-5 flex items-center justify-between z-10">
        <span className="text-sm font-medium text-foreground/90">{category.short}</span>
        <span className="text-xs text-muted-foreground bg-white/5 border border-white/5 rounded-full px-2 py-0.5">
          +{all.length}
        </span>
      </div>

      <div className="absolute inset-0">
        {bubbles.map((b, i) => (
          <div
            key={b.tool.slug}
            className="absolute bubble"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${b.delay}s`,
              zIndex: i,
            }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <ToolLogo tool={b.tool} size={b.size} rounded="full" />
              <span className="text-[10px] text-muted-foreground/80 font-medium">
                {b.tool.shortName ?? b.tool.name.split(" ")[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between z-10">
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          View all {extra > 0 ? `(+${extra} more)` : ""}
        </span>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
