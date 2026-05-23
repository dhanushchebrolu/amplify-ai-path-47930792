import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { learnTasks } from "@/data/learnTasks";
import { Copy, Check, Search } from "lucide-react";

export const Route = createFileRoute("/prompts")({
  head: () => ({
    meta: [
      { title: "AI Prompt Library — Ready-to-paste Prompts · NeuroHub" },
      { name: "description", content: "A growing library of expert AI prompts. Copy, paste, and ship — for writing, coding, design, video and more." },
      { property: "og:title", content: "AI Prompt Library — NeuroHub" },
      { property: "og:description", content: "Ready-to-paste prompts that actually work, across every major AI tool." },
    ],
    links: [{ rel: "canonical", href: "/prompts" }],
  }),
  component: PromptsPage,
});

const CATS = ["All", "Image", "Writing", "Video", "Coding", "Audio", "Design", "Productivity"] as const;

function PromptsPage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [q, setQ] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return learnTasks.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (q && !(t.title + t.tagline + t.prompt + t.tool.name).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [cat, q]);

  function copy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24 w-full">
        <header className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-primary">Prompts</span>
          <h1 className="font-display text-5xl md:text-6xl mt-3">The prompt library</h1>
          <p className="text-muted-foreground mt-4">
            Battle-tested prompts paired with the right tool for the job. Click a prompt to copy it — then ship.
          </p>
        </header>

        <div className="mt-10 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search prompts, tools, use-cases…"
              className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-sm placeholder:text-muted-foreground outline-none focus:border-white/25"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  cat === c ? "bg-primary text-primary-foreground border-primary" : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-5">
          {filtered.map((t) => (
            <article key={t.id} className="card-surface rounded-2xl border border-white/10 p-5 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold leading-tight">{t.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.category} · for <span className="text-foreground">{t.tool.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => copy(t.id, t.prompt)}
                  className="shrink-0 text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25"
                >
                  {copiedId === t.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <pre className="mt-4 text-xs whitespace-pre-wrap font-mono bg-black/30 rounded-xl p-4 border border-white/5 leading-relaxed line-clamp-6 flex-1">{t.prompt}</pre>
              <div className="mt-4 flex items-center justify-between">
                <a href={t.tool.website} target="_blank" rel="noopener sponsored" className="text-xs text-muted-foreground hover:text-foreground">
                  Open {t.tool.name} ↗
                </a>
                <a href={`/learn/task/${t.id}`} className="text-xs text-primary hover:underline">
                  Full guide →
                </a>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground mt-16">No prompts match those filters yet.</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
