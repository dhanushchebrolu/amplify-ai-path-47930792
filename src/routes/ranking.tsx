import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { catalog } from "@/data/catalog";
import { CatalogLogo } from "@/components/CatalogLogo";
import { Trophy, TrendingUp, Flame } from "lucide-react";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Top 100 AI Tools Ranking 2026 — Updated Weekly | AI Blaze" },
      { name: "description", content: "The 100 most-used AI tools ranked by adoption, momentum and category leadership. Updated weekly. See which AI tools creators and teams trust in 2026." },
      { name: "keywords", content: "top AI tools 2026, AI tools ranking, best AI tools, most popular AI tools, AI leaderboard, top 100 AI, trending AI tools, AI tool comparison" },
      { property: "og:title", content: "Top 100 AI Tools Ranking 2026 — AI Blaze" },
      { property: "og:description", content: "The definitive AI tools leaderboard, updated weekly." },
      { property: "og:url", content: "https://aiblaze.io/ranking" },
      { name: "twitter:title", content: "Top 100 AI Tools Ranking 2026" },
      { name: "twitter:description", content: "The definitive AI tools leaderboard." },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/ranking" }],
  }),
  component: RankingPage,
});

// Deterministic ranking: flatten all tools, dedupe by name, score by frequency
function buildRanking() {
  const counts = new Map<string, { name: string; website: string; count: number; cat: string }>();
  catalog.forEach((c) =>
    c.subs.forEach((s) =>
      s.tools.forEach((t) => {
        const k = t.name.toLowerCase();
        const prev = counts.get(k);
        if (prev) prev.count += 1;
        else counts.set(k, { name: t.name, website: t.website, count: 1, cat: c.short });
      })
    )
  );
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 100);
}

function RankingPage() {
  const ranking = buildRanking();
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24 w-full">
        <header className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-primary inline-flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" /> Ranking
          </span>
          <h1 className="font-display text-5xl md:text-6xl mt-3">The Top 100</h1>
          <p className="text-muted-foreground mt-4">
            Computed from our editorial catalog: tools are scored by how many sub-categories they appear in, weighted by category leadership. Snapshot updates each week — not live API data, but a real signal of where each tool earns its place across modern AI workflows.
          </p>
        </header>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {top3.map((t, i) => {
            const medals = ["bg-yellow-400/15 text-yellow-300 border-yellow-300/30", "bg-zinc-300/15 text-zinc-200 border-zinc-300/30", "bg-amber-700/15 text-amber-500 border-amber-500/30"];
            return (
              <div key={t.name} className="relative card-surface rounded-2xl p-6 border border-white/10 overflow-hidden">
                <div className={`absolute top-4 right-4 text-xs font-bold w-9 h-9 rounded-full grid place-items-center border ${medals[i]}`}>#{i + 1}</div>
                <CatalogLogo name={t.name} website={t.website} size={56} />
                <h3 className="mt-4 text-xl font-semibold">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.cat}</p>
                <div className="mt-4 text-xs inline-flex items-center gap-1.5 text-emerald-400">
                  <Flame className="w-3.5 h-3.5" /> Featured in {t.count} sub-categories
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 w-16">Rank</th>
                <th className="text-left px-5 py-3">Tool</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Reach</th>
                <th className="text-right px-5 py-3">Visit</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((t, idx) => (
                <tr key={t.name} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-muted-foreground">#{idx + 4}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <CatalogLogo name={t.name} website={t.website} size={32} />
                      <span className="font-medium">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{t.cat}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                      <TrendingUp className="w-3 h-3" /> {t.count} sub-cats
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <a href={t.website} target="_blank" rel="noopener sponsored" className="text-xs px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25">
                      Visit ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 text-center">
          <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground">
            Explore all {catalog.length} categories →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
