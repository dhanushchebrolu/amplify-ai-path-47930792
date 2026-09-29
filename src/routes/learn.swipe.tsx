import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SwipeDeck } from "@/components/learn/SwipeDeck";
import { learnTasks } from "@/data/learnTasks";

export const Route = createFileRoute("/learn/swipe")({
  head: () => ({
    meta: [
      { title: "Swipe — Match With Your Next AI Workflow · AI Blaze" },
      { name: "description", content: "Swipe right to try, left to skip. Build your personal AI playlist one card at a time." },
      { property: "og:title", content: "Swipe — Match With Your Next AI Workflow" },
      { property: "og:description", content: "Tinder-style discovery for AI tools and tasks." },
    ],
    links: [{ rel: "canonical", href: "/learn/swipe" }],
  }),
  component: SwipePage,
});

function SwipePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pt-12 pb-24 w-full">
        <header className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] text-primary-ink">Learn New · Swipe</span>
          <h1 className="font-display text-5xl md:text-6xl mt-3">Swipe your way</h1>
          <p className="text-muted-foreground mt-4">
            Swipe right on a card to open the full task — prompt, guide and reference output. Left to skip and keep exploring.
          </p>
        </header>

        <div className="mt-14 pb-24">
          <SwipeDeck
            tasks={[...learnTasks].sort(() => Math.random() - 0.5)}
            onPick={(t) => navigate({ to: "/learn/task/$id", params: { id: t.id } })}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
