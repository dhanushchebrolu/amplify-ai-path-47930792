import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { listCourses } from "@/lib/content.functions";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Best AI Courses 2026 — Learn AI Properly | AI Blaze" },
      { name: "description", content: "Hand-picked AI courses, tutorials, and bootcamps from top providers. Beginner to advanced — learn prompt engineering, LLMs, generative AI and more." },
      { name: "keywords", content: "AI courses, best AI courses 2026, learn AI, AI tutorials, prompt engineering course, generative AI course, LLM training" },
      { property: "og:title", content: "Best AI Courses 2026 — Learn AI Properly | AI Blaze" },
      { property: "og:description", content: "Hand-picked AI courses and tutorials to level up your skills." },
      { property: "og:url", content: "https://aiblaze.io/courses" },
      { name: "twitter:title", content: "Best AI Courses 2026 — AI Blaze" },
      { name: "twitter:description", content: "Hand-picked AI courses and tutorials." },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/courses" }],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["courses"], queryFn: () => listCourses() });
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24 w-full">
        <span className="text-xs uppercase tracking-[0.2em] text-primary-ink">Courses</span>
        <h1 className="font-display text-5xl md:text-6xl mt-3">Learn AI properly</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">Hand-picked courses worth your time. Affiliate links — your enrollment supports the site.</p>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && <div className="text-muted-foreground">Loading…</div>}
          {(data ?? []).map((c: any) => (
            <article key={c.id} className="card-surface rounded-2xl border border-foreground/10 overflow-hidden flex flex-col">
              {c.cover_url && <img src={c.cover_url} alt={c.title} className="w-full aspect-[16/9] object-cover" />}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{[c.provider, c.level, c.duration].filter(Boolean).join(" · ")}</p>
                {c.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-3 flex-1">{c.description}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium">{c.price_label}</span>
                  <a href={c.affiliate_url} target="_blank" rel="noopener sponsored"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-ink hover:underline">
                    Enroll <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
          {!isLoading && (data?.length ?? 0) === 0 && <p className="text-muted-foreground col-span-full">No courses listed yet.</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
