import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { listBlogPosts } from "@/lib/content.functions";
import { LayoutGrid, List } from "lucide-react";
import { BlogIndexPending } from "@/components/skeletons";

const blogPostsQuery = queryOptions({
  queryKey: ["blog-posts"],
  queryFn: () => listBlogPosts(),
});

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(blogPostsQuery),
  head: () => ({
    meta: [
      { title: "AI Blog — Daily Tutorials, Reviews & Workflows | AI Blaze" },
      { name: "description", content: "Daily articles, tutorials, and deep-dives on AI tools, prompts, and workflows. Learn what's working in AI right now." },
      { name: "keywords", content: "AI blog, AI tutorials, AI tool reviews, AI workflows, prompt engineering, generative AI news, AI for creators, AI productivity tips, how to use ChatGPT, how to use Midjourney" },
      { property: "og:title", content: "AI Blog — AI Blaze" },
      { property: "og:description", content: "Daily writing about AI tools, prompts, and workflows." },
      { property: "og:url", content: "https://aiblaze.io/blog" },
      { name: "twitter:title", content: "AI Blog — AI Blaze" },
      { name: "twitter:description", content: "Daily writing about AI tools and prompts." },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/blog" }],
  }),
  component: BlogIndex,
  pendingComponent: BlogIndexPending,
  pendingMs: 200,
  pendingMinMs: 400,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">Couldn't load blog: {error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">No blog page found.</div>,
});

function BlogIndex() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { data } = useSuspenseQuery(blogPostsQuery);
  const posts = useMemo(() => data ?? [], [data]);
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-24 w-full">
        <span className="text-xs uppercase tracking-[0.2em] text-primary">Blog</span>
        <h1 className="font-display text-5xl md:text-6xl mt-3">Notes & tutorials</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">Fresh writing on AI tools, prompts, and what's working right now.</p>

        <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">{posts.length} published posts</p>
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {posts.map((p: any) => (
              <Link
                key={p.id}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="card-surface rounded-2xl border border-white/10 overflow-hidden hover:border-white/25 transition-colors"
              >
                {p.cover_url && <img src={p.cover_url} alt={p.title} className="w-full aspect-[16/9] object-cover" />}
                <div className="p-5">
                  <h2 className="font-semibold text-lg">{p.title}</h2>
                  {p.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>}
                  <div className="text-xs text-muted-foreground mt-3">{p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}</div>
                </div>
              </Link>
            ))}
            {posts.length === 0 && <p className="text-muted-foreground col-span-2">No posts yet — check back soon.</p>}
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-12 divide-y divide-white/10">
            {posts.map((p: any) => (
              <article key={p.id} className="pt-12 first:pt-0">
                <header>
                  <h2 className="font-display text-3xl md:text-4xl leading-tight">
                    <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:text-primary transition-colors">
                      {p.title}
                    </Link>
                  </h2>
                  <div className="text-xs text-muted-foreground mt-2">{p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}</div>
                </header>
                {p.cover_url && <img src={p.cover_url} alt={p.title} className="w-full max-h-[420px] object-cover rounded-2xl mt-5" />}
                {p.excerpt && <p className="text-lg text-muted-foreground mt-5">{p.excerpt}</p>}
                {p.body && (
                  <div className="prose prose-invert mt-5 whitespace-pre-wrap text-foreground/90 leading-relaxed max-w-none">
                    {p.body}
                  </div>
                )}
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="inline-flex items-center gap-1 mt-6 text-sm text-primary hover:underline">
                  Open full post →
                </Link>
              </article>
            ))}
            {posts.length === 0 && <p className="text-muted-foreground">No posts yet — check back soon.</p>}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
