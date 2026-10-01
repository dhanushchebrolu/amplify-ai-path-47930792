import { cn } from "@/lib/utils";

/**
 * Small decorative illustrations for sub-category cards, drawn in the
 * enclosing category accent (--cat / --cat-tint, see .cat-* in styles.css).
 * Pure inline SVG: no images, no gradient ids, safe to repeat on a page.
 */
export type ArtKind =
  | "mountains" | "play" | "bars" | "waves" | "code" | "ui" | "chat" | "mail"
  | "chart" | "social" | "cart" | "profile" | "edu" | "grid" | "doc";

// First match wins, so more specific themes come first.
const RULES: [RegExp, ArtKind][] = [
  [/avatar/, "profile"],
  [/screen.?record/, "ui"],
  [/transcri|summar/, "doc"],
  [/music|song|podcast/, "waves"],
  [/voice|audio|speech|transcri|dubb|sound|narrat/, "bars"],
  [/video|animation|clip|film|movie|youtube|screen.?record|reel/, "play"],
  [/no.?code|builder/, "ui"],
  [/code|coding|developer|devops|api|testing|program|sql|github|debug/, "code"],
  [/\bui\b|ux|prototyp|website|landing|\bweb\b|wireframe/, "ui"],
  [/image|photo|art|illustrat|background|logo|avatar|enhanc|upscal|graphic|icon|design/, "mountains"],
  [/email|newsletter|outreach|inbox/, "mail"],
  [/writ|blog|copywrit|paraphras|grammar|essay|story/, "doc"],
  [/chat|assistant|support|bot|companion|conversation|agent/, "chat"],
  [/social|instagram|tiktok|twitter|linkedin|influencer|community|hashtag/, "social"],
  [/resume|\bcv\b|hiring|recruit|interview|\bhr\b|job|career|cover.?letter|talent|employee/, "profile"],
  [/learn|course|tutor|study|education|exam|quiz|student|teach|homework|academic|lesson/, "edu"],
  [/shop|commerce|\bproducts?\b|store|listing|pricing|inventory|fulfil|marketplace/, "cart"],
  [/seo|keyword|rank|analytic|insight|report|intelligence|sales|revenue|crm|\bads?\b|advertis|campaign|growth|marketing|finance|audit|backlink/, "chart"],
  [/meeting|schedul|calendar|task|productiv|project|spreadsheet|data|presentation|slide|office|note|automation/, "grid"],
  [/writ|blog|copy|content|paraphras|grammar|essay|story|text|translat|document|summar/, "doc"],
];

const CATEGORY_FALLBACK: Record<string, ArtKind> = {
  "ai-writing-tools": "doc", "ai-image-tools": "mountains", "ai-video-tools": "play",
  "ai-audio-voice-tools": "bars", "ai-chatbots-assistants": "chat", "ai-marketing-tools": "chart",
  "ai-seo-tools": "chart", "ai-coding-developer-tools": "code", "ai-design-ui-ux-tools": "ui",
  "ai-social-media-tools": "social", "ai-business-tools": "chart", "ai-office-tools": "grid",
  "ai-resume-hr-tools": "profile", "ai-education-learning-tools": "edu", "ai-e-commerce-tools": "cart",
};

export function artForSub(name: string, slug: string, categorySlug: string): ArtKind {
  const text = `${name} ${slug.replace(/-/g, " ")}`.toLowerCase();
  for (const [re, kind] of RULES) if (re.test(text)) return kind;
  return CATEGORY_FALLBACK[categorySlug] ?? "doc";
}

const INK = "#1E2340";

/** Stable 0/1 from a string, used to mirror some illustrations for variety. */
export function artMirror(seed: string): boolean {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 2 === 1;
}

