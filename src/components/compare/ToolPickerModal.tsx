import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Sparkles, Flame, Grid3x3 } from "lucide-react";

export type PickerTool = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  category: string | null;
  subcategory: string | null;
  tagline: string | null;
  pricing: string | null;
  tags?: string[] | null;
  featured?: boolean | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (t: PickerTool) => void;
  tools: PickerTool[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  excludeIds: Set<string>;
};

function score(t: PickerTool, q: string): number {
  if (!q) return 0;
  const s = q.toLowerCase();
  const name = t.name.toLowerCase();
  if (name === s) return 100;
  if (name.startsWith(s)) return 80;
  if (name.includes(s)) return 60;
  if (t.slug.toLowerCase().includes(s)) return 55;
  if ((t.tagline || "").toLowerCase().includes(s)) return 40;
  if ((t.category || "").toLowerCase().includes(s)) return 30;
  if ((t.subcategory || "").toLowerCase().includes(s)) return 25;
  if ((t.tags || []).some((tag) => tag.toLowerCase().includes(s))) return 20;
  return 0;
}

export function ToolPickerModal({ open, onClose, onSelect, tools, loading, error, onRetry, excludeIds }: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const available = useMemo(() => tools.filter((t) => !excludeIds.has(t.id)), [tools, excludeIds]);

  const filtered = useMemo(() => {
    if (!q.trim()) return available;
    return available
      .map((t) => ({ t, s: score(t, q.trim()) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.t);
  }, [available, q]);

  const featured = useMemo(() => available.filter((t) => t.featured).slice(0, 6), [available]);
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const t of available) if (t.category) set.add(t.category);
    return Array.from(set).slice(0, 10);
  }, [available]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-8 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Select an AI tool to compare"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl mt-4 md:mt-12 rounded-2xl border border-white/10 bg-[#0b0b0e] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 border-b border-white/10">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search AI tools by name, category, or tag…"
            className="flex-1 bg-transparent py-4 outline-none text-sm"
            aria-label="Search AI tools"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-sm">Unable to load tools.</div>
              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : q.trim() ? (
            filtered.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-sm font-medium">No tools found.</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Check your spelling or browse all tools below.
                </p>
                <button
                  onClick={() => setQ("")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2 text-sm"
                >
                  <Grid3x3 className="w-3.5 h-3.5" /> Browse all tools
                </button>
              </div>
            ) : (
              <ToolList tools={filtered} onSelect={(t) => { onSelect(t); onClose(); }} />
            )
          ) : (
            <div>
              {featured.length > 0 && (
                <Section title="Featured" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  <ToolList tools={featured} onSelect={(t) => { onSelect(t); onClose(); }} />
                </Section>
              )}
              {categories.length > 0 && (
                <Section title="Browse by category" icon={<Flame className="w-3.5 h-3.5" />}>
                  <div className="px-4 pb-3 flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setQ(c)}
                        className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] capitalize"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </Section>
              )}
              <Section title={`All tools (${available.length})`} icon={<Grid3x3 className="w-3.5 h-3.5" />}>
                <ToolList tools={available} onSelect={(t) => { onSelect(t); onClose(); }} />
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="pt-3">
      <div className="px-4 pb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

function ToolList({ tools, onSelect }: { tools: PickerTool[]; onSelect: (t: PickerTool) => void }) {
  return (
    <ul role="listbox" className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
      {tools.map((t) => (
        <li key={t.id}>
          <button
            role="option"
            aria-selected={false}
            onClick={() => onSelect(t)}
            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.06] focus:bg-white/[0.08] focus:outline-none"
          >
            {t.logo_url ? (
              <img src={t.logo_url} alt="" width={36} height={36} className="w-9 h-9 rounded-lg object-cover shrink-0" loading="lazy" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-white/10 shrink-0 grid place-items-center text-xs font-semibold">
                {t.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{t.name}</span>
                {t.featured && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-wider">Featured</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {t.tagline || t.category || t.subcategory || ""}
              </div>
            </div>
            {t.pricing && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground shrink-0 mt-0.5">
                {t.pricing}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
