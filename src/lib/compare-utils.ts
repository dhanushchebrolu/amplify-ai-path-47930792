// Client-safe helpers for comparison feature.

const slugRe = /^[a-z0-9-]+$/;

export function parseMatchup(matchup: string): string[] | null {
  if (!matchup || matchup.length > 500) return null;
  const parts = matchup.split("-vs-");
  if (parts.length < 2 || parts.length > 4) return null;
  for (const p of parts) if (!slugRe.test(p)) return null;
  return parts;
}

export function canonicalMatchup(slugs: string[]): string {
  return [...slugs].sort((a, b) => a.localeCompare(b)).join("-vs-");
}

export function isCanonical(slugs: string[]): boolean {
  return slugs.join("-vs-") === canonicalMatchup(slugs);
}

/** Extract a numeric "starting price" (USD/mo) from a free-form pricing string or JSON. */
export function extractStartPrice(pricing: unknown, fallback?: string | null): number | null {
  const consider = (s: string): number | null => {
    // Handle "free"
    if (/\bfree\b/i.test(s) && !/starts|from/i.test(s)) return 0;
    const m = s.match(/\$\s*([0-9]+(?:\.[0-9]+)?)/);
    if (m) return parseFloat(m[1]);
    return null;
  };
  if (pricing && typeof pricing === "object") {
    const obj = pricing as Record<string, unknown>;
    if (typeof obj.starting_at === "number") return obj.starting_at;
    if (typeof obj.starting_at === "string") {
      const v = consider(obj.starting_at);
      if (v !== null) return v;
    }
    if (Array.isArray(obj.tiers)) {
      const prices = (obj.tiers as unknown[])
        .map((t) => {
          if (t && typeof t === "object") {
            const tt = t as Record<string, unknown>;
            if (typeof tt.price === "number") return tt.price;
            if (typeof tt.price === "string") return consider(tt.price);
          }
          return null;
        })
        .filter((n): n is number => typeof n === "number");
      if (prices.length) return Math.min(...prices);
    }
    if (typeof obj.summary === "string") {
      const v = consider(obj.summary);
      if (v !== null) return v;
    }
  }
  if (fallback) return consider(fallback);
  return null;
}

export function countValues(v: unknown): number {
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === "object") return Object.keys(v as object).length;
  return 0;
}

export function collectStringList(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items.filter((x) => typeof x === "string") as string[];
    return Object.keys(obj);
  }
  return [];
}

/** Derive a hostname (no protocol, no www) from a URL string. */
export function hostFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Derive a human-readable company name from a URL (e.g. "openai.com" -> "OpenAI"). */
export function companyFromUrl(url: string | null | undefined): string | null {
  const host = hostFromUrl(url);
  if (!host) return null;
  const core = host.split(".").slice(0, -1).join(".") || host;
  return core
    .split(/[-.]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