export function CardArt({ kind, className, mirror }: { kind: ArtKind; className?: string; mirror?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 170 104"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      className={cn("card-art", className)}
      // currentColor = category accent; maxWidth overrides the global svg rule.
      style={{ color: "var(--cat, #3867FF)", maxWidth: "none" }}
    >
      <rect width="170" height="104" style={{ fill: "var(--cat-tint, #F4F7FF)" }} />
      {mirror && ALT[kind] ? (
        ALT[kind]
      ) : (
        <g transform={mirror && !NO_MIRROR.has(kind) ? "translate(170 0) scale(-1 1)" : undefined}>{ART[kind]}</g>
      )}
    </svg>
  );
}

// Directional pictures (play arrow, trend line, code) never mirror; they use ALT instead.
const NO_MIRROR = new Set<ArtKind>(["play", "chart", "code"]);

const ALT: Partial<Record<ArtKind, React.ReactNode>> = {
  play: (
    <g>
      <rect x="18" y="24" width="140" height="56" rx="8" fill={INK} opacity="0.88" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={26 + i * 33} y="34" width="27" height="36" rx="4" fill="currentColor" opacity={0.35 + i * 0.15} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <rect key={`h${i}`} x={24 + i * 11.4} y="27" width="5" height="3" rx="1" fill="#fff" opacity="0.5" />
      ))}
      <circle cx="88" cy="52" r="11" fill="#fff" />
      <path d="M85 46 L94 52 L85 58Z" fill="currentColor" />
    </g>
  ),
  chart: (
    <g>
      <circle cx="68" cy="52" r="28" stroke="currentColor" strokeWidth="12" opacity="0.2" />
      <path d="M68 24 a28 28 0 0 1 26.6 36.6" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
      <path d="M94.6 60.6 a28 28 0 0 1 -14 14" stroke="#FFD43B" strokeWidth="12" strokeLinecap="round" />
      <rect x="112" y="34" width="40" height="7" rx="3.5" fill="currentColor" opacity="0.7" />
      <rect x="112" y="48" width="30" height="5" rx="2.5" fill="currentColor" opacity="0.3" />
      <rect x="112" y="60" width="34" height="5" rx="2.5" fill="currentColor" opacity="0.3" />
    </g>
  ),
  code: (
    <g>
      <rect x="22" y="16" width="136" height="76" rx="9" fill={INK} />
      <path d="M34 34 l8 6 l-8 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="48" y="38" width="54" height="4" rx="2" fill="#fff" opacity="0.8" />
      <rect x="34" y="54" width="86" height="4" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="34" y="64" width="62" height="4" rx="2" fill="#C3A6FF" opacity="0.7" />
      <rect x="34" y="76" width="8" height="5" rx="1" fill="#51CF66" />
    </g>
  ),
};

