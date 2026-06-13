import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { searchCatalog } from "@/data/catalog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { CatalogToolCard } from "@/components/CatalogToolCard";
import { Search } from "lucide-react";

export const Route = createFileRoute("/search")({
  validateSearch: (input: Record<string, unknown>): { q: string } => ({
    q: typeof input.q === "string" ? input.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Search AI Tools — AI Blaze" },
      { name: "description", content: "Search 2,750+ AI tools across 15 categories." },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/search" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q: initialQ } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(initialQ);

  const hits = useMemo(() => searchCatalog(initialQ, 60), [initialQ]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: { q } });
  }

  // Group hits by sub-category for clearer browsing
  const groups = useMemo(() => {
    const map = new Map<string, { catSlug: string; subSlug: string; subName: string; catShort: string; tools: typeof hits[number]["tool"][] }>();
    for (const h of hits) {
      const key = `${h.catSlug}/${h.subSlug}`;
      if (!map.has(key)) map.set(key, { catSlug: h.catSlug, subSlug: h.subSlug, subName: h.subName, catShort: h.catShort, tools: [] });
      map.get(key)!.tools.push(h.tool);
    }
    return Array.from(map.values());
  }, [hits]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-20 w-full">
        <h1 className="font-display text-4xl md:text-5xl">Search AI tools</h1>

        <form onSubmit={submit} className="mt-6 mx-auto max-w-2xl flex items-center gap-1 p-1.5 rounded-full bg-white/[0.04] border border-white/10 focus-within:border-white/25 transition-colors">
          <Search className="w-4 h-4 text-muted-foreground ml-4" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Search by tool, category, or use case..."
            className="flex-1 bg-transparent outline-none px-3 py-2 text-sm placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          {initialQ ? `${hits.length} results for "${initialQ}"` : "Type to search across 2,750+ AI tools."}
        </p>

        {initialQ && hits.length === 0 && (
          <div className="mt-12 text-center text-muted-foreground">
            <p>No tools match "{initialQ}".</p>
            <Link to="/browse" className="text-foreground underline mt-3 inline-block">Browse all categories</Link>
          </div>
        )}

        <div className="mt-10 space-y-12">
          {groups.map((g) => (
            <section key={`${g.catSlug}/${g.subSlug}`}>
              <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
                <div>
                  <Link
                    to="/category/$slug/$sub"
                    params={{ slug: g.catSlug, sub: g.subSlug }}
                    className="font-display text-2xl hover:underline"
                  >
                    {g.subName}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.catShort}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {g.tools.map((t, i) => (
                  <CatalogToolCard key={`${t.name}-${i}`} tool={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
