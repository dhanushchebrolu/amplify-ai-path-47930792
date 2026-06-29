import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { catalog, getCatalogCategory, type CatalogCategory } from "@/data/catalog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SubcategoryCard } from "@/components/SubcategoryCard";
import { SeoLongForm } from "@/components/SeoLongForm";
import { RichSeoBlock } from "@/components/RichSeoBlock";
import { buildCategoryFallback } from "@/lib/category-seo-content";
import { getSeoContent, type SeoContentRow } from "@/lib/seo.functions";

export const Route = createFileRoute("/category/$slug/")({
  loader: async ({ params }): Promise<{ category: CatalogCategory; seo: SeoContentRow | null }> => {
    const category = getCatalogCategory(params.slug);
    if (!category) throw notFound();
    const seo = await getSeoContent({ data: { kind: "category", slugPath: params.slug } });
    return { category, seo };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const c = loaderData.category;
    const seo = loaderData.seo;
    const total = c.subs.reduce((a, s) => a + s.tools.length, 0);
    const fallbackTitle = `Best ${c.name} (${total}+) — AI Blaze`;
    const fallbackDesc = `${total} curated ${c.name.toLowerCase()} across ${c.subs.length} sub-categories. Compare features, pricing, and find the right AI for your workflow.`;
    const title = seo?.seo_title ?? fallbackTitle;
    const desc = (seo?.seo_description ?? fallbackDesc).slice(0, 158);
    const url = `https://aiblaze.io/category/${c.slug}`;
    const ogTitle = seo?.og_title ?? title;
    const ogDesc = (seo?.og_description ?? desc).slice(0, 158);
    const twTitle = seo?.twitter_title ?? ogTitle;
    const twDesc = (seo?.twitter_description ?? ogDesc).slice(0, 158);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
        { property: "og:title", content: ogTitle },
        { property: "og:description", content: ogDesc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: twTitle },
        { name: "twitter:description", content: twDesc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: (() => {
        const blocks: unknown[] =
          seo?.structured_data && Array.isArray(seo.structured_data)
            ? (seo.structured_data as unknown[]).slice()
            : [];
        // FAQPage — prefer DB FAQs, fall back to deterministic generator.
        const dbFaqs = seo?.long_form?.faqs;
        const fallback = !dbFaqs?.length ? buildCategoryFallback(c) : null;
        const faqs = dbFaqs?.length ? dbFaqs : fallback?.faqs ?? [];
        if (faqs.length > 0) {
          blocks.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f: any) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          });
        }
        // CollectionPage + ItemList — every sub-category as an item.
        blocks.push({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description: desc,
          url,
          isPartOf: { "@type": "WebSite", name: "AI Blaze", url: "https://aiblaze.io" },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: c.subs.length,
            itemListElement: c.subs.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://aiblaze.io/category/${c.slug}/${s.slug}`,
              name: s.name,
            })),
          },
        });
        // BreadcrumbList
        blocks.push({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://aiblaze.io/" },
            { "@type": "ListItem", position: 2, name: "Browse", item: "https://aiblaze.io/browse" },
            { "@type": "ListItem", position: 3, name: c.name, item: url },
          ],
        });
        return blocks.map((b) => ({ type: "application/ld+json", children: JSON.stringify(b) }));
      })(),
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
  const { category, seo } = Route.useLoaderData() as { category: CatalogCategory; seo: SeoContentRow | null };
  const others = catalog.filter((c) => c.slug !== category.slug);
  const total = category.subs.reduce((a, s) => a + s.tools.length, 0);
  const headline = seo?.long_form?.h1 ?? category.name;

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
            <h1 className="font-display text-5xl md:text-6xl">{headline}</h1>
            <p className="mt-3 text-muted-foreground max-w-3xl">
              {total}+ tools across {category.subs.length} sub-categories. Pick a sub-category to dive in.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.subs.map((sub) => (
                <SubcategoryCard key={sub.slug} catSlug={category.slug} sub={sub} />
              ))}
            </div>

            <SeoLongForm longForm={seo?.long_form} position="below" />

            {!seo?.long_form && (
              <RichSeoBlock
                content={buildCategoryFallback(category)}
                related={others.slice(0, 12).map((c) => ({
                  label: c.short,
                  to: "/category/$slug",
                  params: { slug: c.slug },
                }))}
              />
            )}
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
