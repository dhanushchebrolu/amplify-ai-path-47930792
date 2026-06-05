import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ScratchCard } from "@/components/learn/ScratchCard";
import { learnTasks, randomTaskId, getTask } from "@/data/learnTasks";

export const Route = createFileRoute("/learn/scratch")({
  head: () => ({
    meta: [
      { title: "Scratch — Reveal a New AI Task · AIBlaze" },
      { name: "description", content: "Scratch a card to reveal your next AI workflow. Full guide, prompt and reference inside." },
      { property: "og:title", content: "Scratch — Reveal a New AI Task" },
      { property: "og:description", content: "Lottery-style discovery for new AI tools and prompts." },
    ],
    links: [{ rel: "canonical", href: "/learn/scratch" }],
  }),
  component: ScratchPage,
});

function ScratchPage() {
  const navigate = useNavigate();
  const [currentId, setCurrentId] = useState(() => randomTaskId());
  const task = getTask(currentId)!;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pt-12 pb-24 w-full">
        <header className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] text-primary">Learn New · Scratch</span>
          <h1 className="font-display text-5xl md:text-6xl mt-3">Scratch & reveal</h1>
          <p className="text-muted-foreground mt-4">
            Drag your cursor across the foil to uncover today's AI task. Each card pairs a tool with a guided prompt and a reference output.
          </p>
        </header>

        <div className="mt-12">
          <ScratchCard
            key={currentId}
            task={task}
            onReveal={() => navigate({ to: "/learn/task/$id", params: { id: currentId } })}
            onNext={() => setCurrentId(randomTaskId(currentId))}
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          {learnTasks.length} cards in the deck · refreshed weekly.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
