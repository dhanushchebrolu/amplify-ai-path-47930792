// Comparison DRAFT generator.
//
// IMPORTANT — this engine is a *draft generator*, not a fact generator.
// Everything it produces is an unverified suggestion meant to pre-fill the
// admin editor. It must NEVER be rendered on a public comparison page.
//
// Public pages may only show:
//   1. Verified admin data (tool_comparison_data with verification_status = 'verified')
//   2. Directly-sourced fields off the `tools` record (name, url, category, tags…)
// Use `safePublicProfile` / `publicProfile` for anything user-facing.

import type { CompareTool, CompareData } from "./compare.functions";
import { extractStartPrice, hostFromUrl, companyFromUrl } from "./compare-utils";


// ────────────────────────────────────────────────────────────────────────
// Signal extraction — normalize every text signal we can read off a tool.
// ────────────────────────────────────────────────────────────────────────

type Signals = {
  tags: Set<string>;         // lowercased tags
  category: string;          // lowercased
  subcategory: string;       // lowercased
  text: string;              // lowercased haystack: name+tagline+desc+cat+tags
  url: string;
};

function signals(tool: CompareTool): Signals {
  const tags = new Set((tool.tags ?? []).map((t) => t.toLowerCase()));
  const cat = (tool.category ?? "").toLowerCase();
  const sub = (tool.subcategory ?? "").toLowerCase();
  const text = [
    tool.name,
    tool.tagline ?? "",
    tool.description ?? "",
    tool.category ?? "",
    tool.subcategory ?? "",
    ...(tool.tags ?? []),
  ]
    .join(" \n ")
    .toLowerCase();
  return { tags, category: cat, subcategory: sub, text, url: tool.url ?? "" };
}

