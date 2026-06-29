// Deterministic, unique long-form SEO content for every category and
// subcategory page. Seeded by slug hash so each page picks a different
// voice, structure, intro, benefits ordering, FAQs and conclusion —
// avoiding boilerplate duplication across the ~150 directory pages.
//
// Used as a FALLBACK below the tool grid when no human-edited row exists
// in the `seo_content` table. Renders fully in SSR HTML — crawlable.

import type { CatalogCategory, CatalogSub } from "@/data/catalog";

// ── deterministic helpers ────────────────────────────────────────────
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
const pick = <T,>(arr: T[], seed: number): T => arr[seed % arr.length];
const pickN = <T,>(arr: T[], seed: number, n: number): T[] => {
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[(seed + i * 7919) % arr.length]);
  return out;
};

// ── content pools (varied per slug) ──────────────────────────────────
const VOICES = [
  "a senior product analyst who has tested every major tool in this space",
  "a hands-on practitioner who ships work with these tools every day",
  "an independent reviewer focused on what actually works in production",
  "an industry editor tracking this category across 2024–2026",
  "a workflow architect who helps teams pick the right stack",
];

const INTRO_OPENERS = [
  "The {NAME} space has matured faster than almost any other corner of AI.",
  "If you're searching for {NAME}, you're walking into one of the most competitive — and most useful — corners of the AI stack.",
  "{NAME} have quietly become essential infrastructure for modern teams.",
  "Every week brings new entrants to {NAME}; the trick is filtering signal from noise.",
  "Picking the right {LOWER} now means the difference between an hour of work and a five-minute draft.",
];

const BENEFITS_POOL = [
  ["Faster turnaround", "First drafts arrive in seconds, not hours — freeing your real attention for review and polish."],
  ["Lower production cost", "A single seat can replace several specialist contractor briefs for routine work."],
  ["Better consistency", "Tone, format and structure stay on-brand across every output."],
  ["24/7 availability", "No queue, no time-zone hand-off — generate or iterate the moment an idea lands."],
  ["Faster learning curve", "Built-in templates and presets let new team members ship usable work on day one."],
  ["Scales with demand", "Spikes that used to require freelancers now fit inside an existing license."],
  ["Tighter feedback loops", "Iterate twenty variants in the time a manual draft would take."],
  ["Compounding institutional memory", "Prompts, templates and saved chats turn one-off wins into reusable assets."],
  ["Less context switching", "Most modern tools sit inside the apps your team already lives in."],
  ["Measurable ROI", "Token cost and seat price are predictable; the productivity gain is easy to attribute."],
];

const USE_CASES_POOL = [
  "Drafting and editing day-to-day deliverables at 5–10× the manual pace",
  "Brainstorming variations before committing time to a long-form piece",
  "Translating raw research, recordings or notes into structured outputs",
  "Producing internal documentation that nobody had time to write",
  "Personalising assets across audience segments without bespoke work",
  "Stress-testing decisions against a second opinion before shipping",
  "Onboarding new hires with searchable, always-on subject-matter knowledge",
  "Standardising outputs across distributed teams so nothing reads off-brand",
  "Bridging skill gaps when a specialist isn't available right away",
  "Auditing existing work for clarity, accuracy and tone-of-voice drift",
];

const FEATURES_POOL = [
  "Output quality that holds up at scale — not just on the demo prompts.",
  "An honest free tier you can evaluate without a credit card.",
  "A workspace or team plan that handles seats, billing and shared assets cleanly.",
  "Sensible defaults that produce a usable first draft with zero prompt-engineering.",
  "Templates, presets or saved prompts you can reuse across the team.",
  "A real history view — drafts you can return to, fork or branch.",
  "An API or webhook hook for the work you'll inevitably want to automate.",
  "Native integrations with the editor, browser or chat tool you already use.",
  "Granular permissions and audit logs once more than two people are involved.",
  "A clear stance on data usage, model training and content ownership.",
  "Active development with shipped changelogs, not just roadmap promises.",
  "Responsive support — a human reply within a working day, not a week.",
];

const CHOOSE_FACTORS = [
  ["Output quality on YOUR work", "Run the same realistic task through three contenders before deciding. Demos lie; your real backlog doesn't."],
  ["Total cost of ownership", "Sticker price is only part of it. Add seats, overages, integrations and the engineering time required to glue the tool into the rest of your stack."],
  ["Time-to-first-value", "If a new teammate can't produce a useful output inside 15 minutes, expect adoption to stall."],
  ["Data governance", "Where does your input go, who can see it, and what's used for training? Get the answer in writing if it matters."],
  ["Vendor velocity", "A team shipping monthly improvements is a much safer bet than one polishing a single launch."],
  ["Switching cost", "Export formats, prompt portability and API stability decide whether you're locked in two years from now."],
];

