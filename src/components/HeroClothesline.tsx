import { Link } from "@tanstack/react-router";
import { ChevronRight, Star } from "lucide-react";
import type { Tool } from "@/data/tools";
import { getCategory } from "@/data/tools";
import { ToolLogo } from "@/components/ToolLogo";

// Track geometry in px (before the responsive scale in .clothesline-track).
const SPACING = 300;
const CARD_W = 256;
const BASE_Y = 236; // string height at the visual centre
const CURVE = 0.00014; // y rises by CURVE * dx² away from the centre
const TRACK_H = 500;

/** Hero "clothesline": tool cards clipped to a sagging string. Deterministic, so SSR-safe. */
export function HeroClothesline({ tools }: { tools: Tool[] }) {
  const width = tools.length * SPACING;
  // Centre the view between the two middle cards so an even number shows.
  const center = width / 2 + (tools.length % 2 ? SPACING / 2 : 0);
  const y = (x: number) => BASE_Y - CURVE * (x - center) ** 2;
  // Cards follow the string's slope (left half: clockwise), softened a little.
  const tilt = (x: number) => ((Math.atan(-2 * CURVE * (x - center)) * 180) / Math.PI) * 0.75;

  const pts: string[] = [];
  for (let x = -SPACING * 3; x <= width + SPACING * 3; x += 20) pts.push(`${x},${y(x).toFixed(1)}`);

  return (
    <div className="clothesline relative w-full overflow-hidden" aria-label="Trending AI tools">
      <div
        className="clothesline-track absolute top-0"
        style={{ width, height: TRACK_H, left: `calc(50% - ${center}px)`, ["--cx" as string]: `${center}px` }}
      >
        <svg
          aria-hidden
          className="absolute top-0 overflow-visible"
          // maxWidth: the global `svg { max-width: 100% }` rule would squash the line.
          style={{ left: -SPACING * 3, width: width + SPACING * 6, height: TRACK_H, maxWidth: "none" }}
          viewBox={`${-SPACING * 3} 0 ${width + SPACING * 6} ${TRACK_H}`}
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="clothes-string" x1="0" x2="1">
              <stop offset="0" stopColor="#6F7BFF" />
              <stop offset="0.5" stopColor="#4C5EF5" />
              <stop offset="1" stopColor="#8A6BFF" />
            </linearGradient>
          </defs>
          <polyline points={pts.join(" ")} stroke="url(#clothes-string)" strokeOpacity="0.7" strokeWidth="1.75" />
        </svg>

        {tools.map((t, i) => {
          const cx = SPACING * (i + 0.5);
          const category = getCategory(t.category);
          return (
            <div
              key={t.slug}
              className="clothes-card absolute"
              style={{
                left: cx - CARD_W / 2,
                top: y(cx) - 12,
                width: CARD_W,
                ["--rot" as string]: `${tilt(cx).toFixed(2)}deg`,
                animationDelay: `${(-i * 0.7).toFixed(1)}s`,
              }}
            >
              <span aria-hidden className="clothes-pin" />
              <Link
                to="/tool/$slug"
                params={{ slug: t.slug }}
                className="clothes-card-inner group relative block mt-[22px] overflow-hidden rounded-[18px] bg-white border border-white p-4 pb-3.5"
                aria-label={`${t.name}, ${category?.name ?? t.category} tool, rated ${t.rating.toFixed(1)} out of 5`}
              >
                <CardArt slug={t.slug} category={t.category} />
                <span className="relative grid place-items-center w-14 h-14 rounded-2xl bg-white shadow-[0_6px_16px_-6px_rgb(16_24_40/0.35)] ring-1 ring-black/5">
                  <ToolLogo tool={t} size={40} />
                </span>
                <div className="relative mt-3 pr-10">
                  <div className="text-[1.3rem] leading-tight font-bold tracking-[-0.02em] text-navy truncate">{t.name}</div>
                  <div className="text-[13px] text-muted-foreground truncate">{t.category.charAt(0).toUpperCase() + t.category.slice(1)}</div>
                </div>
                <span aria-hidden className="absolute right-3.5 top-[104px] grid place-items-center w-8 h-8 rounded-full bg-white text-navy shadow-[0_4px_12px_-4px_rgb(16_24_40/0.35)] ring-1 ring-black/5 transition-transform group-hover:translate-x-0.5">
                  <ChevronRight className="w-4 h-4" />
                </span>
                <div className="relative mt-3 flex items-center justify-between gap-2 text-[13px]">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#F5B301] text-[#F5B301]" />
                    <span className="font-bold text-navy tabular-nums">{t.rating.toFixed(1)}/5</span>
                  </span>
                  <span className="text-[#475467] truncate">{t.priceFrom ?? t.pricing}</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type ArtKind = "mountains" | "bars" | "waves" | "code" | "ui" | "chat";

const ART_BY_SLUG: Record<string, ArtKind> = {
  runway: "mountains", midjourney: "mountains", elevenlabs: "bars", suno: "waves",
  cursor: "code", lovable: "ui", chatgpt: "chat", claude: "chat", perplexity: "chat",
};
const ART_BY_CATEGORY: Record<string, ArtKind> = {
  video: "mountains", image: "mountains", design: "mountains", audio: "bars", coding: "code",
};

/** Small pastel illustration in the card's top-right corner. Decorative only. */
function CardArt({ slug, category }: { slug: string; category: string }) {
  const kind = ART_BY_SLUG[slug] ?? ART_BY_CATEGORY[category] ?? "chat";
  return (
    <svg aria-hidden className="card-art absolute right-0 top-0 h-[104px] w-[64%]" style={{ maxWidth: "none" }} viewBox="0 0 170 104" preserveAspectRatio="xMidYMid slice" fill="none">
      <defs>
        <linearGradient id={`sky-${slug}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3EAFF" />
          <stop offset="1" stopColor="#F7F8FF" />
        </linearGradient>
        <linearGradient id={`hill-${slug}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5B78E8" />
          <stop offset="1" stopColor="#A9BCF5" />
        </linearGradient>
        <linearGradient id={`wave-${slug}`} x1="0" x2="1">
          <stop offset="0" stopColor="#F2A0C0" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <rect width="170" height="104" fill={`url(#sky-${slug})`} />
      {kind === "mountains" && (
        <g>
          <path d="M0 104 L40 62 L62 80 L98 30 L132 70 L150 56 L170 74 V104Z" fill={`url(#hill-${slug})`} opacity="0.9" />
          <path d="M98 30 L106 42 L100 40 L94 46 L90 41Z" fill="#fff" opacity="0.85" />
          <path d="M0 104 L30 84 L70 96 L120 78 L170 92 V104Z" fill="#C7D3FA" />
        </g>
      )}
      {kind === "bars" && (
        <g fill="#A78BFA">
          {Array.from({ length: 24 }, (_, i) => {
            const h = 10 + Math.abs(Math.sin(i * 1.3) * 34) + (i % 3) * 4;
            return <rect key={i} x={20 + i * 6} y={52 - h / 2} width="3" height={h} rx="1.5" opacity={0.45 + (i % 4) * 0.12} />;
          })}
        </g>
      )}
      {kind === "waves" && (
        <g strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M10 70 C40 20, 60 20, 85 60 S130 100, 160 40" stroke={`url(#wave-${slug})`} />
          <path d="M10 80 C40 40, 70 40, 95 70 S135 95, 165 60" stroke={`url(#wave-${slug})`} opacity="0.5" />
        </g>
      )}
      {kind === "code" && (
        <g>
          <rect x="22" y="14" width="140" height="84" rx="8" fill="#1E2340" />
          <circle cx="32" cy="23" r="2.5" fill="#FF6B6B" /><circle cx="40" cy="23" r="2.5" fill="#FFD43B" /><circle cx="48" cy="23" r="2.5" fill="#51CF66" />
          {[36, 46, 56, 66, 76, 86].map((yy, i) => (
            <rect key={yy} x={32 + (i % 3) * 8} y={yy} width={[70, 54, 88, 40, 64, 50][i]} height="4" rx="2" fill={["#7C9BFF", "#C3A6FF", "#8BE9FD", "#FFB86C", "#7C9BFF", "#C3A6FF"][i]} opacity="0.8" />
          ))}
        </g>
      )}
      {kind === "ui" && (
        <g>
          <rect x="30" y="18" width="120" height="74" rx="10" fill="#fff" opacity="0.85" />
          <rect x="40" y="30" width="58" height="8" rx="4" fill="#C3B5FD" />
          <rect x="40" y="46" width="94" height="6" rx="3" fill="#E4DDFE" />
          <rect x="40" y="58" width="80" height="6" rx="3" fill="#E4DDFE" />
          <rect x="108" y="28" width="34" height="18" rx="6" fill="#F3B6E4" />
        </g>
      )}
      {kind === "chat" && (
        <g>
          <rect x="44" y="18" width="104" height="26" rx="13" fill="#fff" opacity="0.9" />
          <rect x="56" y="28" width="62" height="6" rx="3" fill="#B7C6FA" />
          <rect x="24" y="54" width="96" height="26" rx="13" fill="#C9D6FF" />
          <rect x="36" y="64" width="54" height="6" rx="3" fill="#fff" />
        </g>
      )}
    </svg>
  );
}
