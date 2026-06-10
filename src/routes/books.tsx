import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { listBooks } from "@/lib/content.functions";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "Best AI Books 2026 — Curated Reading List | AI Blaze" },
      { name: "description", content: "Hand-picked books on AI, prompt engineering, machine learning, and creative AI workflows. Curated for builders, creators, and students." },
      { name: "keywords", content: "AI books, best AI books 2026, prompt engineering books, machine learning books, generative AI reading list" },
      { property: "og:title", content: "Best AI Books 2026 — Curated Reading List | AI Blaze" },
      { property: "og:description", content: "Hand-picked books on AI, prompting, and creative AI workflows." },
      { property: "og:url", content: "https://aiblaze.io/books" },
      { name: "twitter:title", content: "Best AI Books 2026 — AI Blaze" },
      { name: "twitter:description", content: "Hand-picked books on AI, prompting, and creative workflows." },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/books" }],
  }),
  component: BooksPage,
});

function BooksPage() {
  const { data, isLoading } = useQuery({ queryKey: ["books"], queryFn: () => listBooks() });
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24 w-full">
        <span className="text-xs uppercase tracking-[0.2em] text-primary">Books</span>
        <h1 className="font-display text-5xl md:text-6xl mt-3">Books worth reading</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">Hand-picked books on AI, prompting, and creative work. Affiliate links — your purchase supports the site.</p>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && <div className="text-muted-foreground">Loading…</div>}
          {(data ?? []).map((b: any) => (
            <article key={b.id} className="card-surface rounded-2xl border border-white/10 p-5 flex flex-col">
              {b.cover_url && <img src={b.cover_url} alt={b.title} className="w-full aspect-[3/4] object-cover rounded-xl" />}
              <h3 className="font-semibold mt-4">{b.title}</h3>
              {b.author && <p className="text-xs text-muted-foreground mt-0.5">by {b.author}</p>}
              {b.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-3 flex-1">{b.description}</p>}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">{b.price_label}</span>
                <a href={b.affiliate_url} target="_blank" rel="noopener sponsored"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Get it <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          ))}
          {!isLoading && (data?.length ?? 0) === 0 && <p className="text-muted-foreground col-span-full">No books listed yet.</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
