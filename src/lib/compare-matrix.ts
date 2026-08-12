// Difference-first comparison matrix.
//
// Turns each tool's resolved profile into a canonical, aligned grid of rows so
// the public page can highlight *differences* instead of listing two profiles
// side by side. Every row knows which columns win, tie, or lack the capability.

import type { CompareTool, CompareData } from "./compare.functions";
import { inferDraftProfile, type InferredProfile } from "./compare-inference";
import { collectStringList, extractStartPrice, companyFromUrl } from "./compare-utils";

export type Verdict = "better" | "similar" | "none";

export type Cell =
  | { kind: "bool"; v: boolean }
  | { kind: "text"; v: string | null }
  | { kind: "list"; v: string[] }
  | { kind: "num"; v: number | null; display: string | null };

export type MatrixRow = {
  key: string;
  label: string;
  cells: Cell[];
  verdicts: Verdict[];
  /** true when every column has the same effective value */
  identical: boolean;
};

export type MatrixGroup = { id: string; title: string; rows: MatrixRow[] };

export type ResolvedTool = {
  tool: CompareTool;
  profile: InferredProfile;
  haystack: string;
  lists: {
    models: string[];
    platforms: string[];
    integrations: string[];
    languages: string[];
    features: string[];
    useCases: string[];
    limitations: string[];
  };
  startPrice: number | null;
  pros: string[];
  cons: string[];
};

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.items)) return (o.items as unknown[]).length === 0;
    return Object.keys(o).length === 0;
  }
  return false;
}

/** Automatic baseline (directory-derived) with stored admin data winning field by field. */
export function resolveProfile(tool: CompareTool, stored: CompareData | null): InferredProfile {
  const base = inferDraftProfile(tool);
  if (!stored) return base;
  const pick = <K extends keyof InferredProfile>(k: K): InferredProfile[K] =>
    (isEmpty(stored[k]) ? base[k] : stored[k]) as InferredProfile[K];
  return {
    ...base,
    company: stored.company || base.company,
    website: stored.website || base.website,
    launch_year: stored.launch_year ?? base.launch_year,
    status: stored.status ?? base.status,
    verification_status: stored.verification_status ?? base.verification_status,
    verified_at: stored.verified_at ?? null,
    source_url: stored.source_url ?? null,
    open_source: stored.open_source || base.open_source,
    api_available: stored.api_available || base.api_available,
    pricing: pick("pricing"),
    models: pick("models"),
    features: pick("features"),
    platforms: pick("platforms"),
    languages: pick("languages"),
    integrations: pick("integrations"),
    use_cases: pick("use_cases"),
    limitations: pick("limitations"),
    pros: pick("pros"),
    cons: pick("cons"),
    media: pick("media"),
    seo: pick("seo"),
    metadata: pick("metadata"),
    updated_at: stored.updated_at ?? base.updated_at,
  };
}

function featureKeys(features: unknown): string[] {
  if (!features || typeof features !== "object") return [];
  return Object.entries(features as Record<string, unknown>)
    .filter(([, v]) => v !== false && v !== null && v !== "" && v !== "No")
    .map(([k]) => k);
}

export function resolveTool(tool: CompareTool, stored: CompareData | null): ResolvedTool {
  const profile = resolveProfile(tool, stored);
  const lists = {
    models: collectStringList(profile.models),
    platforms: collectStringList(profile.platforms),
    integrations: collectStringList(profile.integrations),
    languages: collectStringList(profile.languages),
    features: featureKeys(profile.features),
    useCases: profile.use_cases ?? [],
    limitations: collectStringList(profile.limitations),
  };
  const haystack = [
    tool.name,
    tool.tagline ?? "",
    tool.description ?? "",
    tool.category ?? "",
    tool.subcategory ?? "",
    tool.pricing ?? "",
    ...(tool.tags ?? []),
    ...lists.models,
    ...lists.platforms,
    ...lists.integrations,
    ...lists.features,
    ...lists.useCases,
  ]
    .join(" \n ")
    .toLowerCase();
  return {
    tool,
    profile,
    haystack,
    lists,
    startPrice: extractStartPrice(profile.pricing, tool.pricing),
    pros: profile.pros ?? [],
    cons: profile.cons ?? [],
  };
}

function hit(r: ResolvedTool, needles: string[]): boolean {
  for (const n of needles) {
    const nl = n.toLowerCase();
    if (r.lists.features.some((f) => f.toLowerCase().includes(nl))) return true;
    if (r.haystack.includes(nl)) return true;
  }
  return false;
}

