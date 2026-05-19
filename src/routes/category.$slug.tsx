import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { categories, getCategory, toolsByCategory } from "@/data/tools";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ToolCard } from "@/components/ToolCard";
import { Search } from "lucide-react";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const c = loaderData.category;
    const count = toolsByCategory(c.slug).length;
    const title = `Best AI ${c.name} Tools (${count}+) — NeuroHub`;
    const desc = `${count} curated AI ${c.name.toLowerCase()} tools. ${c.blurb}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 158) },
        { property: "og:url", content: `/category/${c.slug}` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `/category/${c.slug}` }],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p>Category not found. <Link to="/" className="underline">Go home</Link></p>
    </div>
  ),
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const allTools = useMemo(() => toolsByCategory(category.slug), [category.slug]);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return allTools;
    return allTools.filter(
      (t) =>
        t.name.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle) ||
        t.tags.some((tag) => tag.toLowerCase().includes(needle)),
    );
  }, [allTools, q]);

  const others = categories.filter((c) => c.slug !== category.slug);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 pt-10 pb-16 w-full">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          ← Back to home
        </Link>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-12">
          {/* Sidebar — other categories */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Categories
            </div>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              <CatLink slug={category.slug} active>
                {category.name}
              </CatLink>
              {others.map((c) => (
                <CatLink key={c.slug} slug={c.slug}>
                  {c.name}
                </CatLink>
              ))}
            </nav>
            <div className="mt-6 hidden lg:block text-xs text-muted-foreground border-t border-border/60 pt-4">
              {allTools.length} tools in {category.name}
            </div>
          </aside>

          {/* Main */}
          <section>
            <h1 className="font-display text-5xl md:text-6xl">
              AI {category.name} Tools
            </h1>
            <p className="mt-3 text-muted-foreground max-w-3xl">
              {allTools.length} tools for {category.description.toLowerCase()}.
            </p>
            <p className="mt-3 text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {category.blurb}
            </p>

            <div className="mt-8 flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 max-w-xl">
              <Search className="w-4 h-4 text-muted-foreground ml-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${category.name.toLowerCase()} tools...`}
                className="flex-1 bg-transparent outline-none px-2 py-2 text-sm placeholder:text-muted-foreground"
              />
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              {filtered.length} of {allTools.length} tools
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function CatLink({
  slug, active, children,
}: { slug: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug }}
      className={
        "text-sm px-3 py-2 rounded-lg whitespace-nowrap transition-colors " +
        (active
          ? "bg-white/[0.06] text-foreground border border-white/10"
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]")
      }
    >
      {children}
    </Link>
  );
}
