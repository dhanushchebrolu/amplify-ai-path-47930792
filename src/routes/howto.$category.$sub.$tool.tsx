import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getCatalogCategory, getCatalogSub, type CatalogCategory, type CatalogSub, type CatalogTool } from "@/data/catalog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { CatalogLogo } from "@/components/CatalogLogo";
import { ArrowUpRight, Check, Copy, ExternalLink, Sparkles, Zap } from "lucide-react";

function toToolSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface LD { category: CatalogCategory; sub: CatalogSub; tool: CatalogTool }

export const Route = createFileRoute("/howto/$category/$sub/$tool")({
  loader: ({ params }): LD => {
    const category = getCatalogCategory(params.category);
    const sub = getCatalogSub(params.category, params.sub);
    const tool = sub?.tools.find((t) => toToolSlug(t.name) === params.tool);
    if (!category || !sub || !tool) throw notFound();
    return { category, sub, tool };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { tool, sub, category } = loaderData;
    const title = `How to use ${tool.name} for ${sub.name} — NeuroHub`;
    const desc = `Step-by-step guide to using ${tool.name} for ${sub.name.toLowerCase()} in ${category.name}. Ready-to-paste prompts inside.`;
    return {
      meta: [
        { title }, { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 158) },
      ],
      links: [{ rel: "canonical", href: `/howto/${category.slug}/${sub.slug}/${toToolSlug(tool.name)}` }],
    };
  },
  component: HowToPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p>Guide not found. <Link to="/" className="underline">Go home</Link></p>
    </div>
  ),
});

function buildPrompt(tool: CatalogTool, sub: CatalogSub) {
  return `You are an expert at using ${tool.name} for ${sub.name}.
Goal: produce a high-quality result for the use case: "${sub.name}".
Steps to follow:
1) Understand my input (paste it below).
2) Apply best-practice ${tool.name} settings for this use case.
3) Return the result + one short reason why this approach was chosen.

My input:
{PASTE YOUR INPUT HERE}`;
}

function HowToPage() {
  const { category, sub, tool } = Route.useLoaderData() as LD;
  const [copied, setCopied] = useState(false);
  const prompt = buildPrompt(tool, sub);

  function copyPrompt() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  let host = "";
  try { host = tool.website ? new URL(tool.website).hostname.replace(/^www\./, "") : ""; } catch { /* */ }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pt-10 pb-24 w-full">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-foreground">{category.short}</Link>
          <span>/</span>
          <Link to="/category/$slug/$sub" params={{ slug: category.slug, sub: sub.slug }} className="hover:text-foreground">{sub.name}</Link>
          <span>/</span>
          <span className="text-foreground">{tool.name}</span>
        </nav>

        <header className="mt-8 card-surface p-7 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-6 md:items-center">
          <CatalogLogo name={tool.name} website={tool.website} size={72} />
          <div className="flex-1 min-w-0">
            <span className="text-xs uppercase tracking-wider text-primary">How to use</span>
            <h1 className="font-display text-4xl md:text-5xl mt-2">{tool.name} for {sub.name}</h1>
            <p className="text-muted-foreground mt-2">{host || "Official tool"} · {category.short}</p>
          </div>
          {tool.website && (
            <a
              href={tool.website} target="_blank" rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-3 font-medium text-sm hover:opacity-90"
            >
              Open {tool.name} <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </header>

        <div className="mt-10 grid lg:grid-cols-5 gap-8">
          <section className="lg:col-span-3 space-y-8">
            <div className="card-surface p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Ready-to-paste prompt
                </h2>
                <button onClick={copyPrompt} className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25">
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-mono bg-black/30 rounded-xl p-5 border border-white/5 leading-relaxed">{prompt}</pre>
            </div>

            <div className="card-surface p-6 rounded-2xl border border-white/10">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Step-by-step</h2>
              <ol className="mt-4 space-y-3">
                {[
                  `Open ${tool.name} (${host || "official site"}) and create a free account if needed.`,
                  `Find the feature that matches "${sub.name}" — usually in the main dashboard or under New / Create.`,
                  `Paste the ready-to-paste prompt above. Replace {PASTE YOUR INPUT HERE} with your real input.`,
                  `Generate, review the output, then iterate by asking for "a more concise version" or "a different style".`,
                  `Export or share the final result. Save your winning prompt for next time.`,
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-primary/15 text-primary grid place-items-center text-sm font-semibold">{i + 1}</span>
                    <span className="text-sm text-foreground/90 leading-relaxed pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-surface p-6 rounded-2xl border border-white/10">
              <h2 className="text-lg font-semibold">Tips for {sub.name.toLowerCase()}</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Be specific about audience, tone, and length in your prompt.</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Ask for 3 variants instead of 1 — pick the best.</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> If results feel generic, give an example of what "good" looks like.</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Save winning prompts to a personal library so you don't rewrite them.</li>
              </ul>
            </div>
          </section>

          <aside className="lg:col-span-2 space-y-6">
            <div className="card-surface p-5 rounded-2xl border border-white/10">
              <h3 className="text-sm font-semibold mb-3">Other tools in {sub.name}</h3>
              <ul className="space-y-2">
                {sub.tools.filter((t) => t.name !== tool.name).slice(0, 6).map((t) => (
                  <li key={t.name}>
                    <Link
                      to="/howto/$category/$sub/$tool"
                      params={{ category: category.slug, sub: sub.slug, tool: toToolSlug(t.name) }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] text-sm"
                    >
                      <CatalogLogo name={t.name} website={t.website} size={28} />
                      <span className="truncate flex-1">{t.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/category/$slug/$sub" params={{ slug: category.slug, sub: sub.slug }}
                className="mt-4 block text-xs text-primary hover:underline text-center"
              >
                See all {sub.tools.length} tools →
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
