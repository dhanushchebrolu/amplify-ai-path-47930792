import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import InfiniteMenu from "@/components/InfiniteMenu";
import { learnTasks } from "@/data/learnTasks";

export const Route = createFileRoute("/learn/spin")({
  head: () => ({
    meta: [
      { title: "Spin — Discover Your Next AI Task · NeuroHub" },
      { name: "description", content: "Spin the AI globe and land on a new tool to try right now. Step-by-step guide, ready-to-paste prompt, reference output." },
      { property: "og:title", content: "Spin — Discover Your Next AI Task" },
      { property: "og:description", content: "Drag the sphere, land on a task, learn a new AI workflow in minutes." },
    ],
    links: [{ rel: "canonical", href: "/learn/spin" }],
  }),
  component: SpinPage,
});

function SpinPage() {
  const navigate = useNavigate();
  const items = learnTasks.map((t) => ({
    image: t.cover,
    link: `/learn/task/${t.id}`,
    title: t.title,
    description: t.tagline,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24 w-full">
        <header className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] text-primary">Learn New · Spin</span>
          <h1 className="font-display text-5xl md:text-6xl mt-3">Spin the AI globe</h1>
          <p className="text-muted-foreground mt-4">
            Drag the sphere. When it stops, you'll get a task — a single AI workflow you can try right now with a ready-to-paste prompt and a reference output.
          </p>
        </header>

        <div className="mt-10 rounded-3xl border border-white/10 bg-card/60 overflow-hidden" style={{ height: 560 }}>
          <InfiniteMenu
            items={items}
            scale={1}
            onLaunch={(it) => {
              const id = it.link.replace("/learn/task/", "");
              navigate({ to: "/learn/task/$id", params: { id } });
            }}
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Tap an icon to focus it · Hit the button to open the task page.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