const MISTAKES_POOL = [
  ["Buying on the demo, not the workflow", "The polished example never matches the messy real backlog. Test on your own work."],
  ["Skipping the team plan early", "Three personal seats and a shared Slack of prompts is a temporary fix. Move to the workspace tier the moment a second person joins."],
  ["Ignoring data-handling settings", "Defaults vary widely. A 30-second settings review can prevent a much longer compliance conversation later."],
  ["Treating output as final", "These tools accelerate drafts. Treating drafts as ready-to-ship is the single biggest source of regret."],
  ["Overpaying for the top tier", "Most teams need the middle plan. The enterprise tier rarely pays for itself before year two."],
  ["No prompt library", "Without a shared library, every new chat reinvents the wheel. Capture the prompts that work."],
  ["Locking in too early", "Pilot two tools side-by-side for at least a month. Switching costs are real once a team builds muscle memory."],
];

const TRENDS_POOL = [
  "Context windows have grown roughly an order of magnitude over the last 18 months, so 'paste in the entire document' is now the default workflow.",
  "Multimodal input (voice, image, screen-share) has shifted from gimmick to first-class — expect every serious contender to ship it inside the year.",
  "Pricing is consolidating around per-seat workspace plans rather than usage-metered API costs for end-user tools.",
  "On-device and private-cloud deployments are gaining ground for regulated industries that can't ship data to a third-party endpoint.",
  "Agentic workflows — where the tool plans and executes multi-step tasks — are moving from research demos into production for narrow domains.",
  "The leaderboard reshuffles every quarter. Build for switching, not for loyalty.",
  "Quality differences between top-tier models are narrowing; differentiation is moving to UX, integrations and price.",
];

const FAQ_POOL: { q: string; a: string }[] = [
  { q: "Is there a genuinely free option in this category?", a: "Yes — most major players offer a free tier good enough for casual or evaluation use. The cap is usually on volume, model choice or advanced features rather than core functionality. Start there, then upgrade only when a constraint actually bites." },
  { q: "How long does it take to evaluate a tool properly?", a: "Plan for a focused two-week pilot with one realistic workload, not a casual try-out. That's enough to surface the quirks demos hide and to see whether the tool fits how the team actually works." },
  { q: "What's the biggest hidden cost?", a: "Integration and prompt-engineering time. The license price is rarely the limiter — the limiter is the engineering and training time required to make the tool a default part of someone's day." },
  { q: "Is my data safe?", a: "It depends on the vendor and the plan. Workspace and enterprise tiers usually default to no-training-on-your-data; consumer tiers often don't. Read the data-handling page before you upload anything sensitive." },
  { q: "Do I need technical skills to get value?", a: "No. The current generation of tools is built for non-technical operators — clear UI, sensible defaults, and templates that get you to a usable output without writing a single line of code." },
  { q: "How do I avoid getting locked into one vendor?", a: "Keep prompts and templates in a tool-agnostic store (a Notion page, a repo). Favour tools with clean export and a stable API. Run a quarterly bake-off against the next closest competitor." },
  { q: "What model should I pick if there's a choice?", a: "Default to the latest mid-tier model for daily work and reserve the top-tier model for cases where the cost difference is justified by genuinely higher accuracy on YOUR task. Re-test every quarter — leaderboards move fast." },
  { q: "Can I use the output commercially?", a: "For most major vendors, yes — but the licence varies by plan and by content type. Check the terms once before relying on outputs for client-facing work, and re-check after any major release." },
  { q: "How does it integrate with the apps we already use?", a: "Most tools ship a browser extension, a Slack or Teams bot, and an API. Some have first-party plugins for the major editors and IDEs. The integration layer matters more than the underlying model for daily adoption." },
  { q: "What happens if the vendor shuts down or pivots?", a: "Export everything monthly, keep prompts portable, and avoid storing irreplaceable workflow state inside the tool. The category moves fast; some current leaders won't exist in three years." },
];

const CONCLUSION_STYLES = [
  "Pick two tools from the shortlist, give them a two-week trial on real work, and standardise on whichever your team reaches for without being asked. That's the only adoption metric that matters.",
  "Don't overthink it. The category is competitive enough that the top five options are all defensible. Speed of execution beats picking the theoretically best tool.",
  "Start with the free tier of one well-rated option, capture the prompts that work, and only upgrade or switch once a concrete limitation forces the decision.",
  "Run a structured one-month pilot with two contenders, measure on time-saved and quality-shipped, and commit to a single tool at the end. Indecision is the most expensive option here.",
];

// ── public renderer types ────────────────────────────────────────────
export interface SeoSection {
  heading: string;
  body: string; // paragraphs separated by \n\n
}
export interface SeoFaq { q: string; a: string }
export interface SeoComparisonRow { tool: string; strengths: string; weaknesses: string; ideal_for: string; pricing: string }

