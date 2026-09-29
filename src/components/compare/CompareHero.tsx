import { Link } from "@tanstack/react-router";
import { ExternalLink, Share2, Link2, Bookmark, Printer, Check } from "lucide-react";
import { useState } from "react";
import type { ResolvedTool } from "@/lib/compare-matrix";

export function CompareHero({ tools, subtitle }: { tools: ResolvedTool[]; subtitle: string }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const names = tools.map((t) => t.tool.name);

  function copy() {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  function share() {
    if (typeof navigator === "undefined") return;
    if (navigator.share) navigator.share({ title: names.join(" vs "), url: window.location.href }).catch(() => {});
    else copy();
  }
  function bookmark() {
    try {
      const key = "aiblaze:saved-comparisons";
      const cur: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      const path = window.location.pathname;
      const next = cur.includes(path) ? cur.filter((p) => p !== path) : [...cur, path];
      localStorage.setItem(key, JSON.stringify(next));
      setSaved(next.includes(path));
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-card px-5 py-8 md:px-10 md:py-12">
      <div className="relative flex flex-wrap items-center justify-center gap-4 md:gap-8">
        {tools.map((t, i) => (
          <div key={t.tool.id} className="flex items-center gap-4 md:gap-8">
            {i > 0 && (
              <span className="font-display text-xl md:text-3xl text-muted-foreground/60 select-none">VS</span>
            )}
            <div className="flex flex-col items-center gap-2">
              {t.tool.logo_url ? (
                <img
                  src={t.tool.logo_url}
                  alt={`${t.tool.name} logo`}
                  width={64}
                  height={64}
                  loading={i < 2 ? "eager" : "lazy"}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover bg-foreground/5"
                />
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-foreground/10 grid place-items-center font-display text-xl">
                  {t.tool.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium">{t.tool.name}</span>
            </div>
          </div>
        ))}
      </div>

      <h1 className="relative mt-6 text-center font-display text-3xl md:text-5xl tracking-tight">
        {names.join(" vs ")}
      </h1>
      <p className="relative mt-3 text-center text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
        {subtitle}
      </p>

      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-2">
        {tools.map((t) => (
          <a
            key={t.tool.id}
            href={t.tool.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            Visit {t.tool.name} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ))}
        <HeroBtn onClick={share} icon={<Share2 className="w-3.5 h-3.5" />} label="Share" />
        <HeroBtn
          onClick={copy}
          icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
          label={copied ? "Copied" : "Copy link"}
        />
        <HeroBtn
          onClick={bookmark}
          icon={<Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />}
          label={saved ? "Saved" : "Bookmark"}
        />
        <HeroBtn
          onClick={() => typeof window !== "undefined" && window.print()}
          icon={<Printer className="w-3.5 h-3.5" />}
          label="Print"
        />
      </div>

      <div className="relative mt-5 flex flex-wrap justify-center gap-2 text-xs">
        {tools.map((t) => (
          <Link
            key={t.tool.id}
            to="/tool/$slug"
            params={{ slug: t.tool.slug }}
            className="rounded-full border border-foreground/10 px-3 py-1 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition"
          >
            {t.tool.name} profile
          </Link>
        ))}
      </div>
    </section>
  );
}

function HeroBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-foreground/[0.04] px-3.5 py-2 text-sm hover:bg-foreground/[0.09] transition print:hidden"
    >
      {icon} {label}
    </button>
  );
}