function listHit(list: string[], needles: string[]): boolean {
  return list.some((x) => needles.some((n) => x.toLowerCase().includes(n.toLowerCase())));
}

// ── verdict helpers ──────────────────────────────────────────────────

function boolVerdicts(cells: Cell[]): { verdicts: Verdict[]; identical: boolean } {
  const vals = cells.map((c) => (c.kind === "bool" ? c.v : false));
  const yes = vals.filter(Boolean).length;
  const identical = yes === 0 || yes === vals.length;
  return {
    identical,
    verdicts: vals.map((v) => (!v ? "none" : identical ? "similar" : "better")),
  };
}

function numVerdicts(cells: Cell[], lowerIsBetter = false): { verdicts: Verdict[]; identical: boolean } {
  const vals = cells.map((c) => (c.kind === "num" ? c.v : null));
  const present = vals.filter((v): v is number => v !== null);
  if (!present.length) return { verdicts: vals.map(() => "none"), identical: true };
  const best = lowerIsBetter ? Math.min(...present) : Math.max(...present);
  const allSame = present.length === vals.length && present.every((v) => v === best);
  return {
    identical: allSame,
    verdicts: vals.map((v) => (v === null ? "none" : v === best ? (allSame ? "similar" : "better") : "similar")),
  };
}

function textVerdicts(cells: Cell[]): { verdicts: Verdict[]; identical: boolean } {
  const vals = cells.map((c) => (c.kind === "text" ? (c.v ?? "") : c.kind === "list" ? (c as { v: string[] }).v.join(", ") : ""));
  const nonEmpty = vals.filter((v) => v.trim());
  const identical = nonEmpty.length === 0 || nonEmpty.every((v) => v === nonEmpty[0]);
  return { identical, verdicts: vals.map((v) => (v.trim() ? "similar" : "none")) };
}

function row(key: string, label: string, cells: Cell[], mode: "bool" | "num" | "num-low" | "text" | "count"): MatrixRow {
  let res: { verdicts: Verdict[]; identical: boolean };
  if (mode === "bool") res = boolVerdicts(cells);
  else if (mode === "num") res = numVerdicts(cells);
  else if (mode === "num-low") res = numVerdicts(cells, true);
  else if (mode === "count") res = numVerdicts(cells);
  else res = textVerdicts(cells);
  return { key, label, cells, verdicts: res.verdicts, identical: res.identical };
}

const B = (v: boolean): Cell => ({ kind: "bool", v });
const T = (v: string | null | undefined): Cell => ({ kind: "text", v: v && String(v).trim() ? String(v) : null });
const L = (v: string[]): Cell => ({ kind: "list", v });
const N = (v: number | null, display?: string | null): Cell => ({ kind: "num", v, display: display ?? (v === null ? null : String(v)) });

// ── canonical capability tables ──────────────────────────────────────

const FEATURES: Array<[string, string[]]> = [
  ["Chat", ["chat", "conversation", "assistant", "chatbot"]],
  ["Coding", ["code", "coding", "developer", "programming"]],
  ["Writing", ["writing", "copywriting", "content generation"]],
  ["Image generation", ["image generation", "image", "art", "illustration"]],
  ["Video generation", ["video generation", "video"]],
  ["Voice", ["voice", "tts", "speech synthesis"]],
  ["Speech recognition", ["speech recognition", "stt", "transcription", "whisper"]],
  ["Translation", ["translation", "translate", "multilingual"]],
  ["Summarization", ["summariz", "summary"]],
  ["Automation", ["automation", "workflow automation"]],
  ["Agents", ["agent", "agents"]],
  ["Workflows", ["workflow"]],
  ["Browser / web access", ["browser", "browsing", "web search"]],
  ["API", ["api"]],
  ["Plugins & extensions", ["plugin", "extension"]],
  ["MCP", ["mcp"]],
  ["RAG / knowledge base", ["rag", "knowledge base", "retrieval"]],
  ["OCR", ["ocr"]],
  ["PDF chat", ["pdf", "document analysis"]],
  ["Spreadsheets", ["spreadsheet", "excel", "sheets"]],
  ["Presentations", ["presentation", "slides", "deck"]],
  ["Website builder", ["website builder", "landing page", "site builder"]],
  ["Research", ["research", "citations"]],
];

