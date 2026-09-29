import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SwipeDeck } from "@/components/learn/SwipeDeck";
import { learnTasks } from "@/data/learnTasks";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/learn/swipe")({
  head: () => ({
    meta: [
      { title: "Swipe — Match With Your Next AI Workflow · AI Blaze" },
      { name: "description", content: "Swipe right to try, left to skip. Build your personal AI playlist one card at a time." },
      { property: "og:title", content: "Swipe — Match With Your Next AI Workflow" },
      { property: "og:description", content: "Tinder-style discovery for AI tools and tasks." },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/learn/swipe" }],
  }),
  component: SwipePage,
});

function SwipePage() {
  const navigate = useNavigate();
  // SSR and first client render use the canonical order; shuffle only after
  // hydration so server and client markup match.
  const [deck, setDeck] = useState({ key: 0, tasks: learnTasks });
  useEffect(() => {
    const shuffled = [...learnTasks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setDeck({ key: 1, tasks: shuffled });
  }, []);
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
            key={deck.key}
            tasks={deck.tasks}
            onPick={(t) => navigate({ to: "/learn/task/$id", params: { id: t.id } })}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
