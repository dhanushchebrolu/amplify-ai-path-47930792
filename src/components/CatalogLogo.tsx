import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  website?: string;
  size?: number;
  rounded?: "full" | "lg";
  className?: string;
}

// Deterministic pleasant color from string
function hashColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `oklch(0.55 0.14 ${hue})`;
}

export function CatalogLogo({ name, website, size = 44, rounded = "lg", className }: Props) {
  const [failed, setFailed] = useState(false);
  const domain = useMemo(() => {
    if (!website) return null;
    try { return new URL(website).hostname.replace(/^www\./, ""); } catch { return null; }
  }, [website]);
  const initials = name
    .replace(/[^A-Za-z0-9 .·-]/g, "")
    .split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const radius = rounded === "full" ? "rounded-full" : "rounded-xl";
  const bg = failed || !domain ? hashColor(name) : "#ffffff";

  return (
    <div
      className={cn("flex items-center justify-center shrink-0 ring-1 ring-foreground/10 shadow-md overflow-hidden", radius, className)}
      style={{ width: size, height: size, backgroundColor: bg }}
      aria-label={`${name} logo`}
    >
      {!failed && domain ? (
        <img
          src={`https://www.google.com/s2/favicons?sz=128&domain=${domain}`}
          alt=""
          width={Math.round(size * 0.7)}
          height={Math.round(size * 0.7)}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-semibold tracking-tight text-white" style={{ fontSize: Math.round(size * 0.4) }}>
          {initials}
        </span>
      )}
    </div>
  );
}
