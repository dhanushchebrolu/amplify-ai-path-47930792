import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getToolBySlug } from "@/lib/content.functions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ToolLogo } from "@/components/ToolLogo";
import { ArrowUpRight } from "lucide-react";

const toolQuery = (slug: string) =>
  queryOptions({
    queryKey: ["tool", slug],
    queryFn: () => getToolBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/tool/$slug")({
  loader: async ({ params, context }) => {
    const tool = await context.queryClient.ensureQueryData(toolQuery(params.slug));
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const { tool } = loaderData as any;
    const title = `${tool.name}${tool.tagline ? ` — ${tool.tagline}` : ""} | AIBlaze`;
    const desc = (tool.description ?? tool.tagline ?? `${tool.name} on AIBlaze.`).slice(0, 158);
    const url = `https://aiblaze.io/tool/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        ...(tool.logo_url ? [{ property: "og:image", content: tool.logo_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: tool.name,
            description: tool.description ?? tool.tagline ?? undefined,
            applicationCategory: tool.category ?? undefined,
            url: tool.url,
          }),
        },
      ],
    };
  },
  component: ToolPage,
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
  const { tool } = Route.useLoaderData() as any;
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

        {Array.isArray(tool.tags) && tool.tags.length > 0 && (
          <section className="mt-8">
            <h3 className="font-medium mb-3">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {tool.tags.map((t: string) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-muted-foreground">{t}</span>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
