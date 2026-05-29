import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { listBlogPosts } from "@/lib/content.functions";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — NeuroHub" },
      { name: "description", content: "Daily articles, tutorials, and thoughts on AI tools, prompts, and workflows." },
      { property: "og:title", content: "Blog — NeuroHub" },
      { property: "og:description", content: "Daily writing about AI tools and prompts." },
    ],
  }),
  component: BlogIndex,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">Couldn't load blog: {error.message}</div>,
});

function BlogIndex() {
  const { data, isLoading } = useQuery({ queryKey: ["blog-posts"], queryFn: () => listBlogPosts() });
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-24 w-full">
        <span className="text-xs uppercase tracking-[0.2em] text-primary">Blog</span>
        <h1 className="font-display text-5xl md:text-6xl mt-3">Notes & tutorials</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">Fresh writing on AI tools, prompts, and what's working right now.</p>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {isLoading && <div className="text-muted-foreground">Loading…</div>}
          {(data ?? []).map((p: any) => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="card-surface rounded-2xl border border-white/10 overflow-hidden hover:border-white/25 transition-colors">
              {p.cover_url && <img src={p.cover_url} alt="" className="w-full aspect-[16/9] object-cover" />}
              <div className="p-5">
                <h2 className="font-semibold text-lg">{p.title}</h2>
                {p.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>}
                <div className="text-xs text-muted-foreground mt-3">{p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}</div>
              </div>
            </Link>
          ))}
          {!isLoading && (data?.length ?? 0) === 0 && <p className="text-muted-foreground col-span-2">No posts yet — check back soon.</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