const ART: Record<ArtKind, React.ReactNode> = {
  mountains: (
    <g>
      <circle cx="132" cy="26" r="10" fill="#FFD43B" opacity="0.85" />
      <path d="M0 104 L46 52 L70 74 L104 30 L140 70 L170 50 V104Z" fill="currentColor" opacity="0.35" />
      <path d="M104 30 L113 42 L106 40 L100 47 L95 41Z" fill="#fff" opacity="0.9" />
      <path d="M0 104 L34 80 L74 96 L122 72 L170 88 V104Z" fill="currentColor" opacity="0.6" />
    </g>
  ),
  play: (
    <g>
      <rect x="30" y="14" width="120" height="70" rx="10" fill="currentColor" opacity="0.16" />
      <path d="M30 70 L62 46 L84 62 L108 40 L150 70 V74 a10 10 0 0 1 -10 10 H40 a10 10 0 0 1 -10 -10Z" fill="currentColor" opacity="0.28" />
      <circle cx="90" cy="44" r="15" fill="currentColor" opacity="0.85" />
      <path d="M86 37 L98 44 L86 51Z" fill="#fff" />
      <rect x="30" y="92" width="120" height="4" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="30" y="92" width="58" height="4" rx="2" fill="currentColor" opacity="0.7" />
    </g>
  ),
  bars: (
    <g fill="currentColor">
      {Array.from({ length: 22 }, (_, i) => {
        const h = 10 + Math.abs(Math.sin(i * 1.3) * 34) + (i % 3) * 4;
        return <rect key={i} x={26 + i * 6} y={52 - h / 2} width="3" height={h} rx="1.5" opacity={0.35 + (i % 4) * 0.15} />;
      })}
    </g>
  ),
  waves: (
    <g strokeWidth="3" strokeLinecap="round" stroke="currentColor">
      <path d="M14 68 C42 18, 64 18, 88 58 S132 98, 162 38" opacity="0.8" />
      <path d="M14 80 C42 40, 72 40, 96 70 S136 94, 166 60" opacity="0.4" />
      <circle cx="132" cy="22" r="7" fill="currentColor" stroke="none" opacity="0.5" />
      <rect x="138" y="8" width="3" height="16" rx="1.5" fill="currentColor" stroke="none" opacity="0.5" />
    </g>
  ),
  code: (
    <g>
      <rect x="26" y="12" width="136" height="84" rx="9" fill={INK} />
      <circle cx="37" cy="22" r="2.6" fill="#FF6B6B" /><circle cx="45" cy="22" r="2.6" fill="#FFD43B" /><circle cx="53" cy="22" r="2.6" fill="#51CF66" />
      {[34, 44, 54, 64, 74, 84].map((y, i) => (
        <rect key={y} x={36 + (i % 3) * 8} y={y} width={[72, 52, 86, 40, 64, 48][i]} height="4" rx="2"
          fill={i % 2 ? "#C3A6FF" : "currentColor"} opacity={i % 2 ? 0.75 : 0.95} />
      ))}
    </g>
  ),
  ui: (
    <g>
      <rect x="28" y="14" width="124" height="78" rx="10" fill="#fff" />
      <rect x="28" y="14" width="124" height="14" rx="10" fill="currentColor" opacity="0.18" />
      <rect x="38" y="38" width="46" height="34" rx="6" fill="currentColor" opacity="0.35" />
      <rect x="92" y="38" width="50" height="7" rx="3.5" fill="currentColor" opacity="0.6" />
      <rect x="92" y="51" width="40" height="5" rx="2.5" fill="currentColor" opacity="0.25" />
      <rect x="92" y="61" width="32" height="10" rx="5" fill="currentColor" opacity="0.8" />
      <rect x="38" y="80" width="104" height="5" rx="2.5" fill="currentColor" opacity="0.15" />
    </g>
  ),
  chat: (
    <g>
      <rect x="46" y="14" width="106" height="28" rx="14" fill="#fff" />
      <rect x="58" y="25" width="64" height="6" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="22" y="50" width="98" height="28" rx="14" fill="currentColor" opacity="0.75" />
      <rect x="34" y="61" width="56" height="6" rx="3" fill="#fff" opacity="0.9" />
      <circle cx="140" cy="64" r="3" fill="currentColor" opacity="0.4" />
      <circle cx="150" cy="64" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="160" cy="64" r="3" fill="currentColor" opacity="0.8" />
    </g>
  ),
  mail: (
    <g>
      <rect x="40" y="20" width="104" height="68" rx="9" fill="#fff" />
      <path d="M40 28 L92 62 L144 28" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" opacity="0.7" />
      <rect x="40" y="20" width="104" height="68" rx="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <circle cx="144" cy="22" r="10" fill="currentColor" />
      <path d="M140 22 h8 M144 18 v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  chart: (
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={40 + i * 22} y={82 - (14 + i * 11)} width="14" height={14 + i * 11} rx="3" fill="currentColor" opacity={0.3 + i * 0.13} />
      ))}
      <path d="M36 66 L60 54 L82 58 L106 34 L134 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="134" cy="22" r="5" fill="#fff" stroke="currentColor" strokeWidth="3" />
      <rect x="34" y="86" width="110" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
    </g>
  ),
  social: (
    <g>
      <rect x="30" y="18" width="80" height="62" rx="12" fill="#fff" />
      <circle cx="46" cy="34" r="8" fill="currentColor" opacity="0.5" />
      <rect x="58" y="30" width="40" height="5" rx="2.5" fill="currentColor" opacity="0.35" />
      <rect x="40" y="48" width="60" height="22" rx="6" fill="currentColor" opacity="0.18" />
      <path d="M134 50 c-8 -8 -20 -2 -14 8 l14 14 l14 -14 c6 -10 -6 -16 -14 -8z" fill="currentColor" opacity="0.85" />
      <circle cx="146" cy="24" r="8" fill="#FFD43B" opacity="0.9" />
      <path d="M142 24 l3 3 l5 -6" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  cart: (
    <g>
      <path d="M58 36 h64 l-6 50 a6 6 0 0 1 -6 5 h-40 a6 6 0 0 1 -6 -5z" fill="currentColor" opacity="0.75" />
      <path d="M74 38 v-8 a16 16 0 0 1 32 0 v8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <rect x="120" y="18" width="34" height="18" rx="5" fill="#fff" transform="rotate(12 137 27)" />
      <rect x="126" y="25" width="18" height="4" rx="2" fill="currentColor" opacity="0.5" transform="rotate(12 137 27)" />
      <circle cx="90" cy="60" r="7" fill="#fff" opacity="0.85" />
    </g>
  ),
  profile: (
    <g>
      <rect x="36" y="14" width="98" height="80" rx="10" fill="#fff" />
      <circle cx="60" cy="40" r="12" fill="currentColor" opacity="0.55" />
      <rect x="80" y="32" width="42" height="6" rx="3" fill="currentColor" opacity="0.6" />
      <rect x="80" y="44" width="30" height="5" rx="2.5" fill="currentColor" opacity="0.25" />
      <rect x="48" y="62" width="74" height="5" rx="2.5" fill="currentColor" opacity="0.2" />
      <rect x="48" y="73" width="60" height="5" rx="2.5" fill="currentColor" opacity="0.2" />
      <circle cx="140" cy="20" r="11" fill="currentColor" />
      <path d="M135 20 l3.5 3.5 l6.5 -7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  edu: (
    <g>
      <path d="M90 18 L148 40 L90 62 L32 40Z" fill="currentColor" opacity="0.8" />
      <path d="M58 50 v20 c0 8 64 8 64 0 v-20 L90 62Z" fill="currentColor" opacity="0.45" />
      <path d="M142 42 v26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <circle cx="142" cy="72" r="4" fill="#FFD43B" />
    </g>
  ),
  grid: (
    <g>
      <rect x="32" y="14" width="112" height="78" rx="9" fill="#fff" />
      <rect x="32" y="14" width="112" height="16" rx="9" fill="currentColor" opacity="0.7" />
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (
        <rect key={`${r}-${c}`} x={40 + c * 26} y={38 + r * 17} width="20" height="11" rx="3"
          fill="currentColor" opacity={(r * 4 + c) % 5 === 1 ? 0.65 : 0.16} />
      )))}
    </g>
  ),
  doc: (
    <g>
      <rect x="40" y="10" width="86" height="88" rx="9" fill="#fff" />
      <rect x="52" y="24" width="50" height="7" rx="3.5" fill="currentColor" opacity="0.7" />
      {[40, 50, 60, 70, 80].map((y, i) => (
        <rect key={y} x="52" y={y} width={[62, 56, 64, 44, 52][i]} height="4.5" rx="2.25" fill="currentColor" opacity="0.22" />
      ))}
      <g transform="rotate(38 140 50)">
        <rect x="134" y="20" width="12" height="54" rx="3" fill="currentColor" />
        <path d="M134 74 h12 l-6 12z" fill="#FFD43B" />
      </g>
    </g>
  ),
};