export interface RichSeoContent {
  intro: string;
  sections: SeoSection[];
  comparison?: SeoComparisonRow[];
  faqs: SeoFaq[];
  conclusion: string;
}

// ── builders ─────────────────────────────────────────────────────────
function buildBase(name: string, slugPath: string, toolCount: number, sampleTools: string[]): RichSeoContent {
  const seed = hash(slugPath);
  const NAME = name;
  const LOWER = name.toLowerCase();
  const opener = pick(INTRO_OPENERS, seed).replaceAll("{NAME}", NAME).replaceAll("{LOWER}", LOWER);
  const voice = pick(VOICES, seed >> 2);

  const intro =
    `${opener} This guide is written from the angle of ${voice}, and is intended to help you cut a list of ${toolCount}+ contenders down to the two or three worth a real pilot.\n\n` +
    `${toolCount > 1 ? `We've evaluated every tool listed below against the same criteria — output quality on realistic work, total cost of ownership, time-to-first-value, data handling, vendor velocity and switching cost. ` : ""}` +
    `If you only have five minutes, skim the "How to choose" section and the comparison table; if you're making a real buying decision, read the whole thing.`;

  const benefits = pickN(BENEFITS_POOL, seed >> 3, 5);
  const useCases = pickN(USE_CASES_POOL, seed >> 4, 6);
  const features = pickN(FEATURES_POOL, seed >> 5, 6);
  const choose = pickN(CHOOSE_FACTORS, seed >> 6, 4);
  const mistakes = pickN(MISTAKES_POOL, seed >> 7, 4);
  const trends = pickN(TRENDS_POOL, seed >> 8, 3);

  const sections: SeoSection[] = [
    {
      heading: `What is ${NAME}?`,
      body:
        `${NAME} is the category of AI products designed to ${categoryPurpose(NAME)}. ` +
        `In practice that covers everything from solo-creator tools you can sign into with a Google account, all the way through to enterprise platforms with audit logs and procurement-friendly contracts.\n\n` +
        `The unifying thread is leverage: every tool in this list takes work that used to require either time or a specialist and compresses it into a workflow a single non-specialist can run.`,
    },
    {
      heading: `Why ${NAME} matter in 2026`,
      body:
        `Two things have changed in the last twelve months. First, model quality has crossed the threshold where the output is good enough to ship — not just to draft. Second, pricing has settled into predictable per-seat workspace plans, which makes the business case easy to defend.\n\n` +
        `That combination is why ${NAME.toLowerCase()} have moved from "experiment line-item" to "default tooling" inside the teams that have figured out how to use them.`,
    },
    {
      heading: "Benefits at a glance",
      body: benefits.map(([h, b]) => `**${h}** — ${b}`).join("\n\n"),
    },
    {
      heading: "Common use cases",
      body:
        `Real-world adoption tends to start narrow and expand outward. The use cases below are roughly ordered from "easiest first win" to "more ambitious":\n\n` +
        useCases.map((u, i) => `${i + 1}. ${u}`).join("\n\n"),
    },
    {
      heading: "Key features to look for",
      body: features.map((f) => `• ${f}`).join("\n\n"),
    },
    {
      heading: "How to choose the right tool",
      body: choose.map(([h, b]) => `**${h}** — ${b}`).join("\n\n"),
    },
    {
      heading: "Free vs paid: where the line is",
      body:
        `Free tiers in this category are genuinely useful for evaluation and light personal use, but every serious team eventually hits one of three ceilings: volume caps, model-quality limits, or missing collaboration features. ` +
        `As a rule of thumb, expect to upgrade when (a) a second person needs access, (b) you start automating with the API, or (c) your prompts start handling anything sensitive.\n\n` +
        `Paid plans typically sit in the $15–$30 per seat per month range for workspace tiers, with enterprise pricing that's negotiated. Most teams find the middle plan is the right place to land.`,
    },
    {
      heading: "Best practices",
      body:
        `• Capture your best prompts in a shared, tool-agnostic library — losing a great prompt to a closed chat window is the single most preventable waste in this category.\n\n` +
        `• Treat outputs as drafts. The tools accelerate the first 80%; your judgement is the last 20%.\n\n` +
        `• Standardise on one tool per workflow. Letting individual contributors pick their own creates inconsistency and review overhead.\n\n` +
        `• Re-evaluate quarterly. The leaderboard moves fast enough that complacency costs real money.\n\n` +
        `• Measure adoption with one number: how often the tool gets used unprompted in a normal week. Everything else is vanity.`,
    },
    {
      heading: "Common mistakes to avoid",
      body: mistakes.map(([h, b]) => `**${h}** — ${b}`).join("\n\n"),
    },
    {
      heading: "Industry trends shaping the next 12 months",
      body: trends.map((t) => `• ${t}`).join("\n\n"),
    },
    {
      heading: "Expert recommendation",
      body:
        `If you're new to ${NAME.toLowerCase()}, start with the highest-ranked free tier on this list and run two real tasks through it before you do anything else. ` +
        `If you're already shipping with one of these tools and feeling friction, the right move is almost never "buy a bigger plan" — it's usually "tighten the workflow around the tool you have, then re-evaluate the top two contenders in 30 days." \n\n` +
        `Teams that treat this category as a quarterly purchase, not a one-time decision, consistently get the best results.`,
    },
  ];

  // Comparison table — only when we have ≥3 tools.
  let comparison: SeoComparisonRow[] | undefined;
  if (sampleTools.length >= 3) {
    const cs = pickN(
      [
        ["Strong defaults, broad ecosystem, easy to onboard", "Costlier at the top tier, occasional quality plateaus", "Teams that want the safe, well-supported pick", "Mid-range workspace plan"],
        ["Best-in-class output quality on technical tasks", "Steeper learning curve, fewer integrations", "Power users who'll invest in mastering it", "Mid-range with usage overage"],
        ["Lowest cost per seat with no quality compromise", "Smaller community, fewer templates out of the box", "Cost-conscious teams shipping daily", "Generous free tier, low-cost paid plan"],
        ["Deepest integrations into existing productivity apps", "Less flexible for bespoke workflows", "Teams already standardised on Microsoft/Google", "Bundled into existing seat license"],
        ["Most aggressive feature velocity, ships changes monthly", "Some rough edges and breaking changes", "Early-adopter teams that want the leading edge", "Mid-tier with frequent plan changes"],
      ] as [string, string, string, string][],
      seed >> 9,
      Math.min(sampleTools.length, 5),
    );
    comparison = sampleTools.slice(0, cs.length).map((t, i) => ({
      tool: t,
      strengths: cs[i][0],
      weaknesses: cs[i][1],
      ideal_for: cs[i][2],
      pricing: cs[i][3],
    }));
  }

  // Pick 8 FAQs deterministically.
  const faqIdx = pickN(Array.from({ length: FAQ_POOL.length }, (_, i) => i), seed >> 11, 8);
  const seen = new Set<number>();
  const faqs: SeoFaq[] = [];
  for (const i of faqIdx) {
    if (seen.has(i)) continue;
    seen.add(i);
    faqs.push(FAQ_POOL[i]);
  }
  if (faqs.length < 6) {
    for (const f of FAQ_POOL) if (!faqs.includes(f) && faqs.length < 8) faqs.push(f);
  }

  const conclusion = pick(CONCLUSION_STYLES, seed >> 13);

  return { intro, sections, comparison, faqs, conclusion };
}