const PLATFORMS: Array<[string, string[]]> = [
  ["Web", ["web"]],
  ["Windows", ["windows"]],
  ["macOS", ["macos", "mac"]],
  ["Linux", ["linux"]],
  ["Android", ["android"]],
  ["iOS", ["ios", "iphone"]],
  ["Desktop app", ["desktop"]],
  ["Chrome extension", ["chrome extension", "browser extension"]],
  ["Cloud / self-host", ["cloud", "self hosted", "self-hosted"]],
];

const INTEGRATIONS = [
  "Slack",
  "Discord",
  "GitHub",
  "Google Drive",
  "Notion",
  "Zapier",
  "Make",
  "n8n",
  "Canva",
  "Figma",
  "WordPress",
  "Shopify",
];

const MODEL_CAPS: Array<[string, string[]]> = [
  ["Reasoning", ["reasoning", "o1", "o3", "thinking"]],
  ["Vision", ["vision", "multimodal", "image input"]],
  ["Voice", ["voice", "audio"]],
  ["Image output", ["image generation", "dall", "midjourney", "flux", "stable diffusion"]],
  ["Video output", ["video generation", "sora", "runway", "veo"]],
  ["Web search", ["web search", "search", "browsing"]],
  ["Memory", ["memory", "persistent"]],
  ["Fine tuning", ["fine tuning", "fine-tune", "finetune", "custom model"]],
];

const BEST_FOR: Array<[string, string[]]> = [
  ["Students", ["student", "study", "education", "learning", "homework"]],
  ["Developers", ["developer", "code", "programming", "api", "ide"]],
  ["Marketing", ["marketing", "ads", "campaign", "social media"]],
  ["SEO", ["seo", "keyword", "ranking", "organic"]],
  ["Business", ["business", "team", "workspace", "productivity"]],
  ["Enterprise", ["enterprise", "sso", "compliance", "soc 2"]],
  ["Researchers", ["research", "citation", "paper", "academic"]],
  ["Designers", ["design", "image", "figma", "ui", "illustration"]],
  ["Content creators", ["content", "creator", "video", "writing", "blog"]],
];

function priceCell(r: ResolvedTool): Cell {
  const p = r.startPrice;
  if (p === null) return N(null, r.tool.pricing || null);
  return N(p, p === 0 ? "Free" : `$${p}/mo`);
}

function pricingField(r: ResolvedTool, key: string): unknown {
  const p = r.profile.pricing;
  if (p && typeof p === "object") return (p as Record<string, unknown>)[key];
  return undefined;
}

