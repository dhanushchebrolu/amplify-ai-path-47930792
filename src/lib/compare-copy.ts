// Deterministic, matchup-unique comparison prose.
//
// Long-tail comparisons get their copy generated here, from *verified structural
// data only* (prices, capability rows, categories). Phrasing is selected with a
// stable hash of the matchup so no two comparison pages read identically, and
// the same page always renders the same words (SSR-safe, no hydration drift).
// Editor-written content in `tool_comparisons` always overrides this.

import type { ResolvedTool, MatrixGroup } from "./compare-matrix";
import { groupScore, keyDifferences } from "./compare-matrix";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, salt: number): T {
  return arr[(seed + salt * 7919) % arr.length];
}

function list(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function priceText(r: ResolvedTool): string {
  if (r.startPrice === 0) return "a free tier";
  if (r.startPrice !== null) return `paid plans from $${r.startPrice}/month`;
  return r.tool.pricing ? `pricing listed as ${r.tool.pricing.toLowerCase()}` : "pricing published on its own site";
}

export type LongFormSection = { id: string; heading: string; body: string[] };
export type Faq = { q: string; a: string };

export function buildLongForm(tools: ResolvedTool[], groups: MatrixGroup[], matchup: string): LongFormSection[] {
  const seed = hash(matchup);
  const names = tools.map((t) => t.tool.name);
  const title = names.join(" vs ");
  const diffs = keyDifferences(groups, tools, 8);
  const featureScores = groupScore(groups, "features", tools.length);
  const sections: LongFormSection[] = [];

  // What is X?
  tools.forEach((r, i) => {
    const cat = r.tool.category ? `${r.tool.category.toLowerCase()} category` : "AI tools directory";
    const openers = [
      `${r.tool.name} sits in the ${cat} on AI Blaze.`,
      `Listed under the ${cat}, ${r.tool.name} is built for a specific job.`,
      `${r.tool.name} is catalogued in the ${cat}.`,
    ];
    sections.push({
      id: `what-is-${r.tool.slug}`,
      heading: `What is ${r.tool.name}?`,
      body: [
        `${pick(openers, seed, i)} ${r.tool.tagline ?? r.tool.description ?? ""}`.trim(),
        r.tool.description && r.tool.tagline ? r.tool.description : "",
        `It offers ${priceText(r)}${r.lists.platforms.length ? ` and runs on ${list(r.lists.platforms.slice(0, 4))}` : ""}.`,
      ].filter(Boolean),
    });
  });

  // Overview
  sections.push({
    id: "overview",
    heading: `${title} overview`,
    body: [
      pick(
        [
          `Put side by side, ${list(names)} overlap on the basics but diverge once you look at pricing, model access and integrations.`,
          `${list(names)} are frequently shortlisted together, yet they solve the job in noticeably different ways.`,
          `On paper ${list(names)} look similar. The comparison table above shows where that similarity ends.`,
        ],
        seed,
        1,
      ),
      diffs.length
        ? `The clearest separations show up in ${list([...new Set(diffs.map((d) => d.label.toLowerCase()))].slice(0, 4))}.`
        : `Both tools cover comparable ground across the capabilities we track.`,
    ],
  });

  // Key differences
  if (diffs.length) {
    sections.push({
      id: "key-differences",
      heading: "Key differences",
      body: diffs.map((d) => `**${d.label}** — only ${list(d.winners)} ${d.winners.length > 1 ? "offer" : "offers"} this (${d.group.toLowerCase()}).`),
    });
  }

  // Pricing
  sections.push({
    id: "pricing-comparison",
    heading: `${title}: pricing compared`,
    body: [
      tools.map((r) => `${r.tool.name} has ${priceText(r)}.`).join(" "),
      pick(
        [
          `If budget is the deciding factor, start with the cheapest entry point and upgrade only when you hit a real limit.`,
          `Cost only matters relative to usage — run a week of real work on the free tiers before you commit.`,
          `The headline price rarely tells the whole story; check seat counts and API metering before you compare monthly totals.`,
        ],
        seed,
        2,
      ),
    ],
  });

  // Features
  sections.push({
    id: "feature-comparison",
    heading: "Feature comparison",
    body: [
      tools
        .map((r, i) => `${r.tool.name} wins ${featureScores[i]} of the tracked feature rows outright.`)
        .join(" "),
      pick(
        [
          `Feature counts are a starting point, not a verdict — one capability you use daily outweighs ten you never touch.`,
          `Weigh these rows against your own workflow rather than treating the longer list as automatically better.`,
          `Scan the table for the two or three rows that actually matter to you and ignore the rest.`,
        ],
        seed,
        3,
      ),
    ],
  });

  // Performance / models
  sections.push({
    id: "models-comparison",
    heading: "AI models and performance",
    body: [
      tools
        .map((r) =>
          r.lists.models.length
            ? `${r.tool.name} exposes ${list(r.lists.models.slice(0, 4))}.`
            : `${r.tool.name} does not publish its underlying model list in our directory.`,
        )
        .join(" "),
    ],
  });

  // Who should choose
  tools.forEach((r, i) => {
    const uc = r.lists.useCases.slice(0, 3);
    sections.push({
      id: `choose-${r.tool.slug}`,
      heading: `Who should choose ${r.tool.name}?`,
      body: [
        `${r.tool.name} is the better pick if ${uc.length ? list(uc.map((u) => u.toLowerCase())) : (r.tool.category ?? "this category").toLowerCase()} is your main workload.`,
        pick(
          [
            `It's also a sensible default if you value ${r.startPrice === 0 ? "a genuinely usable free tier" : "predictable paid pricing"}.`,
            `Teams already invested in ${r.lists.integrations[0] ?? "their existing stack"} will find it the lower-friction option.`,
            `Choose it when you'd rather have depth in one area than breadth across many.`,
          ],
          seed,
          10 + i,
        ),
      ],
    });
  });

  // Alternatives + final
  sections.push({
    id: "final-thoughts",
    heading: "Final thoughts",
    body: [
      pick(
        [
          `There is no single winner here — there's a better fit for your specific use case.`,
          `Neither tool is objectively better; the right answer depends entirely on the work you do most.`,
          `Skip the "which is best" framing and ask which one removes the most friction from your week.`,
        ],
        seed,
        4,
      ),
      `Use the category winners above to match ${list(names)} to your primary task, then trial the leader for a week before paying.`,
    ],
  });

  return sections;
}

export function buildFaqs(tools: ResolvedTool[], groups: MatrixGroup[], matchup: string): Faq[] {
  const seed = hash(matchup);
  const [a, b] = tools;
  if (!a || !b) return [];
  const faqs: Faq[] = [];
  const featureScores = groupScore(groups, "features", tools.length);

  faqs.push({
    q: `Is ${a.tool.name} better than ${b.tool.name}?`,
    a: `Neither is better in every case. ${a.tool.name} leads on ${featureScores[0] >= featureScores[1] ? "raw feature coverage" : "focus"}, while ${b.tool.name} leads on ${featureScores[1] > featureScores[0] ? "raw feature coverage" : "focus"}. Match the category winners above to your main task.`,
  });

  const prices = tools.map((t) => t.startPrice);
  if (prices.every((p) => p !== null)) {
    const cheapest = tools[prices.indexOf(Math.min(...(prices as number[])))];
    faqs.push({
      q: `Which is cheaper, ${a.tool.name} or ${b.tool.name}?`,
      a: `${cheapest.tool.name} has the lower entry price (${cheapest.startPrice === 0 ? "free to start" : `$${cheapest.startPrice}/month`}). Check per-seat and API costs before comparing annual totals.`,
    });
  }

  const freeRow = groups.flatMap((g) => g.rows).find((r) => r.key === "free-plan");
  if (freeRow) {
    const withFree = freeRow.cells.map((c, i) => (c.kind === "bool" && c.v ? tools[i].tool.name : null)).filter(Boolean) as string[];
    faqs.push({
      q: `Which has a better free plan?`,
      a: withFree.length ? `${list(withFree)} offer a free plan.` : `Neither tool publishes a free plan in our directory.`,
    });
  }

  const askAbout: Array<[string, string]> = [
    ["coding", "Coding"],
    ["writing", "Writing"],
    ["students", "Research"],
    ["business", "Automation"],
  ];
  askAbout.forEach(([topic, rowLabel], i) => {
    const rowsAll = groups.flatMap((g) => g.rows);
    const r = rowsAll.find((x) => x.label === rowLabel);
    if (!r) return;
    const winners = r.cells.map((c, idx) => (c.kind === "bool" && c.v ? tools[idx].tool.name : null)).filter(Boolean) as string[];
    if (!winners.length) return;
    faqs.push({
      q: `Which is better for ${topic}?`,
      a: `${list(winners)} ${winners.length > 1 ? "both support" : "supports"} this workload. ${pick([`Trial both on a real task before deciding.`, `Look at the integrations row to break the tie.`, `Pricing is usually the tiebreaker here.`], seed, i)}`,
    });
  });

  const apiRow = groups.flatMap((g) => g.rows).find((r) => r.key === "api");
  if (apiRow) {
    const withApi = apiRow.cells.map((c, i) => (c.kind === "bool" && c.v ? tools[i].tool.name : null)).filter(Boolean) as string[];
    faqs.push({
      q: `Which has API support?`,
      a: withApi.length ? `${list(withApi)} expose a public API.` : `Neither tool lists a public API in our directory.`,
    });
  }

  return faqs;
}
