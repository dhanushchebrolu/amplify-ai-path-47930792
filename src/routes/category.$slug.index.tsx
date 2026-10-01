import { categoryAccent } from "@/lib/category-accent";
import { cn } from "@/lib/utils";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { catalog, getCatalogCategory, type CatalogCategory } from "@/data/catalog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SubcategoryCard } from "@/components/SubcategoryCard";
import { SeoLongForm } from "@/components/SeoLongForm";
import { RichSeoBlock } from "@/components/RichSeoBlock";
import { buildCategoryFallback } from "@/lib/category-seo-content";
import { getSeoContent, type SeoContentRow } from "@/lib/seo.functions";
import { useStickyScroll } from "@/hooks/use-sticky-scroll";

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
  const accent = categoryAccent(category.slug);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className={cn("mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-16 w-full", accent.className)}>
        <Link to="/browse" className="text-sm font-medium text-muted-foreground hover:text-cat transition-colors inline-flex items-center gap-1">
          ← All categories
        </Link>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-12">
          <CategorySidebar activeSlug={category.slug} />



          <section>
            <div className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--cat)_16%,var(--border))] bg-gradient-to-br from-[var(--cat-tint)] via-surface to-surface p-6 sm:p-8 shadow-[var(--shadow-card)]">
              <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-[var(--cat)] opacity-80" />
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-cat-soft text-cat ring-1 ring-[color-mix(in_oklab,var(--cat)_22%,transparent)]">
                <accent.icon className="w-6 h-6" strokeWidth={1.7} />
              </span>
              <h1 className="mt-5 font-display text-[2.25rem] leading-[1.08] sm:text-5xl md:text-6xl text-navy">{headline}</h1>
              <p className="mt-3 text-muted-foreground max-w-3xl">
                {total}+ tools across {category.subs.length} sub-categories. Pick a sub-category to dive in.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-lg bg-surface border border-border px-3 py-1.5"><span className="cat-dot" /><span className="font-semibold text-navy tabular-nums">{total}+</span> tools</span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-surface border border-border px-3 py-1.5"><span className="cat-dot" /><span className="font-semibold text-navy tabular-nums">{category.subs.length}</span> sub-categories</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5">
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

function CategorySidebar({ activeSlug }: { activeSlug: string }) {
  const ref = useStickyScroll<HTMLElement>("categories-sidebar-scroll");
  return (
    <aside
      ref={ref}
      className="self-start min-w-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-3 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:py-6 scrollbar-thin"
    >
      <div className="eyebrow mb-3">Categories</div>
      <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-thin pb-2 lg:pb-0">
        {catalog.map((c) => (
          <div key={c.slug} className="shrink-0">
            <CatLink slug={c.slug} active={c.slug === activeSlug}>{c.short}</CatLink>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function CatLink({
  slug, active, children,
}: { slug: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug }}
      resetScroll={false}
      className={
        "text-sm px-3 py-2 rounded-lg whitespace-nowrap transition-colors " +
        (active
          ? "block bg-surface text-navy font-semibold border border-border shadow-[var(--shadow-card)] border-l-[3px] border-l-[var(--cat)]"
          : "block text-muted-foreground border border-transparent hover:text-navy hover:bg-surface")
      }
    >
      {children}
    </Link>
  );
}