export function buildMatrix(tools: ResolvedTool[]): MatrixGroup[] {
  const map = <T,>(fn: (r: ResolvedTool) => T) => tools.map(fn);

  const overview: MatrixRow[] = [
    row("company", "Company", map((r) => T(r.profile.company || companyFromUrl(r.tool.url))), "text"),
    row("launch", "Launch year", map((r) => T(r.profile.launch_year ? String(r.profile.launch_year) : null)), "text"),
    row("website", "Website", map((r) => T(r.profile.website || r.tool.url)), "text"),
    row("category", "Category", map((r) => T(r.tool.category)), "text"),
    row("subcategory", "Subcategory", map((r) => T(r.tool.subcategory)), "text"),
    row("platforms-count", "Platforms supported", map((r) => N(r.lists.platforms.length || null, r.lists.platforms.length ? String(r.lists.platforms.length) : null)), "num"),
    row("pricing-label", "Pricing", map((r) => T(r.tool.pricing)), "text"),
    row("api", "API access", map((r) => B(r.profile.api_available || hit(r, ["api"]))), "bool"),
    row("open-source", "Open source", map((r) => B(r.profile.open_source || hit(r, ["open source", "open-source"]))), "bool"),
    row("updated", "Last updated", map((r) => T(r.profile.updated_at ? new Date(r.profile.updated_at).toLocaleDateString() : null)), "text"),
  ];

  const pricing: MatrixRow[] = [
    row("start-price", "Starting price", map(priceCell), "num-low"),
    row("free-plan", "Free plan", map((r) => B(r.startPrice === 0 || /free\b/.test((r.tool.pricing ?? "").toLowerCase()) || hit(r, ["free plan", "freemium"]))), "bool"),
    row("free-trial", "Free trial", map((r) => B(hit(r, ["free trial", "trial"]))), "bool"),
    row("monthly", "Monthly plan", map((r) => T((pricingField(r, "monthly") as string) ?? (r.startPrice ? `$${r.startPrice}/mo` : null))), "text"),
    row("yearly", "Yearly plan", map((r) => T((pricingField(r, "yearly") as string) ?? null)), "text"),
    row("enterprise", "Enterprise plan", map((r) => B(hit(r, ["enterprise", "contact sales"]))), "bool"),
    row("api-pricing", "API pricing", map((r) => T((pricingField(r, "api") as string) ?? (r.profile.api_available ? "Usage based" : null))), "text"),
    row("student", "Student pricing", map((r) => B(hit(r, ["student", "education discount"]))), "bool"),
    row("business", "Business / team plan", map((r) => B(hit(r, ["team", "business plan", "seats"]))), "bool"),
  ];

  const models: MatrixRow[] = [
    row("model-list", "Supported models", map((r) => L(r.lists.models)), "text"),
    row("model-count", "Number of models", map((r) => N(r.lists.models.length || null)), "num"),
    row("context", "Context window", map((r) => T((r.profile.metadata as Record<string, unknown> | null)?.["context_window"] as string | undefined)), "text"),
    ...MODEL_CAPS.map(([label, needles]) =>
      row(`mc-${label}`, label, map((r) => B(hit(r, needles) || listHit(r.lists.models, needles))), "bool"),
    ),
  ];

  const features: MatrixRow[] = FEATURES.map(([label, needles]) =>
    row(`f-${label}`, label, map((r) => B(hit(r, needles))), "bool"),
  );

  const platforms: MatrixRow[] = PLATFORMS.map(([label, needles]) =>
    row(`p-${label}`, label, map((r) => B(listHit(r.lists.platforms, needles) || hit(r, needles))), "bool"),
  );

  const languages: MatrixRow[] = [
    row("langs", "Supported languages", map((r) => L(r.lists.languages)), "text"),
    row("lang-count", "Language count", map((r) => N(r.lists.languages.length || null)), "num"),
    row("voice-langs", "Voice languages", map((r) => B(hit(r, ["voice", "speech"]) && r.lists.languages.length > 1)), "bool"),
    row("localization", "Localized interface", map((r) => B(hit(r, ["localization", "localized", "multilingual"]))), "bool"),
  ];

  const integrations: MatrixRow[] = INTEGRATIONS.map((name) =>
    row(`i-${name}`, name, map((r) => B(listHit(r.lists.integrations, [name]) || hit(r, [name]))), "bool"),
  );

  const performance: MatrixRow[] = [
    row("speed", "Response speed", map((r) => T(hit(r, ["fast", "real-time", "realtime", "instant"]) ? "Fast" : null)), "text"),
    row("ctx", "Context window", map((r) => T((r.profile.metadata as Record<string, unknown> | null)?.["context_window"] as string | undefined)), "text"),
    row("reasoning", "Advanced reasoning", map((r) => B(hit(r, ["reasoning", "thinking", "chain of thought"]))), "bool"),
    row("reliability", "Uptime / reliability notes", map((r) => T((r.profile.metadata as Record<string, unknown> | null)?.["reliability"] as string | undefined)), "text"),
    row("api-avail", "Public API", map((r) => B(r.profile.api_available || hit(r, ["api"]))), "bool"),
    row("rate-limits", "Rate limits documented", map((r) => T((r.profile.metadata as Record<string, unknown> | null)?.["rate_limits"] as string | undefined)), "text"),
  ];

  const groups: MatrixGroup[] = [
    { id: "overview", title: "Overview", rows: overview },
    { id: "pricing", title: "Pricing", rows: pricing },
    { id: "models", title: "AI models", rows: models },
    { id: "features", title: "Features", rows: features },
    { id: "platforms", title: "Platforms", rows: platforms },
    { id: "languages", title: "Languages", rows: languages },
    { id: "integrations", title: "Integrations", rows: integrations },
    { id: "performance", title: "Performance", rows: performance },
  ];

  // Drop rows where nothing is known anywhere — never render empty noise.
  return groups
    .map((g) => ({
      ...g,
      rows: g.rows.filter((r) =>
        r.cells.some((c) =>
          c.kind === "bool" ? c.v : c.kind === "num" ? c.v !== null || !!c.display : c.kind === "list" ? c.v.length > 0 : !!c.v,
        ),
      ),
    }))
    .filter((g) => g.rows.length > 0);
}

