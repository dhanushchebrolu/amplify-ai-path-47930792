import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { catalog, getCatalogCategory, type CatalogCategory } from "@/data/catalog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SubcategoryCard } from "@/components/SubcategoryCard";

export const Route = createFileRoute("/category/$slug/")({
  loader: ({ params }): { category: CatalogCategory } => {
    const category = getCatalogCategory(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const c = loaderData.category;
    const total = c.subs.reduce((a, s) => a + s.tools.length, 0);
    const title = `Best ${c.name} (${total}+) — AI Blaze`;
    const desc = `${total} curated ${c.name.toLowerCase()} across ${c.subs.length} sub-categories. Compare features, pricing, and find the right AI for your workflow.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 158) },
        { property: "og:url", content: `https://aiblaze.io/category/${c.slug}` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `https://aiblaze.io/category/${c.slug}` }],
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
  const { category } = Route.useLoaderData() as { category: CatalogCategory };
  const others = catalog.filter((c) => c.slug !== category.slug);
  const total = category.subs.reduce((a, s) => a + s.tools.length, 0);


  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 pt-10 pb-16 w-full">
        <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          ← All categories
        </Link>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-12">
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Categories</div>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              <CatLink slug={category.slug} active>{category.short}</CatLink>
              {others.map((c) => (
                <CatLink key={c.slug} slug={c.slug}>{c.short}</CatLink>
              ))}
            </nav>
          </aside>

          <section>
            <h1 className="font-display text-5xl md:text-6xl">{category.name}</h1>
            <p className="mt-3 text-muted-foreground max-w-3xl">
              {total}+ tools across {category.subs.length} sub-categories. Pick a sub-category to dive in.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.subs.map((sub) => (
                <SubcategoryCard key={sub.slug} catSlug={category.slug} sub={sub} />
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
