import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { listAllToolsForCompare } from "@/lib/compare.functions";
import { canonicalMatchup } from "@/lib/compare-utils";
import { ToolPickerModal, type PickerTool } from "@/components/compare/ToolPickerModal";
import { X, GitCompareArrows, Plus, ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/compare/")({
  head: () => ({
    meta: [
      { title: "Compare AI Tools Side-by-Side — Pricing, Features & More | AI Blaze" },
      { name: "description", content: "Compare up to 4 AI tools side-by-side. See pricing, models, features, integrations, pros and cons in one clean, shareable comparison." },
      { property: "og:title", content: "Compare AI Tools Side-by-Side — AI Blaze" },
      { property: "og:description", content: "Pick any 2–4 AI tools and get a data-rich, shareable comparison instantly." },
      { property: "og:url", content: "https://aiblaze.io/compare" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Compare AI Tools Side-by-Side — AI Blaze" },
      { name: "twitter:description", content: "Compare up to 4 AI tools side-by-side." },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/compare" }],
  }),
  component: ComparePage,
});

function ComparePage() {
  const navigate = useNavigate();
  const loadAll = useServerFn(listAllToolsForCompare);

  const [allTools, setAllTools] = useState<PickerTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PickerTool[]>([]);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await loadAll();
      setAllTools(rows as PickerTool[]);
    } catch {
      setError("Unable to load tools.");
    } finally {
      setLoading(false);
    }
  }, [loadAll]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const excludeIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

  function assignSlot(t: PickerTool) {
    if (pickerSlot === null) return;
    setSelected((prev) => {
      const next = [...prev];
      // Fill up to the slot index with existing values, then set
      while (next.length < pickerSlot) next.push(next[next.length]); // pad (rare)
      next[pickerSlot] = t;
      // Compact undefined and dedupe
      return next.filter(Boolean).filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i).slice(0, 4);
    });
    setPickerSlot(null);
  }

  function removeTool(id: string) {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  }

  function swap(i: number, j: number) {
    setSelected((prev) => {
      if (!prev[i] || !prev[j]) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function goCompare() {
    if (selected.length < 2) return;
    const matchup = canonicalMatchup(selected.map((s) => s.slug));
    navigate({ to: "/compare/$matchup", params: { matchup } });
  }

  const slotsView = [0, 1, 2, 3];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
            <GitCompareArrows className="w-3.5 h-3.5" /> Compare up to 4 AI tools
          </div>
          <h1 className="font-display text-5xl md:text-6xl mt-5">Which AI tool is right for you?</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Pick any 2–4 AI tools and get a data-rich, side-by-side breakdown of pricing, models,
            features, integrations, pros and cons.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {slotsView.map((i) => {
              const t = selected[i];
              if (t) {
                return (
                  <div key={t.id} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex flex-col items-center text-center">
                    <button
                      onClick={() => removeTool(t.id)}
                      aria-label={`Remove ${t.name}`}
                      className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-white/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {i > 0 && (
                      <button
                        onClick={() => swap(i - 1, i)}
                        aria-label={`Swap with tool ${i}`}
                        className="absolute top-2 left-2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-white/10"
                        title="Swap position"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {t.logo_url ? (
                      <img src={t.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center text-sm font-semibold">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div className="mt-2 font-medium text-sm truncate w-full">{t.name}</div>
                    {t.category && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">{t.category}</div>
                    )}
                    <button
                      onClick={() => setPickerSlot(i)}
                      className="mt-3 text-[11px] text-primary hover:underline"
                    >
                      Replace
                    </button>
                  </div>
                );
              }
              const disabled = i > selected.length; // must fill in order
              return (
                <button
                  key={i}
                  onClick={() => !disabled && setPickerSlot(i)}
                  disabled={disabled}
                  className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 h-[140px] flex flex-col items-center justify-center text-xs text-muted-foreground hover:bg-white/[0.05] hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={`Add tool ${i + 1}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] grid place-items-center mb-2">
                    <Plus className="w-4 h-4" />
                  </div>
                  Add tool {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={goCompare}
              disabled={selected.length < 2}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <GitCompareArrows className="w-4 h-4" />
              Compare {selected.length >= 2 ? `${selected.length} tools` : "(pick 2+)"}
            </button>
            <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground">
              Or browse all tools →
            </Link>
          </div>

          {error && !loading && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-center">
              Unable to load tools.{" "}
              <button onClick={fetchAll} className="text-primary hover:underline ml-2">Retry</button>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-5xl px-6 mt-16 mb-20">
          <h2 className="font-display text-2xl">How it works</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { t: "Search", d: "Type any AI tool, category, or use case." },
              { t: "Select 2–4", d: "Add tools to your comparison lineup." },
              { t: "Compare", d: "Get a full side-by-side breakdown with a shareable URL." },
            ].map((s) => (
              <div key={s.t} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-sm font-semibold">{s.t}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.d}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />

      <ToolPickerModal
        open={pickerSlot !== null}
        onClose={() => setPickerSlot(null)}
        onSelect={assignSlot}
        tools={allTools}
        loading={loading}
        error={error}
        onRetry={fetchAll}
        excludeIds={excludeIds}
      />
    </div>
  );
}
