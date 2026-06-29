import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getToolBySlug } from "@/lib/content.functions";
import { getSeoContent, type SeoContentRow } from "@/lib/seo.functions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ToolLogo } from "@/components/ToolLogo";
import { ArrowUpRight } from "lucide-react";
import { ToolPagePending } from "@/components/skeletons";
import { SeoLongForm } from "@/components/SeoLongForm";

const toolQuery = (slug: string) =>
  queryOptions({
    queryKey: ["tool", slug],
    queryFn: () => getToolBySlug({ data: { slug } }),
  });

const toolSeoQuery = (slug: string) =>
  queryOptions({
    queryKey: ["tool-seo", slug],
    queryFn: () => getSeoContent({ data: { kind: "tool", slugPath: slug } }),
  });

export const Route = createFileRoute("/tool/$slug")({
  loader: async ({ params, context }) => {
    const [tool, seo] = await Promise.all([
      context.queryClient.ensureQueryData(toolQuery(params.slug)),
      context.queryClient.ensureQueryData(toolSeoQuery(params.slug)),
    ]);
    if (!tool) throw notFound();
    return { tool, seo: seo as SeoContentRow | null };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tool, seo } = loaderData as any;
    const fallbackTitle = `${tool.name}${tool.tagline ? ` — ${tool.tagline}` : ""} | AI Blaze`;
    const fallbackDesc = (tool.description ?? tool.tagline ?? `${tool.name} on AI Blaze.`).slice(0, 158);
    const title = seo?.seo_title ?? fallbackTitle;
    const desc = (seo?.seo_description ?? fallbackDesc).slice(0, 158);
    const url = `https://aiblaze.io/tool/${params.slug}`;
    const ogTitle = seo?.og_title ?? title;
    const ogDesc = (seo?.og_description ?? desc).slice(0, 158);
    const twTitle = seo?.twitter_title ?? ogTitle;
    const twDesc = (seo?.twitter_description ?? ogDesc).slice(0, 158);

    const fallbackLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      description: tool.description ?? tool.tagline ?? undefined,
      applicationCategory: tool.category ?? undefined,
      url: tool.url,
    };
    const ldBlocks: unknown[] = (
      seo?.structured_data && Array.isArray(seo.structured_data) && seo.structured_data.length > 0
        ? (seo.structured_data as unknown[]).slice()
        : [fallbackLd]
    );
    ldBlocks.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://aiblaze.io/" },
        { "@type": "ListItem", position: 2, name: "Browse", item: "https://aiblaze.io/browse" },
        ...(tool.category
          ? [{
              "@type": "ListItem",
              position: 3,
              name: String(tool.category).replace(/-/g, " "),
              item: `https://aiblaze.io/category/${tool.category}`,
            }]
          : []),
        { "@type": "ListItem", position: tool.category ? 4 : 3, name: tool.name, item: url },
      ],
    });

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "robots", content: tool.noindex ? "noindex, follow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
        { property: "og:title", content: ogTitle },
        { property: "og:description", content: ogDesc },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: twTitle },
        { name: "twitter:description", content: twDesc },
        ...(tool.logo_url ? [{ property: "og:image", content: tool.logo_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: ldBlocks.map((block) => ({
        type: "application/ld+json",
        children: JSON.stringify(block),
      })),
    };
  },
  component: ToolPage,
  pendingComponent: ToolPagePending,
  pendingMs: 200,
  pendingMinMs: 400,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-10 text-center">
      <p className="text-muted-foreground">Couldn't load tool: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p>Tool not found. <Link to="/" className="underline">Go home</Link></p>
    </div>
  ),
});


function ToolPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { tool, seo } = Route.useLoaderData() as any;
  const slug = Route.useParams().slug;
  // re-subscribe in case of background refetch
  useSuspenseQuery(toolQuery(slug));


  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pt-10 pb-20 w-full">
        <div className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          {tool.category && <>
            <span>/</span>
            <span className="text-foreground capitalize">{String(tool.category).replace(/-/g, " ")}</span>
          </>}
          <span>/</span>
          <span className="text-foreground">{tool.name}</span>
        </div>

        <div className="card-surface p-7 flex flex-col md:flex-row gap-6 md:items-center rounded-2xl border border-white/10">
          <ToolLogo tool={{ name: tool.name, logo: tool.logo_url, website: tool.url } as any} size={80} />
          <div className="flex-1">
            <h1 className="font-display text-4xl md:text-5xl">{tool.name}</h1>
            {tool.tagline && <p className="mt-2 text-muted-foreground">{tool.tagline}</p>}
            <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              {tool.pricing && <span>{tool.pricing}</span>}
              {tool.category && <><span>·</span><span className="capitalize">{String(tool.category).replace(/-/g, " ")}</span></>}
            </div>
          </div>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener sponsored"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-3 font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Visit {tool.name} <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {tool.description && (
          <section className="mt-10">
            <h2 className="font-display text-2xl mb-3">About {tool.name}</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{tool.description}</p>
          </section>
        )}

        {seo?.long_form ? (
          <SeoLongForm longForm={seo.long_form} position="below" />
        ) : (
          <>
            <section className="mt-10 grid md:grid-cols-2 gap-6">
              <div className="card-surface p-6 rounded-2xl border border-white/10">
                <h3 className="font-display text-xl mb-3">Key features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>Purpose-built for {String(tool.category ?? "AI").replace(/-/g, " ")} workflows.</li>
                  <li>Fast, reliable output with a clean, modern interface.</li>
                  <li>{tool.pricing ? `${tool.pricing} pricing — try it before you commit.` : "Flexible pricing tiers to match your usage."}</li>
                  <li>Works in the browser — no install required.</li>
                  <li>Active development with frequent updates and new models.</li>
                </ul>
              </div>
              <div className="card-surface p-6 rounded-2xl border border-white/10">
                <h3 className="font-display text-xl mb-3">How to get started</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
                  <li>Click <span className="text-foreground">Visit {tool.name}</span> to open the official site.</li>
                  <li>Create a free account or sign in with Google.</li>
                  <li>Pick a starter template or paste your first prompt.</li>
                  <li>Iterate — refine your prompt or settings until the output fits.</li>
                  <li>Export, share, or integrate into your workflow.</li>
                </ol>
              </div>
            </section>

            <section className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="card-surface p-6 rounded-2xl border border-white/10">
                <h3 className="font-display text-xl mb-3">Best for</h3>
                <p className="text-sm text-muted-foreground">
                  Creators, founders, and teams who want a fast, dependable {String(tool.category ?? "AI").replace(/-/g, " ")} tool without the learning curve. Great for solo builders shipping daily and for small teams collaborating on repeatable work.
                </p>
              </div>
              <div className="card-surface p-6 rounded-2xl border border-white/10">
                <h3 className="font-display text-xl mb-3">Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  {tool.pricing ? `${tool.name} is available on a ${tool.pricing.toLowerCase()} plan.` : `${tool.name} offers multiple plans — check the official site for the latest details.`} Most users start with the free tier and upgrade once it pays for itself.
                </p>
              </div>
            </section>

            <section className="mt-10">
              <h3 className="font-display text-2xl mb-4">Frequently asked questions</h3>
              <div className="space-y-3">
                {[
                  { q: `Is ${tool.name} free to use?`, a: tool.pricing ? `${tool.name} offers a ${tool.pricing.toLowerCase()} plan. You can start without paying and upgrade later.` : `${tool.name} has multiple pricing tiers including a free option for new users.` },
                  { q: `What can I do with ${tool.name}?`, a: tool.tagline ?? tool.description ?? `${tool.name} helps you work faster on ${String(tool.category ?? "AI").replace(/-/g, " ")} tasks with AI assistance.` },
                  { q: `Do I need to install anything?`, a: `No. ${tool.name} runs in your browser — sign in and start building right away.` },
                  { q: `Is it safe to use ${tool.name} for client work?`, a: `Yes. Read the terms on the official site to confirm commercial usage rights for your specific plan.` },
                ].map((f, i) => (
                  <details key={i} className="card-surface p-5 rounded-2xl border border-white/10 group">
                    <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                      <span>{f.q}</span>
                      <span className="text-primary group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}


        {Array.isArray(tool.tags) && tool.tags.length > 0 && (
          <section className="mt-10">
            <h3 className="font-medium mb-3">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {tool.tags.map((t: string) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-muted-foreground">{t}</span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 card-surface p-7 rounded-2xl border border-white/10 text-center">
          <h3 className="font-display text-2xl">Ready to try {tool.name}?</h3>
          <p className="text-muted-foreground mt-2 text-sm">Open the official site and explore in under a minute.</p>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener sponsored"
            className="mt-5 inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-3 font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Visit {tool.name} <ArrowUpRight className="w-4 h-4" />
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
