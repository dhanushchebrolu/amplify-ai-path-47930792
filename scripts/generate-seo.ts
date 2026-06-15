// SEO long-form content generator for AI Blaze.
// Reads catalog (categories + subcategories) and the tools table, then asks
// Lovable AI for unique, expert-written long-form content per entry and
// upserts into the seo_content table. Resumable: skips rows already done.
//
// Usage:
//   bun scripts/generate-seo.ts categories
//   bun scripts/generate-seo.ts subcategories
//   bun scripts/generate-seo.ts tools [--limit=200] [--offset=0]
//   bun scripts/generate-seo.ts all
//
// Env required: LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";
import { catalog } from "../src/data/catalog";

const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing LOVABLE_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MODEL = process.env.SEO_MODEL ?? "google/gemini-3-flash-preview";
const BASE_URL = "https://aiblaze.io";
const CONCURRENCY = Number(process.env.SEO_CONCURRENCY ?? "6");

// ─── Variation pools — hashed by slug so every page picks a different lane ─

const VOICES = [
  "an independent industry analyst who tests products hands-on and isn't afraid to call out weaknesses",
  "a hands-on practitioner walking the reader through real workflows",
  "a senior product reviewer comparing tools side-by-side with measured judgment",
  "a journalist explaining the category to a curious, non-technical reader",
  "a developer-relations engineer writing for builders evaluating an API",
  "a productivity coach focused on outcomes the reader can ship this week",
  "a CTO advising a small team on a budget-aware purchase",
  "an operator running a 50-person company who cares about onboarding and seat cost",
];

const SECTION_ORDERS = [
  ["What it actually is", "Who it's really for", "How to choose between options", "Features that matter", "Real workflows", "Where teams go wrong", "Where the category is heading"],
  ["The state of the category in 2026", "Buyer personas", "Decision framework", "Capability deep-dive", "Workflow recipes", "Pitfalls and red flags", "What to watch next"],
  ["Why this matters now", "How the tools differ", "Picking the right fit", "Notable features", "Day-to-day use", "Common mistakes", "The road ahead"],
  ["A quick definition", "Use cases by role", "Pricing and procurement", "Capabilities that move the needle", "How real teams use it", "Avoidable failures", "Trends shaping the next 12 months"],
  ["Plain-English overview", "Audiences that benefit most", "Buying criteria worth ranking", "Standout capabilities", "Patterns we see in production", "Mistakes that cost teams time", "Forward look"],
];

const FAQ_ANGLES = [
  ["pricing", "free vs paid", "team licensing", "data privacy", "data residency", "API limits", "context window", "integrations", "mobile", "offline", "GDPR", "SOC 2", "model accuracy", "hallucination handling", "switching cost", "skill required", "training included", "vendor lock-in", "self-hosting", "best alternative"],
  ["how to evaluate", "trial length", "implementation effort", "ROI timeline", "compatibility with existing stack", "support quality", "uptime SLA", "data export", "version history", "collaboration features", "permissions model", "audit logs", "compliance", "enterprise readiness", "language support", "speed of output", "quality consistency", "model choice", "fine-tuning", "white-labeling"],
  ["best for solo users", "best for teams", "best for enterprise", "best free option", "best for non-technical users", "best for developers", "limitations", "common bugs", "browser support", "Chrome extension", "Slack integration", "Notion integration", "Zapier integration", "API key location", "rate limiting", "cost per 1k requests", "Pro vs Team plan", "switching from competitor", "migration guide", "deprecation risk"],
  ["accuracy", "speed", "ease of learning", "team adoption tips", "common rejections", "ethical concerns", "copyright", "commercial usage", "client-confidential work", "model choice", "context length", "memory persistence", "multimodal support", "voice mode", "image generation", "PDF handling", "spreadsheet handling", "language coverage", "translation quality", "summarization quality"],
];

