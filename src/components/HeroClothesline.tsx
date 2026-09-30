import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Tool } from "@/data/tools";
import { getCategory } from "@/data/tools";
import { ToolLogo } from "@/components/ToolLogo";

// Track geometry (px, before the responsive scale in .clothesline-track).
const SPACING = 236;
const CARD_W = 196;
const TOP = 6; // string height at the track edges (off-screen on most viewports)
const SAG = 84; // extra drop at the centre
const TRACK_H = 356;

/** y of the string at x: a parabola that is lowest in the middle. */
function stringY(x: number, width: number) {
  const u = (x - width / 2) / (width / 2);
  return TOP + SAG * (1 - u * u);
}

/** Tilt (deg) of a card hanging at x: follows the string's slope, exaggerated a little. */
function tiltAt(x: number, width: number) {
  const half = width / 2;
  const slope = (-2 * SAG * ((x - half) / half)) / half;
  return ((Math.atan(slope) * 180) / Math.PI) * 1.35;
}

/** Hero "clothesline": tool cards clipped to a sagging string. Deterministic, so SSR-safe. */
export function HeroClothesline({ tools }: { tools: Tool[] }) {
  const width = tools.length * SPACING;
  const pts: string[] = [];
  for (let x = -SPACING * 2; x <= width + SPACING * 2; x += 24) {
    pts.push(`${x},${stringY(x, width).toFixed(1)}`);
  }

  return (
    <div className="clothesline relative w-full overflow-hidden" aria-label="Trending AI tools">
      <div className="clothesline-track absolute left-1/2 top-0" style={{ width, height: TRACK_H }}>
        <svg
          aria-hidden
          className="absolute top-0 overflow-visible"
          // maxWidth: the global `svg { max-width: 100% }` rule would squash the line.
          style={{ left: -SPACING * 2, width: width + SPACING * 4, height: TRACK_H, maxWidth: "none" }}
          viewBox={`${-SPACING * 2} 0 ${width + SPACING * 4} ${TRACK_H}`}
          preserveAspectRatio="none"
          fill="none"
        >
          <polyline points={pts.join(" ")} stroke="rgb(16 24 40 / 0.22)" strokeWidth="1.5" />
        </svg>

        {tools.map((t, i) => {
          const cx = SPACING * (i + 0.5);
          const y = stringY(cx, width);
          const rot = tiltAt(cx, width);
          const category = getCategory(t.category);
          return (
            <div
              key={t.slug}
              className="clothes-card absolute"
              style={{
                left: cx - CARD_W / 2,
                top: y - 9,
                width: CARD_W,
                ["--rot" as string]: `${rot.toFixed(2)}deg`,
                animationDelay: `${(-i * 0.7).toFixed(1)}s`,
              }}
            >
              <span aria-hidden className="clothes-pin" />
              <Link
                to="/tool/$slug"
                params={{ slug: t.slug }}
                className="clothes-card-inner block mt-[18px] rounded-xl bg-surface border border-border p-4"
              >
                <ToolLogo tool={t} size={52} />
                <div className="mt-3 font-condensed text-[1.6rem] leading-none font-semibold text-navy tracking-tight truncate">
                  {t.name}
                </div>
                <div className="mt-1.5 text-[12px] text-muted-foreground truncate">
                  {category?.name ?? t.category}
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[12px] text-[#344054]">
                  <Star className="w-3.5 h-3.5 fill-[#F5B301] text-[#F5B301]" />
                  <span className="font-semibold text-navy tabular-nums">{t.rating.toFixed(1)}/5</span>
                  <span className="text-border">•</span>
                  <span className="truncate">{t.priceFrom ?? t.pricing}</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
