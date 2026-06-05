import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { listPrompts } from "@/lib/content.functions";
import { Copy, Check, Search, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/prompts/")({
  head: () => ({
    meta: [
      { title: "AI Prompt Library — Ready-to-Paste Prompts | AIBlaze" },
      { name: "description", content: "Battle-tested AI prompts for ChatGPT, Midjourney, Sora, Claude, Gemini and more. Copy, paste, and ship — with full step-by-step guides." },
      { name: "keywords", content: "AI prompts, ChatGPT prompts, Midjourney prompts, Sora prompts, prompt library, prompt engineering, free AI prompts, image prompts, video prompts, writing prompts, coding prompts, business prompts" },
      { property: "og:title", content: "AI Prompt Library | AIBlaze" },
      { property: "og:description", content: "Ready-to-paste prompts for ChatGPT, Midjourney, Sora and more — with full guides." },
      { property: "og:url", content: "https://aiblaze.io/prompts" },
      { name: "twitter:title", content: "AI Prompt Library | AIBlaze" },
      { name: "twitter:description", content: "Ready-to-paste AI prompts with full guides." },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/prompts" }],
  }),

  component: PromptsPage,
});

const CATS = ["All", "Image", "Writing", "Video", "Coding", "Audio", "Design", "Business", "Productivity"] as const;

function PromptsPage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [q, setQ] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { data } = useQuery({ queryKey: ["prompts"], queryFn: () => listPrompts() });

  const filtered = useMemo(() => {
    return (data ?? []).filter((t: any) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (q && !((t.title ?? "") + (t.body ?? "") + (t.tool_name ?? "")).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [data, cat, q]);

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
          <p className="text-muted-foreground mt-4">Battle-tested prompts paired with the right tool. Click Copy — then ship.</p>
        </header>

        <div className="mt-10 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prompts, tools…"
              className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25" />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-5">
          {filtered.map((t: any) => (
            <article key={t.id} className="card-surface rounded-2xl border border-white/10 p-5 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold leading-tight">{t.title}</h3>
                  {(t.category || t.tool_name) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.category}{t.tool_name && <> · for <span className="text-foreground">{t.tool_name}</span></>}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <button onClick={() => copy(t.id, t.body)}
                    className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25">
                    {copiedId === t.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                  <Link
                    to="/prompts/$id"
                    params={{ id: t.id }}
                    className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90"
                  >
                    Full Guide <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              {t.image_url && (
                <img src={t.image_url} alt="" className="mt-4 w-full rounded-xl border border-white/10 object-cover max-h-56" />
              )}
              <pre className="mt-4 text-xs whitespace-pre-wrap font-mono bg-black/30 rounded-xl p-4 border border-white/5 leading-relaxed line-clamp-6 flex-1">{t.body}</pre>
              {t.tool_url && (
                <div className="mt-4">
                  <a href={t.tool_url} target="_blank" rel="noopener sponsored" className="text-xs text-muted-foreground hover:text-foreground">
                    Open {t.tool_name ?? "tool"} ↗
                  </a>
                </div>
              )}
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
