import { createFileRoute, Link } from "@tanstack/react-router";
import { catalog, catalogTotalTools } from "@/data/catalog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { BrowseCategoryChips, BrowseCategorySections } from "@/components/BrowseCategorySections";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse 500+ AI Tools by Category — AI Blaze Directory" },
      { name: "description", content: `Explore ${catalogTotalTools()}+ AI tools across ${catalog.length} categories and 130+ sub-categories. Find the best AI for writing, image, video, audio, coding, marketing and more.` },
      { name: "keywords", content: "browse AI tools, AI tool categories, best AI tools by category, AI image tools, AI video tools, AI writing tools, AI coding tools, AI marketing tools, AI tool directory 2026, free AI tools" },
      { property: "og:title", content: "Browse 500+ AI Tools by Category — AI Blaze" },
      { property: "og:description", content: "The complete AI directory — categories, sub-categories, and curated tools." },
      { property: "og:url", content: "https://aiblaze.io/browse" },
      { name: "twitter:title", content: "Browse 500+ AI Tools — AI Blaze" },
      { name: "twitter:description", content: "The complete AI directory by category." },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/browse" }],
  }),
  component: Browse,
});

function Browse() {
  const total = catalogTotalTools();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-20 w-full">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        <h1 className="font-display text-5xl md:text-6xl mt-3">Browse all AI tools</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          {total}+ curated tools across {catalog.length} categories. Pick a sub-category to dive deeper.
        </p>

        <BrowseCategoryChips categories={catalog} />
        <BrowseCategorySections categories={catalog} />
      </main>
      <SiteFooter />
    </div>
  );
}
