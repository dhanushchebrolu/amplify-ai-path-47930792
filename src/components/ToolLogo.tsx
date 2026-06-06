import { useState } from "react";
import type { Tool } from "@/data/tools";
import { cn } from "@/lib/utils";

interface ToolLogoProps {
  tool: Pick<Tool, "name" | "brandColor" | "simpleIcon" | "iconOnDark" | "website">;
  size?: number;
  className?: string;
  rounded?: "full" | "lg";
}

/**
 * Logo resolution chain:
 *  1. simpleicons.org SVG mark on a brand-colored disc (white silhouette).
 *  2. If that fails (e.g. brand removed from Simple Icons), fall back to
 *     Google's favicon service for the tool's domain on a white disc.
 *  3. Final fallback: clean letter monogram on the brand color.
 *
 * The fallback chain is driven by image onError to handle 404s after hydration.
 */
export function ToolLogo({ tool, size = 40, className, rounded = "lg" }: ToolLogoProps) {
  const name = tool?.name ?? "";
  const brandColor = (tool as any)?.brandColor || "#111111";
  const simpleIcon = (tool as any)?.simpleIcon ?? null;
  const website = (tool as any)?.website ?? null;
  const iconOnDark = (tool as any)?.iconOnDark ?? false;

  const [stage, setStage] = useState<0 | 1 | 2>(simpleIcon ? 0 : 1);

  const radius = rounded === "full" ? "rounded-full" : "rounded-xl";
  const initials =
    name
      .replace(/[^A-Za-z0-9 .·-]/g, "")
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const bcLower = (brandColor || "").toLowerCase();
  const isLightBrand = bcLower === "#ffffff" || bcLower === "#fff" || iconOnDark;

  let domain: string | null = null;
  try {
    domain = website ? new URL(website).hostname.replace(/^www\./, "") : null;
  } catch { /* ignore */ }

  const bg =
    stage === 0
      ? isLightBrand ? "#111111" : brandColor
      : stage === 1
        ? "#ffffff"
        : isLightBrand ? "#111111" : brandColor;

  const src =
    stage === 0 && simpleIcon
      ? `https://cdn.simpleicons.org/${simpleIcon}/ffffff`
      : stage === 1 && domain
        ? `https://www.google.com/s2/favicons?sz=128&domain=${domain}`
        : null;

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 ring-1 ring-white/10 shadow-md overflow-hidden",
        radius,
        className,
      )}
      style={{ width: size, height: size, backgroundColor: bg }}
      aria-label={`${name || "Tool"} logo`}
    >
      {src ? (
        <img
          key={src}
          src={src}
          alt=""
          width={Math.round(size * (stage === 1 ? 0.7 : 0.55))}
          height={Math.round(size * (stage === 1 ? 0.7 : 0.55))}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setStage((s) => (s < 2 ? ((s + 1) as 1 | 2) : 2))}
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