function hasAny(s: Signals, needles: string[]): boolean {
  for (const n of needles) {
    const nl = n.toLowerCase();
    if (s.tags.has(nl)) return true;
    if (s.category.includes(nl)) return true;
    if (s.subcategory.includes(nl)) return true;
    // whole-word-ish match in the text haystack
    if (new RegExp(`\\b${nl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(s.text)) return true;
  }
  return false;
}

// ────────────────────────────────────────────────────────────────────────
// Rule buckets. Each returns items to add to a section.
// ────────────────────────────────────────────────────────────────────────

type RuleSet<T> = Array<{ when: (s: Signals) => boolean; add: T[] }>;

const featureRules: RuleSet<string> = [
  { when: (s) => hasAny(s, ["chat", "conversation", "assistant", "chatbot", "llm"]), add: ["Chat", "Text Generation", "Reasoning"] },
  { when: (s) => hasAny(s, ["writing", "copywriting", "content", "blog", "article"]), add: ["Writing", "Content Generation"] },
  { when: (s) => hasAny(s, ["code", "coding", "developer", "programming", "ide"]), add: ["Code Generation", "Developer Tools", "Programming"] },
  { when: (s) => hasAny(s, ["image", "art", "illustration", "photo", "picture"]), add: ["Image Generation", "Image Editing"] },
  { when: (s) => hasAny(s, ["video", "film", "clip", "animation"]), add: ["Video Generation", "Video Editing"] },
  { when: (s) => hasAny(s, ["voice", "speech", "audio", "tts", "stt"]), add: ["Voice", "Speech Synthesis", "Speech Recognition"] },
  { when: (s) => hasAny(s, ["music", "song", "sound"]), add: ["Music Generation", "Audio"] },
  { when: (s) => hasAny(s, ["search", "research"]), add: ["Web Search", "Research"] },
  { when: (s) => hasAny(s, ["pdf", "document", "docs"]), add: ["Document Analysis", "PDF Chat"] },
  { when: (s) => hasAny(s, ["ocr"]), add: ["OCR"] },
  { when: (s) => hasAny(s, ["translation", "translate", "multilingual"]), add: ["Translation"] },
  { when: (s) => hasAny(s, ["automation", "workflow", "agent", "agents"]), add: ["Workflow Automation", "Agents"] },
  { when: (s) => hasAny(s, ["browse", "browser", "web"]), add: ["Browser"] },
  { when: (s) => hasAny(s, ["api"]), add: ["API"] },
  { when: (s) => hasAny(s, ["plugin", "plugins", "extension", "extensions"]), add: ["Plugins / Extensions"] },
  { when: (s) => hasAny(s, ["mcp"]), add: ["MCP"] },
  { when: (s) => hasAny(s, ["memory"]), add: ["Memory"] },
  { when: (s) => hasAny(s, ["vision", "multimodal"]), add: ["Vision", "Multimodal"] },
  { when: (s) => hasAny(s, ["presentation", "slides", "deck"]), add: ["Presentations"] },
  { when: (s) => hasAny(s, ["spreadsheet", "excel", "sheets"]), add: ["Spreadsheet"] },
  { when: (s) => hasAny(s, ["website", "site builder", "landing page"]), add: ["Website Builder"] },
  { when: (s) => hasAny(s, ["marketing", "ads"]), add: ["Marketing"] },
  { when: (s) => hasAny(s, ["seo"]), add: ["SEO"] },
];

const modelRules: RuleSet<string> = [
  { when: (s) => hasAny(s, ["gpt", "openai", "chatgpt"]), add: ["GPT-4o", "GPT-4"] },
  { when: (s) => hasAny(s, ["claude", "anthropic"]), add: ["Claude 3.5 Sonnet", "Claude 3 Opus"] },
  { when: (s) => hasAny(s, ["gemini", "google ai", "bard"]), add: ["Gemini 1.5 Pro"] },
  { when: (s) => hasAny(s, ["llama", "meta ai"]), add: ["Llama 3"] },
  { when: (s) => hasAny(s, ["mistral"]), add: ["Mistral"] },
  { when: (s) => hasAny(s, ["openrouter"]), add: ["OpenRouter (multi-model)"] },
  { when: (s) => hasAny(s, ["stable diffusion", "sdxl"]), add: ["Stable Diffusion"] },
  { when: (s) => hasAny(s, ["dall-e", "dalle"]), add: ["DALL·E"] },
  { when: (s) => hasAny(s, ["flux"]), add: ["FLUX"] },
  { when: (s) => hasAny(s, ["midjourney"]), add: ["Midjourney"] },
  { when: (s) => hasAny(s, ["sora"]), add: ["Sora"] },
  { when: (s) => hasAny(s, ["runway"]), add: ["Runway Gen-3"] },
  { when: (s) => hasAny(s, ["whisper"]), add: ["Whisper"] },
];

const platformRules: RuleSet<string> = [
  // Web is a near-universal default for cloud AI tools.
  { when: () => true, add: ["Web"] },
  { when: (s) => hasAny(s, ["ios", "iphone", "ipad"]), add: ["iOS"] },
  { when: (s) => hasAny(s, ["android"]), add: ["Android"] },
  { when: (s) => hasAny(s, ["mac", "macos", "osx"]), add: ["macOS"] },
  { when: (s) => hasAny(s, ["windows"]), add: ["Windows"] },
  { when: (s) => hasAny(s, ["linux"]), add: ["Linux"] },
  { when: (s) => hasAny(s, ["chrome extension", "browser extension"]), add: ["Chrome Extension"] },
  { when: (s) => hasAny(s, ["desktop"]), add: ["Desktop"] },
  { when: (s) => hasAny(s, ["self-hosted", "self hosted", "on-prem", "on premise"]), add: ["Self Hosted"] },
  { when: (s) => hasAny(s, ["mobile app", "app store", "play store"]), add: ["iOS", "Android"] },
];

const integrationRules: RuleSet<string> = [
  { when: (s) => hasAny(s, ["slack"]), add: ["Slack"] },
  { when: (s) => hasAny(s, ["discord"]), add: ["Discord"] },
  { when: (s) => hasAny(s, ["github", "gitlab", "bitbucket"]), add: ["GitHub"] },
  { when: (s) => hasAny(s, ["google drive", "gdrive"]), add: ["Google Drive"] },
  { when: (s) => hasAny(s, ["google docs"]), add: ["Google Docs"] },
  { when: (s) => hasAny(s, ["notion"]), add: ["Notion"] },
  { when: (s) => hasAny(s, ["zapier"]), add: ["Zapier"] },
  { when: (s) => hasAny(s, ["make.com", "integromat"]), add: ["Make"] },
  { when: (s) => hasAny(s, ["n8n"]), add: ["n8n"] },
  { when: (s) => hasAny(s, ["canva"]), add: ["Canva"] },
  { when: (s) => hasAny(s, ["figma"]), add: ["Figma"] },
  { when: (s) => hasAny(s, ["wordpress"]), add: ["WordPress"] },
  { when: (s) => hasAny(s, ["hubspot"]), add: ["HubSpot"] },
  { when: (s) => hasAny(s, ["salesforce"]), add: ["Salesforce"] },
  { when: (s) => hasAny(s, ["microsoft office", "outlook", "onedrive", "teams"]), add: ["Microsoft Office"] },
  { when: (s) => hasAny(s, ["shopify"]), add: ["Shopify"] },
];

const useCaseRules: RuleSet<string> = [
  { when: (s) => hasAny(s, ["chat", "writing", "content"]), add: ["Writing & content"] },
  { when: (s) => hasAny(s, ["code", "developer", "programming"]), add: ["Coding & development"] },
  { when: (s) => hasAny(s, ["marketing", "copywriting", "ads"]), add: ["Marketing"] },
  { when: (s) => hasAny(s, ["seo"]), add: ["SEO & organic growth"] },
  { when: (s) => hasAny(s, ["research", "search", "study", "education", "student"]), add: ["Research & learning"] },
  { when: (s) => hasAny(s, ["business", "enterprise", "team", "workspace"]), add: ["Business teams"] },
  { when: (s) => hasAny(s, ["support", "customer service", "helpdesk"]), add: ["Customer support"] },
  { when: (s) => hasAny(s, ["sales", "outreach", "crm"]), add: ["Sales"] },
  { when: (s) => hasAny(s, ["image", "art", "design"]), add: ["Design & visuals"] },
  { when: (s) => hasAny(s, ["video", "animation"]), add: ["Video production"] },
  { when: (s) => hasAny(s, ["voice", "speech", "podcast"]), add: ["Audio & voice"] },
  { when: (s) => hasAny(s, ["automation", "workflow", "agent"]), add: ["Automation & agents"] },
  { when: (s) => hasAny(s, ["presentation", "slides"]), add: ["Presentations"] },
];

const languageRules: RuleSet<string> = [
  // Default: English is a safe baseline for practically every AI tool listed.
  { when: () => true, add: ["English"] },
  { when: (s) => hasAny(s, ["multilingual", "100+ languages", "50+ languages"]), add: ["Multilingual (50+)"] },
  { when: (s) => hasAny(s, ["spanish", "español"]), add: ["Spanish"] },
  { when: (s) => hasAny(s, ["french", "français"]), add: ["French"] },
  { when: (s) => hasAny(s, ["german", "deutsch"]), add: ["German"] },
  { when: (s) => hasAny(s, ["japanese", "日本語"]), add: ["Japanese"] },
  { when: (s) => hasAny(s, ["chinese", "mandarin", "中文"]), add: ["Chinese"] },
  { when: (s) => hasAny(s, ["hindi"]), add: ["Hindi"] },
  { when: (s) => hasAny(s, ["arabic"]), add: ["Arabic"] },
  { when: (s) => hasAny(s, ["portuguese", "português"]), add: ["Portuguese"] },
];

function runRules(s: Signals, rules: RuleSet<string>): string[] {
  const out = new Set<string>();
  for (const r of rules) if (r.when(s)) for (const item of r.add) out.add(item);
  return [...out];
}

// ────────────────────────────────────────────────────────────────────────
// Pricing tier / model
// ────────────────────────────────────────────────────────────────────────

function inferPricingModel(tool: CompareTool): "Free" | "Freemium" | "Paid" | "Enterprise" | null {
  const p = (tool.pricing ?? "").toLowerCase();
  const hasFree = /\bfree\b/.test(p) || tool.tags?.some((t) => /free/i.test(t));
  const hasPaid = /\$|paid|pro|premium|starts?|month|year|team|business/.test(p);
  const enterprise = /enterprise|contact sales/.test(p);
  if (hasFree && hasPaid) return "Freemium";
  if (enterprise && !hasPaid) return "Enterprise";
  if (hasFree) return "Free";
  if (hasPaid) return "Paid";
  return null;
}

function inferPricing(tool: CompareTool) {
  const start = extractStartPrice(null, tool.pricing);
  const model = inferPricingModel(tool);
  const summary = tool.pricing || (model ? `${model}` : "");
  const out: Record<string, unknown> = {};
  if (summary) out.summary = summary;
  if (start !== null) out.starting_at = start;
  if (model) out.model = model;
  return Object.keys(out).length ? out : null;
}

// ────────────────────────────────────────────────────────────────────────
// Pros / Cons / Limitations defaults (marked as "inferred" so admins know)
// ────────────────────────────────────────────────────────────────────────

function inferPros(s: Signals, tool: CompareTool): string[] {
  const out: string[] = [];
  const model = inferPricingModel(tool);
  if (model === "Free" || model === "Freemium") out.push("Has a free plan");
  if (hasAny(s, ["api"])) out.push("API access available");
  if (hasAny(s, ["open source", "open-source"])) out.push("Open source");
  if (hasAny(s, ["multilingual"])) out.push("Multilingual support");
  if (hasAny(s, ["fast", "realtime", "real-time"])) out.push("Fast / real-time responses");
  if (hasAny(s, ["team", "collaboration", "collaborative"])) out.push("Built for team collaboration");
  if (hasAny(s, ["integrations", "integrate"])) out.push("Wide range of integrations");
  return out;
}

function inferCons(s: Signals, tool: CompareTool): string[] {
  const out: string[] = [];
  const model = inferPricingModel(tool);
  if (model === "Freemium") out.push("Best features gated behind paid plans");
  if (model === "Enterprise") out.push("Pricing not public — requires sales contact");
  if (hasAny(s, ["cloud", "web"]) && !hasAny(s, ["self-hosted", "on-prem"])) out.push("Cloud-only — internet required");
  if (hasAny(s, ["chat", "llm"])) out.push("Subject to model rate limits");
  return out;
}

function inferLimitations(s: Signals): string[] {
  const out: string[] = [];
  out.push("Requires an account to use");
  if (hasAny(s, ["cloud", "web"]) && !hasAny(s, ["self-hosted"])) out.push("Cloud only");
  if (hasAny(s, ["chat", "llm"])) out.push("Limited context window (model-dependent)");
  return out;
}

// ────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────

export type InferredProfile = NonNullable<CompareData>;
export type VerificationStatus = "draft" | "needs_review" | "verified";

function emptyProfile(tool: CompareTool): InferredProfile {
  return {
    company: null,
    website: tool.url ?? null,
    launch_year: null,
    status: "draft",
    verification_status: "draft",
    verified_at: null,
    source_url: null,
    open_source: false,
    api_available: false,
    pricing: {} as InferredProfile["pricing"],
    models: {} as InferredProfile["models"],
    features: {} as InferredProfile["features"],
    platforms: {} as InferredProfile["platforms"],
    languages: {} as InferredProfile["languages"],
    integrations: {} as InferredProfile["integrations"],
    use_cases: [],
    limitations: {} as InferredProfile["limitations"],
    pros: [],
    cons: [],
    media: {} as InferredProfile["media"],
    seo: {} as InferredProfile["seo"],
    metadata: {} as InferredProfile["metadata"],
    updated_at: new Date().toISOString(),
  };
}

/**
 * ADMIN ONLY — generates an unverified DRAFT profile from keyword signals.
 * Every factual field it emits (models, integrations, API support, platforms,
 * limitations, pricing model…) is a guess that an editor must confirm.
 * Never call this from a public route.
 */
export function inferDraftProfile(tool: CompareTool): InferredProfile {
  const s = signals(tool);
  const features = runRules(s, featureRules).reduce<Record<string, boolean>>((acc, k) => {
    acc[k] = true;
    return acc;
  }, {});
  return {
    ...emptyProfile(tool),
    company: companyFromUrl(tool.url),
    website: tool.url ?? null,
    open_source: hasAny(s, ["open source", "open-source"]),
    api_available: hasAny(s, ["api"]),
    pricing: (inferPricing(tool) ?? {}) as InferredProfile["pricing"],
    models: { items: runRules(s, modelRules) } as InferredProfile["models"],
    features: features as InferredProfile["features"],
    platforms: { items: runRules(s, platformRules) } as InferredProfile["platforms"],
    languages: { items: runRules(s, languageRules) } as InferredProfile["languages"],
    integrations: { items: runRules(s, integrationRules) } as InferredProfile["integrations"],
    use_cases: runRules(s, useCaseRules),
    limitations: { items: inferLimitations(s) } as InferredProfile["limitations"],
    pros: inferPros(s, tool),
    cons: inferCons(s, tool),
    metadata: { host: hostFromUrl(tool.url), generated: "draft-inference" } as InferredProfile["metadata"],
  };
}

/** @deprecated admin-only alias kept for callers of the old name. */
export const inferProfile = inferDraftProfile;

/**
 * PUBLIC-SAFE baseline. Contains only values read directly off the `tools`
 * record — no inferred capabilities of any kind. Pricing here is the
 * human-entered `tools.pricing` label, not a derived tier structure.
 */
export function safePublicProfile(tool: CompareTool): InferredProfile {
  const base = emptyProfile(tool);
  return {
    ...base,
    website: tool.url ?? null,
    pricing: (tool.pricing ? { summary: tool.pricing } : {}) as InferredProfile["pricing"],
  };
}

// ────────────────────────────────────────────────────────────────────────
// Merge helpers
// ────────────────────────────────────────────────────────────────────────

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if (Array.isArray(obj.items)) return (obj.items as unknown[]).length === 0;
    return Object.keys(obj).length === 0;
  }
  if (typeof v === "string") return v.trim() === "";
  return false;
}

/**
 * What a public comparison page renders.
 *
 * Layer 1 — the safe baseline built purely from the `tools` record
 *           (website, human-entered pricing label). No guessed facts, ever.
 * Layer 2 — stored admin data, which always wins field-by-field.
 *
 * Every tool therefore has a published profile automatically; admin edits
 * override it and are never overwritten.
 */
export function publicProfile(
  tool: CompareTool,
  stored: CompareData | null,
): { profile: InferredProfile; verified: boolean } {
  const safe = safePublicProfile(tool);
  if (!stored) {
    return { profile: safe, verified: false };
  }
  const pick = <K extends keyof InferredProfile>(k: K): InferredProfile[K] =>
    (isEmpty(stored[k]) ? safe[k] : stored[k]) as InferredProfile[K];
  return {
    verified: true,
    profile: {
      company: stored.company ?? safe.company,
      website: stored.website ?? safe.website,
      launch_year: stored.launch_year ?? null,
      status: stored.status ?? "published",
      verification_status: "verified",
      verified_at: stored.verified_at ?? null,
      source_url: stored.source_url ?? null,
      open_source: stored.open_source,
      api_available: stored.api_available,
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
      updated_at: stored.updated_at ?? safe.updated_at,
    },
  };
}

export { isEmpty as isEmptyValue };