/** "Best for X" cards — score each tool per audience and pick a leader. */
export function bestForCards(tools: ResolvedTool[]) {
  return BEST_FOR.map(([label, needles]) => {
    const scores = tools.map((r) => needles.reduce((n, k) => n + (r.haystack.includes(k) ? 1 : 0), 0));
    const max = Math.max(...scores);
    if (max === 0) return null;
    const winners = scores.map((s, i) => (s === max ? i : -1)).filter((i) => i >= 0);
    return {
      label,
      winner: winners.length === 1 ? tools[winners[0]].tool : null,
      tie: winners.length > 1,
      names: winners.map((i) => tools[i].tool.name),
    };
  }).filter((x): x is NonNullable<typeof x> => x !== null);
}

/** Category-level winners (never an overall winner). */
export function categoryWinners(tools: ResolvedTool[], groups: MatrixGroup[]) {
  const buckets: Array<[string, string[]]> = [
    ["Coding", ["code", "coding", "developer", "programming"]],
    ["Writing", ["writing", "content", "copywriting"]],
    ["Image", ["image", "art", "design"]],
    ["Video", ["video", "animation"]],
    ["Research", ["research", "search", "citation"]],
    ["Automation", ["automation", "agent", "workflow"]],
  ];
  const out = buckets
    .map(([label, needles]) => {
      const scores = tools.map((r) => needles.reduce((n, k) => n + (r.haystack.split(k).length - 1), 0));
      const max = Math.max(...scores);
      if (max === 0) return null;
      const idx = scores.indexOf(max);
      if (scores.filter((s) => s === max).length > 1) return null;
      return { label, winner: tools[idx].tool };
    })
    .filter((x): x is { label: string; winner: CompareTool } => x !== null);

  // Objective, count-based winners derived from the matrix itself.
  const extra: Array<{ label: string; winner: CompareTool }> = [];
  const cheapest = pickBy(tools, (r) => (r.startPrice === null ? null : -r.startPrice));
  if (cheapest) extra.push({ label: "Best price", winner: cheapest.tool });
  const mostInteg = pickBy(tools, (r) => r.lists.integrations.length || null);
  if (mostInteg) extra.push({ label: "Most integrations", winner: mostInteg.tool });
  const mostPlatforms = pickBy(tools, (r) => r.lists.platforms.length || null);
  if (mostPlatforms) extra.push({ label: "Widest platform support", winner: mostPlatforms.tool });
  const featureScores = groupScore(groups, "features", tools.length);
  const maxF = Math.max(...featureScores, 0);
  if (maxF > 0 && featureScores.filter((n) => n === maxF).length === 1) {
    extra.push({ label: "Most features", winner: tools[featureScores.indexOf(maxF)].tool });
  }

  const seen = new Set<string>();
  return [...out, ...extra].filter((x) => {
    if (seen.has(x.label)) return false;
    seen.add(x.label);
    return true;
  });
}

function pickBy(tools: ResolvedTool[], score: (r: ResolvedTool) => number | null) {
  const scores = tools.map(score);
  const present = scores.filter((s): s is number => s !== null);
  if (!present.length) return null;
  const max = Math.max(...present);
  const winners = scores.map((s, i) => (s === max ? i : -1)).filter((i) => i >= 0);
  if (winners.length !== 1) return null;
  return tools[winners[0]];
}

/** Count how many boolean rows in a group each column wins outright. */
export function groupScore(groups: MatrixGroup[], groupId: string, colCount: number): number[] {
  const g = groups.find((x) => x.id === groupId);
  const out = new Array(colCount).fill(0);
  if (!g) return out;
  for (const r of g.rows) {
    r.verdicts.forEach((v, i) => {
      if (v === "better") out[i] += 1;
    });
  }
  return out;
}

/** Rows where columns genuinely diverge — the "key differences" feed. */
export function keyDifferences(groups: MatrixGroup[], tools: ResolvedTool[], limit = 10) {
  const out: Array<{ group: string; label: string; winners: string[] }> = [];
  for (const g of groups) {
    for (const r of g.rows) {
      if (r.identical) continue;
      const winners = r.verdicts.map((v, i) => (v === "better" ? tools[i].tool.name : null)).filter((x): x is string => !!x);
      if (!winners.length || winners.length === tools.length) continue;
      out.push({ group: g.title, label: r.label, winners });
    }
  }
  return out.slice(0, limit);
}
