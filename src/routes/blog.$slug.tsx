import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getBlogPost } from "@/lib/content.functions";

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
  head: ({ loaderData }: any) => ({
    meta: [
      { title: `${loaderData?.title ?? "Post"} — AIBlaze Blog` },
      { name: "description", content: loaderData?.excerpt ?? "" },
      { property: "og:title", content: loaderData?.title ?? "" },
      { property: "og:description", content: loaderData?.excerpt ?? "" },
      ...(loaderData?.cover_url ? [{ property: "og:image", content: loaderData.cover_url }] : []),
    ],
  }),
  component: BlogPost,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">Couldn't load: {error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Post not found.</div>,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(postQuery(slug));

  if (!p) {
    throw notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-12 pb-24 w-full">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← Back to blog</Link>
        <h1 className="font-display text-4xl md:text-5xl mt-4">{p.title}</h1>
        {p.published_at && <div className="text-xs text-muted-foreground mt-3">{new Date(p.published_at).toLocaleDateString()}</div>}
        {p.cover_url && <img src={p.cover_url} alt="" className="w-full rounded-2xl mt-6 object-cover" />}
        {p.excerpt && <p className="text-lg text-muted-foreground mt-6">{p.excerpt}</p>}
        <div className="prose prose-invert mt-8 whitespace-pre-wrap text-foreground/90 leading-relaxed">{p.body}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
