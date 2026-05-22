import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getCatalogCategory, getCatalogSub, type CatalogCategory, type CatalogSub } from "@/data/catalog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { CatalogToolCard } from "@/components/CatalogToolCard";
import { Search } from "lucide-react";

export const Route = createFileRoute("/category/$slug/$sub")({
  loader: ({ params }): { category: CatalogCategory; sub: CatalogSub } => {
    const category = getCatalogCategory(params.slug);
    const sub = getCatalogSub(params.slug, params.sub);
    if (!category || !sub) throw notFound();
    return { category, sub };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { category, sub } = loaderData;
    const title = `Best ${sub.name} (${sub.tools.length}+) — NeuroHub`;
    const desc = `${sub.tools.length} curated ${sub.name.toLowerCase()} in ${category.name}. Compare and discover the right AI tool for the job.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 158) },
        { property: "og:url", content: `/category/${category.slug}/${sub.slug}` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `/category/${category.slug}/${sub.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: sub.name,
          numberOfItems: sub.tools.length,
          itemListElement: sub.tools.slice(0, 50).map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: t.name,
            url: t.website,
          })),
        }),
      }],
    };
  },
  component: SubPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p>Sub-category not found. <Link to="/" className="underline">Go home</Link></p>
    </div>
  ),
});

function SubPage() {
  const { category, sub } = Route.useLoaderData() as { category: CatalogCategory; sub: CatalogSub };
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return sub.tools;
    return sub.tools.filter((t) => t.name.toLowerCase().includes(n));
  }, [sub.tools, q]);

  const otherSubs = category.subs.filter((s) => s.slug !== sub.slug);


  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-16 w-full">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          <span>/</span>
          <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-foreground">{category.short}</Link>
          <span>/</span>
          <span className="text-foreground">{sub.name}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-12">
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {category.short}
            </div>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              <SubLink catSlug={category.slug} subSlug={sub.slug} active>{sub.name}</SubLink>
              {otherSubs.map((s) => (
                <SubLink key={s.slug} catSlug={category.slug} subSlug={s.slug}>{s.name}</SubLink>
              ))}
            </nav>
          </aside>

          <section>
            <h1 className="font-display text-4xl md:text-5xl">{sub.name}</h1>
            <p className="mt-3 text-muted-foreground max-w-3xl">
              {sub.tools.length} curated tools in {category.name}.
            </p>

            <div className="mt-6 flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 max-w-xl">
              <Search className="w-4 h-4 text-muted-foreground ml-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tools..."
                className="flex-1 bg-transparent outline-none px-2 py-2 text-sm placeholder:text-muted-foreground"
              />
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              {filtered.length} of {sub.tools.length}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((t, i) => (
                <CatalogToolCard key={`${t.name}-${i}`} tool={t} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SubLink({
  catSlug, subSlug, active, children,
}: { catSlug: string; subSlug: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      to="/category/$slug/$sub"
      params={{ slug: catSlug, sub: subSlug }}
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
