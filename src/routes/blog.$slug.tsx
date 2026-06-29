import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getBlogPost } from "@/lib/content.functions";
import { BlogPostPending } from "@/components/skeletons";
import { BlogContent } from "@/components/BlogContent";
import { sanitizeHtml, addHeadingIds } from "@/lib/html-sanitize";
import { useMemo } from "react";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const p = await getBlogPost({ data: { slug } });
      if (!p) throw notFound();
      return p;
    },
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(postQuery(params.slug)),
  head: ({ loaderData, params }: any) => {
    const d: any = loaderData ?? {};
    const url = d.canonical_url || `https://aiblaze.io/blog/${params.slug}`;
    const title = d.seo_title || d.title || "Post";
    const description = d.seo_description || d.excerpt || "";
    const ogTitle = d.og_title || title;
    const ogDescription = d.og_description || description;
    const ogImage = d.og_image || d.cover_url;
    const twTitle = d.twitter_title || ogTitle;
    const twDescription = d.twitter_description || ogDescription;
    const twImage = d.twitter_image || ogImage;
    return {
      meta: [
        { title: `${title} — AI Blaze Blog` },
        { name: "description", content: description },
        ...(d.focus_keyword ? [{ name: "keywords", content: d.focus_keyword }] : []),
        { property: "og:type", content: "article" },
        { property: "og:title", content: ogTitle },
        { property: "og:description", content: ogDescription },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: twTitle },
        { name: "twitter:description", content: twDescription },
        ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
        ...(twImage ? [{ name: "twitter:image", content: twImage }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: title,
                description: description || undefined,
                image: ogImage || undefined,
                datePublished: d.published_at ?? undefined,
                author: { "@type": "Organization", name: "AI Blaze" },
                publisher: { "@type": "Organization", name: "AI Blaze" },
                mainEntityOfPage: url,
              }),
            },
          ]
        : [],
    };
  },
  component: BlogPost,
  pendingComponent: BlogPostPending,
  pendingMs: 200,
  pendingMinMs: 400,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">Couldn't load: {error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Post not found.</div>,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(postQuery(slug));

  if (!p) throw notFound();

  const html = (p as any).content_html as string | null | undefined;
  const cleanHtml = useMemo(() => (html ? addHeadingIds(sanitizeHtml(html)) : ""), [html]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-12 pb-24 w-full">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← Back to blog</Link>
        <h1 className="font-display text-4xl md:text-5xl mt-4">{p.title}</h1>
        {p.published_at && <div className="text-xs text-muted-foreground mt-3">{new Date(p.published_at).toLocaleDateString()}</div>}
        {p.cover_url && <img src={p.cover_url} alt="" className="w-full rounded-2xl mt-6 object-cover" />}
        {p.excerpt && <p className="text-lg text-muted-foreground mt-6">{p.excerpt}</p>}
        <div className="mt-8">
          {cleanHtml
            ? <article className="blog-content" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
            : <BlogContent content={p.body ?? ""} />}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
