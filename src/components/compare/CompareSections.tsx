import { Link } from "@tanstack/react-router";
import { Check, Minus, Trophy, Sparkle } from "lucide-react";
import type { ResolvedTool } from "@/lib/compare-matrix";
import type { LongFormSection, Faq } from "@/lib/compare-copy";

export function SectionNav({ items }: { items: Array<{ id: string; label: string }> }) {
  return (
    <nav
      aria-label="Comparison sections"
      className="sticky top-[var(--compare-sticky,96px)] z-[6] -mx-4 md:-mx-6 px-4 md:px-6 py-2 bg-background/85 backdrop-blur border-b border-foreground/10 print:hidden"
    >
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            className="whitespace-nowrap rounded-full border border-foreground/10 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07] transition"
          >
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function QuickSummary({ picks }: { picks: Array<{ label: string; tool: string; slug?: string }> }) {
  if (!picks.length) return null;
  return (
    <section id="summary" className="scroll-mt-36">
      <h2 className="font-display text-2xl mb-3">Quick summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {picks.map((p) => (
          <div key={p.label} className="rounded-2xl border border-foreground/10 bg-foreground/[0.04] p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{p.label}</div>
            <div className="mt-1.5 font-display text-lg">
              {p.slug ? (
                <Link to="/tool/$slug" params={{ slug: p.slug }} className="hover:text-primary-ink transition">
                  {p.tool}
                </Link>
              ) : (
                p.tool
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryWinners({ winners }: { winners: Array<{ label: string; tool: string; slug?: string }> }) {
  if (!winners.length) return null;
  return (
    <section id="winners" className="scroll-mt-36">
      <h2 className="font-display text-2xl mb-1">Winners by category</h2>
      <p className="text-sm text-muted-foreground mb-3">
        No overall winner — each tool leads in different areas.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {winners.map((w) => (
          <div
            key={w.label}
            className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4"
          >
            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{w.label}</div>
              <div className="font-medium truncate">{w.tool}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function KeyDifferences({ diffs }: { diffs: Array<{ group: string; label: string; winners: string[] }> }) {
  if (!diffs.length) return null;
  return (
    <section id="differences" className="scroll-mt-36">
      <h2 className="font-display text-2xl mb-3">Key differences</h2>
      <ul className="grid md:grid-cols-2 gap-2.5">
        {diffs.map((d) => (
          <li key={`${d.group}-${d.label}`} className="rounded-xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-sm">
            <Sparkle className="inline w-3.5 h-3.5 text-primary-ink mr-2 -mt-0.5" />
            <span className="font-medium">{d.label}</span>
            <span className="text-muted-foreground"> — only </span>
            <span className="text-emerald-300">{d.winners.join(", ")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BestForGrid({
  cards,
}: {
  cards: Array<{ label: string; winner: { name: string; slug: string } | null; tie: boolean; names: string[] }>;
}) {
  if (!cards.length) return null;
  return (
    <section id="best-for" className="scroll-mt-36">
      <h2 className="font-display text-2xl mb-3">Best for</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-foreground/10 bg-foreground/[0.04] p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Best for {c.label}</div>
            <div className="mt-1.5 font-display text-lg">
              {c.winner ? (
                <Link to="/tool/$slug" params={{ slug: c.winner.slug }} className="hover:text-primary-ink transition">
                  {c.winner.name}
                </Link>
              ) : (
                <span className="text-muted-foreground text-base">Tie — {c.names.join(" & ")}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProsCons({ tools }: { tools: ResolvedTool[] }) {
  const any = tools.some((t) => t.pros.length || t.cons.length);
  if (!any) return null;
  return (
    <section id="pros-cons" className="scroll-mt-36">
      <h2 className="font-display text-2xl mb-3">Pros vs cons</h2>
      <div className={`grid gap-4 ${tools.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {tools.map((t) => (
          <div key={t.tool.id} className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5">
            <div className="font-display text-lg mb-3">{t.tool.name}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-emerald-400 mb-2">Pros</div>
                <ul className="space-y-1.5">
                  {t.pros.length ? (
                    t.pros.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                        {p}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground/60">—</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-rose-400 mb-2">Cons</div>
                <ul className="space-y-1.5">
                  {t.cons.length ? (
                    t.cons.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <Minus className="w-3.5 h-3.5 mt-0.5 text-rose-400 shrink-0" />
                        {p}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground/60">—</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Screenshots({ tools }: { tools: ResolvedTool[] }) {
  const shots = tools.map((t) => {
    const media = t.profile.media as Record<string, unknown> | null;
    const arr = media && Array.isArray(media.screenshots) ? (media.screenshots as unknown[]) : [];
    return { tool: t.tool, images: arr.filter((x): x is string => typeof x === "string") };
  });
  if (!shots.some((s) => s.images.length)) return null;
  return (
    <section id="screenshots" className="scroll-mt-36">
      <h2 className="font-display text-2xl mb-3">Screenshots</h2>
      <div className={`grid gap-4 ${tools.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {shots.map((s) => (
          <div key={s.tool.id}>
            <div className="text-sm font-medium mb-2">{s.tool.name}</div>
            <div className="flex gap-3 overflow-x-auto snap-x pb-2">
              {s.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${s.tool.name} screenshot ${i + 1}`}
                  loading="lazy"
                  className="h-44 rounded-xl border border-foreground/10 object-cover snap-start"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Videos({ tools }: { tools: ResolvedTool[] }) {
  const vids = tools
    .map((t) => {
      const media = t.profile.media as Record<string, unknown> | null;
      const v = media && typeof media.video === "string" ? media.video : null;
      return v ? { tool: t.tool, url: v } : null;
    })
    .filter((x): x is { tool: ResolvedTool["tool"]; url: string } => x !== null);
  if (!vids.length) return null;
  return (
    <section id="videos" className="scroll-mt-36">
      <h2 className="font-display text-2xl mb-3">Demo videos</h2>
      <div className={`grid gap-4 ${vids.length > 1 ? "md:grid-cols-2" : ""}`}>
        {vids.map((v) => (
          <div key={v.tool.id}>
            <div className="text-sm font-medium mb-2">{v.tool.name}</div>
            <div className="aspect-video rounded-xl overflow-hidden border border-foreground/10">
              <iframe
                src={v.url}
                title={`${v.tool.name} demo video`}
                loading="lazy"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section id="faq" className="scroll-mt-36">
      <h2 className="font-display text-2xl mb-3">Frequently asked questions</h2>
      <div className="divide-y divide-foreground/10 rounded-2xl border border-foreground/10 bg-foreground/[0.03]">
        {faqs.map((f, i) => (
          <details key={i} className="group px-5 py-4" open={i === 0}>
            <summary className="cursor-pointer list-none font-medium text-sm flex items-center justify-between gap-4">
              {f.q}
              <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function renderInline(text: string) {
  // Minimal **bold** support for generated copy.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function LongForm({ sections }: { sections: LongFormSection[] }) {
  if (!sections.length) return null;
  return (
    <section id="guide" className="scroll-mt-36">
      <h2 className="font-display text-2xl mb-4">The full comparison guide</h2>
      <div className="space-y-7 max-w-3xl">
        {sections.map((s) => (
          <article key={s.id} id={s.id} className="scroll-mt-36">
            <h3 className="font-display text-xl mb-2">{s.heading}</h3>
            {s.body.map((p, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2">
                {renderInline(p)}
              </p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

export function RelatedRail({
  related,
}: {
  related: {
    tools: Array<{ slug: string; name: string; logo_url: string | null; tagline: string | null }>;
    posts: Array<{ slug: string; title: string }>;
    prompts: Array<{ id: string; title: string }>;
    comparisons: Array<{ matchup: string; headline: string | null }>;
  } | null;
}) {
  if (!related) return null;
  const has =
    related.tools.length || related.posts.length || related.prompts.length || related.comparisons.length;
  if (!has) return null;
  return (
    <section id="related" className="scroll-mt-36 print:hidden">
      <h2 className="font-display text-2xl mb-3">Keep exploring</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {related.comparisons.length > 0 && (
          <Card title="People also compared">
            {related.comparisons.map((c) => (
              <Link
                key={c.matchup}
                to="/compare/$matchup"
                params={{ matchup: c.matchup }}
                className="block text-sm hover:text-primary-ink transition py-1"
              >
                {c.headline ?? c.matchup.split("-vs-").join(" vs ")}
              </Link>
            ))}
          </Card>
        )}
        {related.tools.length > 0 && (
          <Card title="Related AI tools">
            {related.tools.slice(0, 6).map((t) => (
              <Link
                key={t.slug}
                to="/tool/$slug"
                params={{ slug: t.slug }}
                className="flex items-center gap-2.5 py-1 text-sm hover:text-primary-ink transition"
              >
                {t.logo_url ? (
                  <img src={t.logo_url} alt="" loading="lazy" className="w-5 h-5 rounded" />
                ) : (
                  <span className="w-5 h-5 rounded bg-foreground/10" />
                )}
                {t.name}
              </Link>
            ))}
          </Card>
        )}
        {related.posts.length > 0 && (
          <Card title="Related reading">
            {related.posts.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="block text-sm hover:text-primary-ink transition py-1"
              >
                {p.title}
              </Link>
            ))}
          </Card>
        )}
        {related.prompts.length > 0 && (
          <Card title="Related prompts">
            {related.prompts.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to="/prompts/$id"
                params={{ id: p.id }}
                className="block text-sm hover:text-primary-ink transition py-1"
              >
                {p.title}
              </Link>
            ))}
          </Card>
        )}
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">{title}</div>
      <div className="divide-y divide-foreground/5">{children}</div>
    </div>
  );
}
