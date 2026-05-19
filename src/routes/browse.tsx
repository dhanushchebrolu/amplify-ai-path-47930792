import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { categories, tools, type Pricing } from "@/data/tools";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ToolCard } from "@/components/ToolCard";
import { Search } from "lucide-react";

interface BrowseSearch {
  q?: string;
  cat?: string;
  price?: Pricing;
}

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): BrowseSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    cat: typeof search.cat === "string" ? search.cat : undefined,
    price:
      search.price === "Free" || search.price === "Freemium" || search.price === "Paid"
        ? search.price
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse all AI tools — NeuroHub" },
      { name: "description", content: "Browse the full directory of AI tools. Filter by category, pricing, and use case to find the right tool for your workflow." },
      { property: "og:title", content: "Browse all AI tools — NeuroHub" },
      { property: "og:description", content: "Browse the full directory of AI tools." },
      { property: "og:url", content: "/browse" },
    ],
    links: [{ rel: "canonical", href: "/browse" }],
  }),
  component: Browse,
});

function Browse() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const [cat, setCat] = useState<string | undefined>(search.cat);
  const [price, setPrice] = useState<Pricing | undefined>(search.price);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tools.filter((t) => {
      if (cat && t.category !== cat) return false;
      if (price && t.pricing !== price) return false;
      if (!needle) return true;
      return (
        t.name.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle) ||
        t.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [q, cat, price]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-20 w-full">
        <div className="mb-3">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
        <h1 className="font-display text-5xl md:text-6xl">Browse all AI tools</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          {tools.length} curated tools across {categories.length} categories. Filter to narrow down.
        </p>

        <div className="mt-8 flex items-center gap-2 p-1.5 rounded-full bg-white/[0.04] border border-white/10 max-w-2xl">
          <Search className="w-4 h-4 text-muted-foreground ml-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools..."
            className="flex-1 bg-transparent outline-none px-2 py-2 text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <FilterPill active={!cat} onClick={() => setCat(undefined)}>All categories</FilterPill>
          {categories.map((c) => (
            <FilterPill key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              {c.name}
            </FilterPill>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <FilterPill active={!price} onClick={() => setPrice(undefined)}>Any pricing</FilterPill>
          {(["Free", "Freemium", "Paid"] as Pricing[]).map((p) => (
            <FilterPill key={p} active={price === p} onClick={() => setPrice(p)}>{p}</FilterPill>
          ))}
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          {filtered.length} tool{filtered.length === 1 ? "" : "s"}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function FilterPill({
  active, onClick, children,
}: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "text-xs px-3 py-1.5 rounded-full border transition-colors " +
        (active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white/[0.04] text-muted-foreground border-white/10 hover:text-foreground hover:border-white/20")
      }
    >
      {children}
    </button>
  );
}
