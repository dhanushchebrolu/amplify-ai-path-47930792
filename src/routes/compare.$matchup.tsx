import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import {
  getComparisonBundle,
  getComparisonEditorial,
  getCompareRelated,
  type CompareBundleItem,
} from "@/lib/compare.functions";
import { canonicalMatchup, parseMatchup } from "@/lib/compare-utils";
import { describeError } from "@/lib/compare-trace";
import { resolveTool, buildMatrix, bestForCards, categoryWinners, keyDifferences } from "@/lib/compare-matrix";
import { buildLongForm, buildFaqs } from "@/lib/compare-copy";
import { CompareHero } from "@/components/compare/CompareHero";
import { CompareTable } from "@/components/compare/CompareTable";
import {
  SectionNav,
  QuickSummary,
  CategoryWinners,
  KeyDifferences,
  BestForGrid,
  ProsCons,
  Screenshots,
  Videos,
  FaqList,
  LongForm,
  RelatedRail,
} from "@/components/compare/CompareSections";
import { GitCompareArrows, X } from "lucide-react";

const SITE = "https://catch-all-craft.lovable.app";

export const Route = createFileRoute("/compare/$matchup")({
  beforeLoad: ({ params }) => {
    const slugs = parseMatchup(params.matchup);
    if (!slugs) throw redirect({ to: "/compare" });
    const canonical = canonicalMatchup(slugs);
    if (canonical !== params.matchup) {
      throw redirect({ to: "/compare/$matchup", params: { matchup: canonical } });
    }
  },
  head: ({ params }) => {
    const slugs = parseMatchup(params.matchup) ?? [];
    const names = slugs.map((s) => cap(s.replace(/-/g, " ")));
    const pair = names.join(" vs ");
    const title = `${pair}: Full Comparison (2026) | AI Blaze`;
    const desc = `${pair} compared side by side — pricing, AI models, features, API, integrations, platforms, performance, pros and cons. Find out which is better for coding, writing, students and business.`;
    const url = `${SITE}/compare/${params.matchup}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        {
          name: "keywords",
          content: [
            pair,
            `${pair} comparison`,
            `${pair} pricing`,
            `${pair} features`,
            `${pair} for coding`,
            `${names[0]} alternative`,
            `${names[1] ?? ""} alternative`,
            "best AI assistant",
          ]
            .filter(Boolean)
            .join(", "),
        },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
                  { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE}/compare` },
                  { "@type": "ListItem", position: 3, name: pair, item: url },
                ],
              },
              {
                "@type": "ItemList",
                name: pair,
                itemListElement: names.map((n, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: { "@type": "SoftwareApplication", name: n, applicationCategory: "AI Tool" },
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  component: CompareResult,
});

function cap(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function CompareResult() {
  const { matchup } = Route.useParams();
  const navigate = useNavigate();
  const slugs = useMemo(() => parseMatchup(matchup) ?? [], [matchup]);

  const bundleFn = useServerFn(getComparisonBundle);
  const editorialFn = useServerFn(getComparisonEditorial);
  const relatedFn = useServerFn(getCompareRelated);

  const { data, isLoading, error } = useQuery({
    queryKey: ["compare-bundle", ...slugs],
    queryFn: () => bundleFn({ data: { slugs } }),
    staleTime: 5 * 60 * 1000,
  });
  const { data: editorial } = useQuery({
    queryKey: ["compare-editorial", matchup],
    queryFn: () => editorialFn({ data: { matchup } }),
    staleTime: 5 * 60 * 1000,
  });
  const items: CompareBundleItem[] = data ?? [];
  const { data: related } = useQuery({
    queryKey: ["compare-related", matchup, items[0]?.tool.category ?? ""],
    queryFn: () => relatedFn({ data: { slugs, category: items[0]?.tool.category ?? null } }),
    enabled: items.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  function removeSlug(slug: string) {
    const next = slugs.filter((s) => s !== slug);
    if (next.length < 2) return navigate({ to: "/compare" });
    navigate({ to: "/compare/$matchup", params: { matchup: canonicalMatchup(next) } });
  }

  const view = useMemo(() => {
    if (items.length < 2) return null;
    const tools = items.map((it) => resolveTool(it.tool, it.data));
    const groups = buildMatrix(tools);
    const winners = categoryWinners(tools, groups);
    const bestFor = bestForCards(tools);
    const diffs = keyDifferences(groups, tools, 8);
    const generatedFaqs = buildFaqs(tools, groups, matchup);
    const generatedGuide = buildLongForm(tools, groups, matchup);
    return { tools, groups, winners, bestFor, diffs, generatedFaqs, generatedGuide };
  }, [items, matchup]);

  const errorInfo = useMemo(() => (error ? describeError(error) : null), [error]);
  const traceLog = useMemo(() => {
    const steps = [
      { step: "route-initialized", ok: true },
      { step: "route-params-parsed", ok: !!matchup },
      { step: "matchup-parsed", ok: slugs.length >= 2, detail: `slugs=${slugs.join(",")}` },
      { step: "tool-lookup", ok: !error && !isLoading ? items.length > 0 : !error, detail: `${items.length} tools` },
      { step: "editorial-query", ok: !error, detail: editorial ? "editorial row found" : "no editorial row (generated copy)" },
      { step: "related-query", ok: !error, detail: related ? "loaded" : "pending" },
      { step: "matrix-generated", ok: !!view },
    ];
    return steps;
  }, [matchup, slugs, items.length, editorial, related, view, error, isLoading]);

  useEffect(() => {
    if (!errorInfo) return;
    console.error("[compare] loader failure", { matchup, slugs, ...errorInfo, trace: traceLog });
  }, [errorInfo, matchup, slugs, traceLog]);

  // Editor-written content always wins over the generated version.
  const faqs = editorial?.faqs?.length ? editorial.faqs : (view?.generatedFaqs ?? []);
  const guide = editorial?.long_form?.length
    ? editorial.long_form.map((s, i) => ({ id: `ed-${i}`, heading: s.heading, body: s.body.split(/\n{2,}/) }))
    : (view?.generatedGuide ?? []);
  const quickSummary = editorial?.quick_summary?.length
    ? editorial.quick_summary.map((p) => ({ label: p.label, tool: p.tool }))
    : (view?.bestFor ?? []).slice(0, 6).filter((c) => c.winner).map((c) => ({ label: `Best for ${c.label}`, tool: c.winner!.name, slug: c.winner!.slug }));
  const winnerCards = editorial?.category_winners?.length
    ? editorial.category_winners.map((p) => ({ label: p.label, tool: p.tool }))
    : (view?.winners ?? []).map((w) => ({ label: w.label, tool: w.winner.name, slug: w.winner.slug }));

  const names = items.map((i) => i.tool.name);
  const navItems = useMemo(() => {
    const base = [
      { id: "summary", label: "Summary" },
      { id: "winners", label: "Winners" },
      { id: "differences", label: "Differences" },
      ...(view?.groups ?? []).map((g) => ({ id: `section-${g.id}`, label: g.title })),
      { id: "best-for", label: "Best for" },
      { id: "pros-cons", label: "Pros & cons" },
      { id: "faq", label: "FAQ" },
      { id: "guide", label: "Guide" },
    ];
    return base;
  }, [view]);

  return (
    <div className="min-h-screen flex flex-col scroll-smooth">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 md:px-6 pt-6 pb-24">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/compare" className="hover:text-foreground">
            Compare
          </Link>
          {names.length > 0 && (
            <>
              <span className="mx-1.5">/</span>
              <span className="text-foreground">{names.join(" vs ")}</span>
            </>
          )}
        </nav>

        {isLoading && <div className="py-24 text-center text-muted-foreground">Loading comparison…</div>}
        {error && (
          <div className="py-16 mx-auto max-w-3xl text-left">
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5">
              <div className="font-semibold text-destructive">Comparison failed to load</div>
              <p className="mt-1 text-sm text-muted-foreground">
                The real error is shown below (never hidden) so the same failure is diagnosable in
                Preview, local development and Cloudflare production.
              </p>
              <dl className="mt-4 grid gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Failing step</dt>
                  <dd className="font-mono text-foreground">{errorInfo?.step ?? "unknown"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Message</dt>
                  <dd className="font-mono text-foreground break-words">{errorInfo?.message}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Route params</dt>
                  <dd className="font-mono text-foreground break-words">
                    matchup={matchup} · slugs={slugs.join(",")}
                  </dd>
                </div>
              </dl>
              {(errorInfo?.context || errorInfo?.stack) && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    Full diagnostics (context, SQL error, stack trace)
                  </summary>
                  <pre className="mt-2 max-h-80 overflow-auto rounded bg-muted p-3 text-[11px] leading-relaxed">
{JSON.stringify({ ...errorInfo, trace: traceLog }, null, 2)}
                  </pre>
                </details>
              )}
              <div className="mt-4">
                <Link to="/compare" className="text-primary-ink underline text-sm">
                  Start over
                </Link>
              </div>
            </div>
          </div>
        )}
        {!isLoading && !error && items.length === 0 && (
          <div className="py-24 text-center">
            <div className="text-muted-foreground">No matching tools found.</div>
            <Link to="/compare" className="mt-4 inline-block text-primary-ink underline">
              Pick different tools
            </Link>
          </div>
        )}

        {view && (
          <>
            <CompareHero
              tools={view.tools}
              subtitle={
                editorial?.intro ??
                "Compare pricing, AI models, features, API, integrations, platforms, performance, pros, cons and more."
              }
            />

            {items.length > 2 && (
              <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                {items.map((it) => (
                  <button
                    key={it.tool.id}
                    onClick={() => removeSlug(it.tool.slug)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" /> Remove {it.tool.name}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6">
              <SectionNav items={navItems} />
            </div>

            <div className="mt-8 space-y-12">
              <QuickSummary picks={quickSummary} />
              <CategoryWinners winners={winnerCards} />
              <KeyDifferences diffs={view.diffs} />
              <CompareTable groups={view.groups} tools={view.tools} />
              <BestForGrid
                cards={view.bestFor.map((c) => ({
                  label: c.label,
                  winner: c.winner ? { name: c.winner.name, slug: c.winner.slug } : null,
                  tie: c.tie,
                  names: c.names,
                }))}
              />
              <ProsCons tools={view.tools} />
              <Screenshots tools={view.tools} />
              <Videos tools={view.tools} />
              <FaqList faqs={faqs} />
              <LongForm sections={guide} />
              <RelatedRail related={related ?? null} />
            </div>

            {faqs.length > 0 && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: faqs.map((f) => ({
                      "@type": "Question",
                      name: f.q,
                      acceptedAnswer: { "@type": "Answer", text: f.a },
                    })),
                  }),
                }}
              />
            )}

            <p className="mt-12 text-[11px] text-muted-foreground/70 text-center">
              Comparison data comes from the AI Blaze directory and editor-reviewed records. Fields we don't have
              reliable data for are hidden rather than estimated.
            </p>

            <div className="mt-8 text-center print:hidden">
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.04] px-4 py-2 text-sm hover:bg-foreground/[0.08]"
              >
                <GitCompareArrows className="w-4 h-4" /> Start a new comparison
              </Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
