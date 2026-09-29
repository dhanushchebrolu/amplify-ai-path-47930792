import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getTask, randomTaskId } from "@/data/learnTasks";
import { ArrowLeft, ArrowRight, Clock, Copy, ExternalLink, Sparkles, Zap, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/learn/task/$id")({
  head: ({ params }) => {
    const t = getTask(params.id);
    const title = t ? `${t.title} — Learn with ${t.tool.name} · AI Blaze` : "Task — AI Blaze";
    const desc = t?.tagline ?? "Try a new AI workflow.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(t ? [{ property: "og:image", content: t.reference.url }] : []),
      ],
      links: [{ rel: "canonical", href: `/learn/task/${params.id}` }],
    };
  },
  component: TaskPage,
  notFoundComponent: () => <div className="p-10 text-center">Task not found.</div>,
});

function TaskPage() {
  const { id } = Route.useParams();
  const task = getTask(id);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-20 text-center w-full">
          <h1 className="text-3xl font-semibold">Task not found</h1>
          <Link to="/learn/spin" className="mt-6 inline-flex items-center gap-2 text-primary-ink">← Back to Spin</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  function copyPrompt() {
    navigator.clipboard.writeText(task!.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-10 pb-24 w-full">
        <nav className="text-sm text-muted-foreground flex items-center gap-2">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          {typeof document !== "undefined" && document.referrer.includes("/prompts") ? (
            <Link to="/prompts" className="hover:text-foreground">Prompts</Link>
          ) : (
            <Link to="/learn/spin" className="hover:text-foreground">Learn New</Link>
          )}
          <span>/</span>
          <span className="text-foreground">{task.title}</span>
        </nav>

        <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded-full bg-foreground/[0.06] border border-foreground/10">{task.category}</span>
              <span className="px-2 py-0.5 rounded-full bg-foreground/[0.06] border border-foreground/10">{task.difficulty}</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {task.minutes} min</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl mt-3 leading-tight">{task.title}</h1>
            <p className="text-lg text-muted-foreground mt-3 max-w-2xl">{task.tagline}</p>
          </div>
          <a
            href={task.tool.website}
            target="_blank"
            rel="noopener sponsored"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:scale-[1.02] transition-transform"
          >
            Open {task.tool.name} <ExternalLink className="w-4 h-4" />
          </a>
        </header>

        <div className="mt-10 grid lg:grid-cols-5 gap-8">
          <section className="lg:col-span-3 space-y-8">
            <div className="card-surface p-6 rounded-2xl border border-foreground/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary-ink" /> Ready-to-paste prompt</h2>
                <button onClick={copyPrompt} className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/10 hover:border-foreground/25">
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted rounded-xl p-5 border border-foreground/5 leading-relaxed">{task.prompt}</pre>
            </div>

            <div className="card-surface p-6 rounded-2xl border border-foreground/10">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2"><Zap className="w-4 h-4 text-primary-ink" /> Step-by-step guide</h2>
              <ol className="mt-4 space-y-3">
                {task.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-primary/15 text-primary-ink grid place-items-center text-sm font-semibold">{i + 1}</span>
                    <span className="text-sm text-foreground/90 leading-relaxed pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <aside className="lg:col-span-2 space-y-6">
            <figure className="rounded-2xl overflow-hidden border border-foreground/10 bg-card">
              {task.reference.type === "video" ? (
                <video src={task.reference.url} controls className="w-full aspect-video object-cover" />
              ) : (
                <img src={task.reference.url} alt={task.reference.caption} className="w-full aspect-[3/2] object-cover" />
              )}
              <figcaption className="text-xs text-muted-foreground p-4 border-t border-foreground/5">
                {task.reference.caption}
              </figcaption>
            </figure>

            <div className="card-surface p-5 rounded-2xl border border-foreground/10">
              <h3 className="text-sm font-semibold mb-3">Keep playing</h3>
              <div className="grid grid-cols-3 gap-2">
                <Link to="/learn/spin" className="text-xs px-3 py-2 rounded-lg border border-foreground/10 hover:border-foreground/25 text-center">Spin</Link>
                <Link to="/learn/scratch" className="text-xs px-3 py-2 rounded-lg border border-foreground/10 hover:border-foreground/25 text-center">Scratch</Link>
                <Link to="/learn/swipe" className="text-xs px-3 py-2 rounded-lg border border-foreground/10 hover:border-foreground/25 text-center">Swipe</Link>
              </div>
              <button
                onClick={() => navigate({ to: "/learn/task/$id", params: { id: randomTaskId(task.id) } })}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-foreground/[0.06] border border-foreground/10 text-sm hover:bg-foreground/[0.1]"
              >
                Surprise me <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <Link to="/learn/spin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Learn New
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
