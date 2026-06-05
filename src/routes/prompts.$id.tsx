import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getPromptById } from "@/lib/content.functions";
import { ArrowLeft, Check, Copy, ExternalLink, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

const promptQuery = (id: string) => queryOptions({
  queryKey: ["prompt", id],
  queryFn: async () => {
    const prompt = await getPromptById({ data: { id } });
    return prompt ?? null;
  },
});

export const Route = createFileRoute("/prompts/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(promptQuery(params.id)),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${(loaderData as any)?.title ?? "Prompt"} — Full Guide · AIBlaze` },
      { name: "description", content: (loaderData as any)?.body?.slice(0, 150) ?? "Prompt guide" },
      { property: "og:title", content: `${(loaderData as any)?.title ?? "Prompt"} — Full Guide · AIBlaze` },
      { property: "og:description", content: (loaderData as any)?.body?.slice(0, 150) ?? "Prompt guide" },
      ...((loaderData as any)?.image_url ? [{ property: "og:image", content: (loaderData as any).image_url }] : []),
    ],
    links: [{ rel: "canonical", href: `/prompts/${(loaderData as any)?.id ?? ""}` }],
  }),
  component: PromptGuidePage,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">Couldn't load guide: {error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Prompt guide not found.</div>,
});

function PromptGuidePage() {
  const { id } = Route.useParams();
  const { data: prompt } = useSuspenseQuery(promptQuery(id));
  const [copied, setCopied] = useState(false);

  if (!prompt) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-24 text-center w-full">
          <h1 className="font-display text-4xl">Prompt not found</h1>
          <p className="text-muted-foreground mt-3">This prompt may have been removed.</p>
          <Link to="/prompts" className="inline-flex items-center gap-2 mt-6 text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to prompts
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const steps = [
    `Open ${prompt.tool_name ?? "your chosen AI tool"}${prompt.tool_url ? " and start a fresh session" : " and create a new session"}.`,
    `Paste the full prompt exactly as written below, then replace any placeholders with your specific subject or idea.`,
    `Run the first output and check whether the style, framing, and detail level match your goal.`,
    `If needed, iterate once with a tighter instruction: ask for stronger composition, more detail, or a different tone.`,
    `Save the winning result and keep this prompt as a reusable template in your library.`,
  ];

  function copyPrompt() {
    navigator.clipboard.writeText(prompt!.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-10 pb-24 w-full">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/prompts" className="hover:text-foreground">Prompts</Link>
          <span>/</span>
          <span className="text-foreground">{prompt.title}</span>
        </nav>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {prompt.category && <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10">{prompt.category}</span>}
              {prompt.tool_name && <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10">{prompt.tool_name}</span>}
            </div>
            <h1 className="font-display text-5xl md:text-6xl mt-3 leading-tight">{prompt.title}</h1>
            <p className="text-lg text-muted-foreground mt-3 max-w-2xl">A full guide with the prompt, suggested tool, and a clean step-by-step workflow.</p>
          </div>
          {prompt.tool_url && (
            <a
              href={prompt.tool_url}
              target="_blank"
              rel="noopener sponsored"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              Open {prompt.tool_name ?? "tool"} <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </header>

        <div className="mt-10 grid lg:grid-cols-5 gap-8">
          <section className="lg:col-span-3 space-y-8">
            <div className="card-surface p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Ready-to-paste prompt</h2>
                <button onClick={copyPrompt} className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25">
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-mono bg-black/30 rounded-xl p-5 border border-white/5 leading-relaxed">{prompt.body}</pre>
            </div>

            <div className="card-surface p-6 rounded-2xl border border-white/10">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Step-by-step guide</h2>
              <ol className="mt-4 space-y-3">
                {steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-primary/15 text-primary grid place-items-center text-sm font-semibold">{index + 1}</span>
                    <span className="text-sm text-foreground/90 leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <aside className="lg:col-span-2 space-y-6">
            {prompt.image_url && (
              <figure className="rounded-2xl overflow-hidden border border-white/10 bg-card">
                <img src={prompt.image_url} alt={prompt.title} className="w-full aspect-[3/2] object-cover" />
                <figcaption className="text-xs text-muted-foreground p-4 border-t border-white/5">Reference image for this prompt.</figcaption>
              </figure>
            )}

            <div className="card-surface p-5 rounded-2xl border border-white/10">
              <h3 className="text-sm font-semibold mb-3">Prompt details</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {prompt.category && <p><span className="text-foreground">Category:</span> {prompt.category}</p>}
                {prompt.tool_name && <p><span className="text-foreground">Recommended tool:</span> {prompt.tool_name}</p>}
                {prompt.tags?.length > 0 && <p><span className="text-foreground">Tags:</span> {prompt.tags.join(", ")}</p>}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <Link to="/prompts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to prompts
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}