const CONCLUSION_STYLES = [
  "punchy, decisive — name a clear winner-by-use-case",
  "balanced, journalistic — leave the reader with a framework not a verdict",
  "advisory, like a consultant — recommend a 30-day evaluation plan",
  "narrative, ending on where the category is headed",
  "checklist-style, distilling the article into 5 takeaways",
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
const pick = <T,>(arr: T[], seed: number): T => arr[seed % arr.length];

// ─── Prompt builder ──────────────────────────────────────────────────────

type EntryKind = "category" | "subcategory" | "tool";

interface PromptInput {
  kind: EntryKind;
  slugPath: string;
  url: string;
  name: string;
  parentName?: string;
  tools?: { name: string; website: string }[];
  toolDescription?: string;
  toolCategory?: string;
  toolPricing?: string;
}

function buildPrompt(input: PromptInput): string {
  const seed = hash(input.slugPath);
  const voice = pick(VOICES, seed);
  const order = pick(SECTION_ORDERS, seed >> 3);
  const angles = pick(FAQ_ANGLES, seed >> 5);
  const conclusionStyle = pick(CONCLUSION_STYLES, seed >> 7);
  const wordTarget = input.kind === "tool" ? "1800-2400" : "2200-2800";
  const minSections = input.kind === "tool" ? 5 : 7;
  const minFaqs = 14;
  const minComparison = input.kind === "tool" ? 0 : 6;

  const subject =
    input.kind === "category"
      ? `the entire category "${input.name}"`
      : input.kind === "subcategory"
        ? `the sub-category "${input.name}" (inside "${input.parentName}")`
        : `the AI tool "${input.name}"${input.parentName ? ` (category: ${input.parentName})` : ""}`;

  const toolsBlock =
    input.tools && input.tools.length
      ? `\nThe specific tools featured on this page (use them by name in examples, sections, FAQs, and the comparison table — never invent tools that aren't on this list):\n${input.tools.slice(0, 30).map((t) => `- ${t.name} (${t.website})`).join("\n")}`
      : "";

  const toolFactBlock =
    input.kind === "tool"
      ? `\nWhat we already know about ${input.name}:\n- Category: ${input.toolCategory ?? "unspecified"}\n- Pricing: ${input.toolPricing ?? "unspecified"}\n- Existing short description: ${input.toolDescription ?? "(none — write from general knowledge of the product)"}`
      : "";

  return `You are writing the single best resource on the internet about ${subject}. The page must rank #1 because it genuinely deserves to.

CRITICAL UNIQUENESS RULES — every output you produce must follow these:
1. Voice: write as ${voice}. Don't impersonate a generic AI. Don't open with "In today's fast-paced world".
2. Section ordering you must follow exactly (don't reorder, don't merge): ${order.map((s, i) => `${i + 1}. ${s}`).join("  ")}
3. Use these angles for the FAQ set (one FAQ per angle, in this order, no repeats): ${angles.join(", ")}
4. Conclusion style: ${conclusionStyle}.
5. Do not use these openings: "In today's", "Welcome to", "Are you looking for", "Have you ever wondered", "Imagine".
6. Do not use the words "delve", "leverage", "unleash", "navigate the landscape", "in the realm of", "game-changer", "revolutionize". Pick concrete verbs.
7. No bullet lists in the intro or conclusion — narrative paragraphs only.
8. Every sentence must add information. Strip filler.
9. Target ${wordTarget} words total across intro + sections + FAQs + conclusion. Don't pad.
${toolsBlock}${toolFactBlock}

Return ONLY a JSON object with this exact shape and nothing else:

{
  "seo_title": "string, 50-60 chars, includes the exact subject and a hook",
  "seo_description": "string, 150-158 chars, distinct from seo_title, leads with the strongest hook",
  "og_title": "string, can differ from seo_title (more shareable)",
  "og_description": "string, 150-158 chars, optimized for click-through on social",
  "twitter_title": "string",
  "twitter_description": "string, 150-158 chars",
  "long_form": {
    "h1": "string — the on-page H1, NOT the same as seo_title",
    "intro": "string — 3-4 paragraphs separated by \\n\\n. Cover what it is, why it matters now, market signals, evolution, business impact, productivity impact, and the 2026 outlook. No bullet points.",
    "sections": [
      { "heading": "string — use the exact heading from the order above", "body": "string — 2-4 substantial paragraphs separated by \\n\\n. Concrete examples, specific tool names, real numbers where credible." }
    ],
    "faqs": [
      { "q": "string — a real question a buyer would type", "a": "string — 2-4 sentences, specific, no hedging fluff" }
    ],
    "buying_guide": "string — 3-5 paragraphs of decision criteria a buyer should rank, with explicit tradeoffs",
    ${
      minComparison > 0
        ? '"comparison": [ { "tool": "string (exact name from the featured tools list above)", "strengths": "string — one sentence", "weaknesses": "string — one sentence, honest", "ideal_for": "string — one sentence", "pricing": "string — one short phrase" } ],'
        : ""
    }
    "conclusion": "string — 2-3 paragraphs in the conclusion style above",
    "related": [ { "label": "string", "href": "string — a relative path like /category/ai-writing-tools" } ]
  },
  "structured_data": [
    { "@context": "https://schema.org", "@type": "WebPage", "name": "...", "url": "${input.url}", "description": "..." },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "${BASE_URL}/" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "...", "acceptedAnswer": { "@type": "Answer", "text": "..." } } ] }
  ]
}

Hard requirements:
- "sections" must have at least ${minSections} entries, in the exact heading order specified.
- "faqs" must have at least ${minFaqs} entries, one per angle in the order specified, no two questions phrased the same way.
${minComparison > 0 ? `- "comparison" must have at least ${minComparison} entries, each one a tool from the featured list above.` : ""}
- "structured_data" must include WebPage, BreadcrumbList, and FAQPage entries. Build FAQPage from the faqs array. The BreadcrumbList should reflect the page's actual position.
- Output strictly valid JSON. No markdown fences, no commentary, no trailing commas.`;
}

// ─── Lovable AI Gateway call ─────────────────────────────────────────────

async function callAi(prompt: string): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": LOVABLE_API_KEY,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You produce the single best, most useful, most unique resource on the web for the requested subject. You return strict JSON only — no prose, no markdown.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway ${res.status}: ${text.slice(0, 400)}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

// Strip accidental ```json fences just in case.
function safeParse(raw: string): Record<string, unknown> {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/, "").replace(/```$/, "").trim();
  }
  return JSON.parse(s);
}

// ─── Upsert ─────────────────────────────────────────────────────────────

interface Generated {
  seo_title?: string;
  seo_description?: string;
  og_title?: string;
  og_description?: string;
  twitter_title?: string;
  twitter_description?: string;
  long_form?: unknown;
  structured_data?: unknown;
}

async function upsert(kind: EntryKind, slugPath: string, gen: Generated) {
  const { error } = await supabase
    .from("seo_content")
    .upsert(
      {
        kind,
        slug_path: slugPath,
        seo_title: gen.seo_title?.slice(0, 200) ?? null,
        seo_description: gen.seo_description?.slice(0, 300) ?? null,
        og_title: gen.og_title?.slice(0, 200) ?? null,
        og_description: gen.og_description?.slice(0, 300) ?? null,
        twitter_title: gen.twitter_title?.slice(0, 200) ?? null,
        twitter_description: gen.twitter_description?.slice(0, 300) ?? null,
        long_form: gen.long_form ?? null,
        structured_data: gen.structured_data ?? null,
        model: MODEL,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "kind,slug_path" },
    );
  if (error) throw new Error(`Supabase upsert: ${error.message}`);
}

// ─── Resume support ─────────────────────────────────────────────────────

async function alreadyDone(kind: EntryKind): Promise<Set<string>> {
  const done = new Set<string>();
  let from = 0;
  const step = 1000;
  // Paginate to bypass the 1000-row default cap.
  for (;;) {
    const { data, error } = await supabase
      .from("seo_content")
      .select("slug_path")
      .eq("kind", kind)
      .range(from, from + step - 1);
    if (error) throw new Error(error.message);
    for (const r of data ?? []) done.add((r as { slug_path: string }).slug_path);
    if (!data || data.length < step) break;
    from += step;
  }
  return done;
}

// ─── Worker pool ────────────────────────────────────────────────────────

async function runPool<T>(items: T[], handler: (item: T, i: number) => Promise<void>) {
  let idx = 0;
  let done = 0;
  const errors: { item: T; err: string }[] = [];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      for (;;) {
        const i = idx++;
        if (i >= items.length) return;
        try {
          await handler(items[i], i);
        } catch (e) {
          errors.push({ item: items[i], err: (e as Error).message });
        } finally {
          done++;
          if (done % 5 === 0 || done === items.length) {
            console.log(`  progress: ${done}/${items.length}`);
          }
        }
      }
    }),
  );
  return errors;
}

async function attempt(p: PromptInput, retries = 2): Promise<void> {
  const prompt = buildPrompt(p);
  let lastErr: Error | undefined;
  for (let i = 0; i <= retries; i++) {
    try {
      const raw = await callAi(prompt);
      const parsed = safeParse(raw) as Generated;
      await upsert(p.kind, p.slugPath, parsed);
      return;
    } catch (e) {
      lastErr = e as Error;
      const msg = lastErr.message;
      // Back off on rate limits or transient parse failures.
      const backoff = msg.includes("429") ? 8000 * (i + 1) : 1500 * (i + 1);
      console.warn(`  retry ${i + 1}/${retries} for ${p.slugPath}: ${msg.slice(0, 120)}`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr ?? new Error("unknown");
}

// ─── Entry-point builders ───────────────────────────────────────────────

function categoryInputs(): PromptInput[] {
  return catalog.map((c) => ({
    kind: "category" as const,
    slugPath: c.slug,
    url: `${BASE_URL}/category/${c.slug}`,
    name: c.name,
    tools: c.subs.flatMap((s) => s.tools).slice(0, 30),
  }));
}

function subcategoryInputs(): PromptInput[] {
  const out: PromptInput[] = [];
  for (const c of catalog) {
    for (const s of c.subs) {
      out.push({
        kind: "subcategory",
        slugPath: `${c.slug}/${s.slug}`,
        url: `${BASE_URL}/category/${c.slug}/${s.slug}`,
        name: s.name,
        parentName: c.name,
        tools: s.tools.slice(0, 30),
      });
    }
  }
  return out;
}

async function toolInputs(opts: { limit?: number; offset?: number }): Promise<PromptInput[]> {
  let from = 0;
  const step = 1000;
  const out: PromptInput[] = [];
  for (;;) {
    const { data, error } = await supabase
      .from("tools")
      .select("slug, name, description, tagline, category, pricing")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .range(from, from + step - 1);
    if (error) throw new Error(error.message);
    for (const t of data ?? []) {
      const row = t as { slug: string; name: string; description: string | null; tagline: string | null; category: string | null; pricing: string | null };
      out.push({
        kind: "tool",
        slugPath: row.slug,
        url: `${BASE_URL}/tool/${row.slug}`,
        name: row.name,
        parentName: row.category ?? undefined,
        toolDescription: row.description ?? row.tagline ?? undefined,
        toolCategory: row.category ?? undefined,
        toolPricing: row.pricing ?? undefined,
      });
    }
    if (!data || data.length < step) break;
    from += step;
  }
  const offset = opts.offset ?? 0;
  const limit = opts.limit ?? out.length;
  return out.slice(offset, offset + limit);
}

// ─── Main ───────────────────────────────────────────────────────────────

async function generateFor(kind: EntryKind, inputs: PromptInput[]) {
  console.log(`\n── ${kind}: ${inputs.length} candidates`);
  const done = await alreadyDone(kind);
  const todo = inputs.filter((p) => !done.has(p.slugPath));
  console.log(`   ${done.size} already generated, ${todo.length} to process`);
  if (todo.length === 0) return;
  const errors = await runPool(todo, (p) => attempt(p));
  if (errors.length) {
    console.warn(`   ${errors.length} failures:`);
    for (const e of errors.slice(0, 10)) {
      console.warn(`   - ${(e.item as PromptInput).slugPath}: ${e.err.slice(0, 160)}`);
    }
  }
}

function parseArgs() {
  const cmd = process.argv[2] ?? "all";
  const opts: { limit?: number; offset?: number } = {};
  for (const a of process.argv.slice(3)) {
    const m = /^--(\w+)=(.+)$/.exec(a);
    if (m) (opts as Record<string, number>)[m[1]] = Number(m[2]);
  }
  return { cmd, opts };
}

async function main() {
  const { cmd, opts } = parseArgs();
  console.log(`Model: ${MODEL}  Concurrency: ${CONCURRENCY}`);

  if (cmd === "categories" || cmd === "all") {
    await generateFor("category", categoryInputs());
  }
  if (cmd === "subcategories" || cmd === "all") {
    await generateFor("subcategory", subcategoryInputs());
  }
  if (cmd === "tools" || cmd === "all") {
    const inputs = await toolInputs(opts);
    await generateFor("tool", inputs);
  }
  console.log("\ndone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
