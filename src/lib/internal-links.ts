/**
 * Internal Linking Engine
 *
 * Scans HTML content and injects links to categories and subcategories on the
 * FIRST occurrence per section (h2 boundary). Skips text already inside an
 * anchor, heading, or code/pre block. Case-insensitive whole-word match.
 *
 * Tool linking is intentionally skipped for now: catalog tools point to
 * external websites, mixing internal/external link semantics would hurt UX
 * and crawl signal. Re-enable once tools have first-party detail pages.
 */
import { catalog } from "@/data/catalog";

interface LinkTarget {
  /** Lower-cased phrase to match. */
  phrase: string;
  /** Replacement <a> href. */
  href: string;
  /** Optional title attribute. */
  title?: string;
}

// Build once at module load.
const TARGETS: LinkTarget[] = (() => {
  const list: LinkTarget[] = [];
  for (const cat of catalog) {
    list.push({
      phrase: cat.name.toLowerCase(),
      href: `/category/${cat.slug}`,
      title: `Browse ${cat.name} on AI Blaze`,
    });
    for (const sub of cat.subs) {
      list.push({
        phrase: sub.name.toLowerCase(),
        href: `/category/${cat.slug}/${sub.slug}`,
        title: `Browse ${sub.name}`,
      });
    }
  }
  // Longest first so "AI Blog Writing Tools" beats "AI Writing Tools".
  list.sort((a, b) => b.phrase.length - a.phrase.length);
  return list;
})();

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Inject internal links into rendered HTML. Operates on HTML *string* — no
 * DOM required, so this is safe to call from SSR / loaders.
 *
 * Algorithm: split content on h2 to scope "first occurrence per section",
 * then within each chunk skip <a>, <h1-6>, <code>, <pre> regions.
 */
export function injectInternalLinks(html: string): string {
  if (!html) return html;

  // Split on h2 boundaries so each section has its own "first occurrence" set.
  const sections = html.split(/(?=<h2\b)/i);

  return sections.map((section) => linkSection(section)).join("");
}

function linkSection(section: string): string {
  // Find no-touch regions: existing anchors, all headings, code/pre.
  const skipRanges = findSkipRanges(section);
  const usedHrefs = new Set<string>();
  let out = section;

  for (const target of TARGETS) {
    if (usedHrefs.has(target.href)) continue;

    const re = new RegExp(`\\b(${escapeRegExp(target.phrase)})\\b`, "i");
    const match = re.exec(stripForMatching(out, skipRanges));
    if (!match) continue;

    // Find the same match in the real string, honoring skip ranges.
    const realIdx = findRealIndex(out, target.phrase, skipRanges);
    if (realIdx === -1) continue;

    const matched = out.slice(realIdx, realIdx + target.phrase.length);
    const replacement =
      `<a href="${target.href}" class="internal-link" data-internal="true"` +
      (target.title ? ` title="${target.title}"` : "") +
      `>${matched}</a>`;

    out = out.slice(0, realIdx) + replacement + out.slice(realIdx + target.phrase.length);
    usedHrefs.add(target.href);

    // Recompute skip ranges since indices shifted and we added a new anchor.
    skipRanges.length = 0;
    skipRanges.push(...findSkipRanges(out));
  }

  return out;
}

interface Range { start: number; end: number }

function findSkipRanges(html: string): Range[] {
  const ranges: Range[] = [];
  const patterns = [
    /<a\b[^>]*>[\s\S]*?<\/a>/gi,
    /<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi,
    /<code\b[^>]*>[\s\S]*?<\/code>/gi,
    /<pre\b[^>]*>[\s\S]*?<\/pre>/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length });
    }
  }
  return ranges.sort((a, b) => a.start - b.start);
}

/** Replace skip-range characters with spaces so regex matches only linkable text. */
function stripForMatching(html: string, skipRanges: Range[]): string {
  if (skipRanges.length === 0) return html;
  const chars = html.split("");
  for (const r of skipRanges) {
    for (let i = r.start; i < r.end && i < chars.length; i++) chars[i] = " ";
  }
  return chars.join("");
}

function findRealIndex(html: string, phrase: string, skipRanges: Range[]): number {
  const lower = html.toLowerCase();
  const needle = phrase.toLowerCase();
  let from = 0;
  while (from < lower.length) {
    const idx = lower.indexOf(needle, from);
    if (idx === -1) return -1;
    const end = idx + needle.length;

    // word boundary check
    const before = idx > 0 ? html[idx - 1] : " ";
    const after = end < html.length ? html[end] : " ";
    const isBoundary = /[^A-Za-z0-9]/.test(before) && /[^A-Za-z0-9]/.test(after);

    // skip-range check
    const inSkip = skipRanges.some((r) => idx < r.end && end > r.start);

    if (isBoundary && !inSkip) return idx;
    from = idx + 1;
  }
  return -1;
}
