import type { Tool } from "@/data/tools";
import { cn } from "@/lib/utils";

interface ToolLogoProps {
  tool: Pick<Tool, "name" | "brandColor" | "simpleIcon" | "iconOnDark">;
  size?: number;
  className?: string;
  rounded?: "full" | "lg";
}

/**
 * Renders an AI tool's official logo via simpleicons.org when available,
 * falling back to a clean letter monogram on the brand color. Both styles
 * are visually consistent and look intentional, never generic.
 */
export function ToolLogo({ tool, size = 40, className, rounded = "lg" }: ToolLogoProps) {
  const radius = rounded === "full" ? "rounded-full" : "rounded-xl";
  const initials = tool.name
    .replace(/[^A-Za-z0-9 .·-]/g, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Decide background: brand color, but if brand is white render a dark surface.
  const isLightBrand =
    tool.brandColor.toLowerCase() === "#ffffff" ||
    tool.brandColor.toLowerCase() === "#fff" ||
    tool.iconOnDark;

  const bg = isLightBrand ? "#111111" : tool.brandColor;
  const iconColor = isLightBrand ? "ffffff" : "ffffff";

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 ring-1 ring-white/10 shadow-sm overflow-hidden",
        radius,
        className,
      )}
      style={{ width: size, height: size, backgroundColor: bg }}
      aria-label={`${tool.name} logo`}
    >
      {tool.simpleIcon ? (
        <img
          src={`https://cdn.simpleicons.org/${tool.simpleIcon}/${iconColor}`}
          alt=""
          width={Math.round(size * 0.55)}
          height={Math.round(size * 0.55)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span
          className="font-semibold tracking-tight text-white"
          style={{ fontSize: Math.round(size * 0.42) }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