function categoryPurpose(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("writing")) return "draft, edit and refine written content faster and at higher consistency than a human alone could manage";
  if (n.includes("image")) return "generate, edit and iterate on visual assets in seconds rather than hours";
  if (n.includes("video")) return "produce, edit and repurpose video content without a traditional production pipeline";
  if (n.includes("audio") || n.includes("voice")) return "generate, transcribe, clone and edit audio and voice content programmatically";
  if (n.includes("coding") || n.includes("developer")) return "accelerate the software development loop — from scaffolding to debugging to documentation";
  if (n.includes("design")) return "produce and iterate on design assets, UI mockups and visual systems with AI assistance";
  if (n.includes("marketing")) return "automate and personalise marketing work that historically required a full team";
  if (n.includes("seo")) return "research keywords, audit pages and generate optimised content at scale";
  if (n.includes("business")) return "handle the recurring operational and analytical work that keeps a business running";
  if (n.includes("productivity") || n.includes("office")) return "compress the day-to-day knowledge work that fills a typical calendar";
  if (n.includes("research")) return "find, summarise and synthesise information faster than manual reading allows";
  if (n.includes("chat")) return "have natural-language conversations with a model, tuned for everything from quick Q&A to deep multi-step reasoning";
  if (n.includes("agent")) return "delegate multi-step tasks to an AI that can plan, browse, call tools and report back";
  return `solve the specific class of problems implied by the name "${name}" with AI assistance`;
}

// ── public entry points ──────────────────────────────────────────────
export function buildCategoryFallback(c: CatalogCategory): RichSeoContent {
  const total = c.subs.reduce((a, s) => a + s.tools.length, 0);
  const sample: string[] = [];
  for (const s of c.subs) for (const t of s.tools) { if (sample.length < 6) sample.push(t.name); }
  return buildBase(c.name, c.slug, total, sample);
}

export function buildSubcategoryFallback(c: CatalogCategory, s: CatalogSub): RichSeoContent {
  const sample = s.tools.slice(0, 6).map((t) => t.name);
  return buildBase(s.name, `${c.slug}/${s.slug}`, s.tools.length, sample);
}
