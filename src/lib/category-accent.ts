import {
  PenLine, Image, Clapperboard, AudioLines, MessagesSquare, Megaphone, Search,
  Code2, Palette, Share2, Briefcase, FileSpreadsheet, UserRoundSearch, GraduationCap,
  ShoppingBag, Sparkles, type LucideIcon,
} from "lucide-react";

/** Accent classes defined in styles.css (.cat-*): set --cat and --cat-tint. */
export type CategoryAccent = "blue" | "violet" | "purple" | "cyan" | "indigo" | "orange" | "green";

// A deliberately small palette, repeated by theme, so the grid reads as one
// system rather than a different loud colour per card.
const ACCENTS: Record<string, { accent: CategoryAccent; icon: LucideIcon }> = {
  "ai-writing-tools": { accent: "blue", icon: PenLine },
  "ai-image-tools": { accent: "violet", icon: Image },
  "ai-video-tools": { accent: "purple", icon: Clapperboard },
  "ai-audio-voice-tools": { accent: "cyan", icon: AudioLines },
  "ai-chatbots-assistants": { accent: "indigo", icon: MessagesSquare },
  "ai-marketing-tools": { accent: "orange", icon: Megaphone },
  "ai-seo-tools": { accent: "green", icon: Search },
  "ai-coding-developer-tools": { accent: "blue", icon: Code2 },
  "ai-design-ui-ux-tools": { accent: "violet", icon: Palette },
  "ai-social-media-tools": { accent: "orange", icon: Share2 },
  "ai-business-tools": { accent: "indigo", icon: Briefcase },
  "ai-office-tools": { accent: "green", icon: FileSpreadsheet },
  "ai-resume-hr-tools": { accent: "cyan", icon: UserRoundSearch },
  "ai-education-learning-tools": { accent: "purple", icon: GraduationCap },
  "ai-e-commerce-tools": { accent: "orange", icon: ShoppingBag },
};

const FALLBACK: CategoryAccent[] = ["blue", "violet", "indigo", "cyan", "purple"];

export function categoryAccent(slug: string): { className: string; icon: LucideIcon } {
  const known = ACCENTS[slug];
  if (known) return { className: `cat-${known.accent}`, icon: known.icon };
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return { className: `cat-${FALLBACK[h % FALLBACK.length]}`, icon: Sparkles };
}
