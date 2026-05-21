import { useState } from "react";
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
 * gracefully falling back to a clean letter monogram on the brand color when
 * the remote icon is missing or blocked.
 */
export function ToolLogo({ tool, size = 40, className, rounded = "lg" }: ToolLogoProps) {
  const [failed, setFailed] = useState(false);

  const radius = rounded === "full" ? "rounded-full" : "rounded-xl";
  const initials = tool.name
    .replace(/[^A-Za-z0-9 .·-]/g, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isLightBrand =
    tool.brandColor.toLowerCase() === "#ffffff" ||
    tool.brandColor.toLowerCase() === "#fff" ||
    tool.iconOnDark;

  const bg = isLightBrand ? "#111111" : tool.brandColor;
  const showImage = tool.simpleIcon && !failed;

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 ring-1 ring-white/10 shadow-md overflow-hidden",
        radius,
        className,
      )}
      style={{ width: size, height: size, backgroundColor: bg }}
      aria-label={`${tool.name} logo`}
    >
      {showImage ? (
        <img
          src={`https://cdn.simpleicons.org/${tool.simpleIcon}/ffffff`}
          alt=""
          width={Math.round(size * 0.55)}
          height={Math.round(size * 0.55)}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
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
