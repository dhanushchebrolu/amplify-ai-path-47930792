import sanitize from "sanitize-html";

/**
 * Sanitize semantic HTML for blog content.
 * Allows headings, lists, tables, code blocks, links, images, etc.
 * Strips scripts, iframes, event handlers, javascript: URLs.
 *
 * IMPORTANT — runtime notes:
 * This app is deployed to Cloudflare Workers (see wrangler.jsonc), and this
 * function runs both in the browser AND during SSR/server-function calls
 * (e.g. saving a blog post, or rendering any /blog/:slug page).
 *
 * We previously used `isomorphic-dompurify`, which falls back to `jsdom` on
 * the server. `jsdom` depends on Node APIs (vm, worker_threads, etc.) that
 * Cloudflare Workers' `nodejs_compat` does not fully implement, which caused
 * a hard-to-diagnose crash — `Cannot read properties of undefined (reading
 * 'bind')` — every time this ran on the server.
 *
 * A lightweight DOM-emulator (e.g. linkedom) avoids the crash, but DOMPurify
 * relies on prototype getters (e.g. `parentNode`) and globals (`NodeFilter`)
 * that most lightweight DOM emulators don't fully implement — DOMPurify then
 * silently reports itself "unsupported" and returns the HTML completely
 * unsanitized instead of throwing, which is worse (a silent XSS hole).
 *
 * `sanitize-html` (built on `htmlparser2`) needs no DOM at all — it's a pure
 * string/SAX-based sanitizer — so it behaves identically and safely in the
 * browser, in SSR, and in Cloudflare Workers.
 */

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "div", "span",
  "strong", "em", "u", "s", "del", "ins", "mark", "sub", "sup", "small",
  "blockquote", "pre", "code", "kbd", "samp", "var",
  "ul", "ol", "li",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th", "caption", "colgroup", "col",
  "details", "summary",
];

const ALLOWED_ATTRS = [
  "href", "src", "alt", "title", "target", "rel",
  "id", "class", "name",
  "colspan", "rowspan", "scope",
  "loading", "width", "height",
  "data-checked", "data-type", "data-id",
  "start", "type", // ordered list
];

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  try {
    return sanitize(input, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {
        "*": ALLOWED_ATTRS,
      },
      allowedSchemes: ["http", "https", "mailto"],
      allowedSchemesByTag: {
        img: ["http", "https", "data"],
      },
      allowProtocolRelative: true,
      // script/style are already excluded from allowedTags, and sanitize-html
      // discards their inner content by default (nonTextTags), so no
      // executable code or CSS can survive.
      disallowedTagsMode: "discard",
    });
  } catch (err) {
    // Never let a sanitizer failure take down the whole page/save request —
    // fail safe by stripping all tags instead of crashing the request.
    console.error("[sanitizeHtml] sanitize-html failed, stripping tags as a fallback:", err);
    return input.replace(/<[^>]*>/g, "");
  }
}

/** Auto-add slug ids to h2/h3 for anchor linking. */
export function addHeadingIds(html: string): string {
  return html.replace(/<(h[1-6])(\s[^>]*)?>([\s\S]*?)<\/\1>/g, (_m, tag, attrs = "", inner) => {
    if (/\sid=/.test(attrs)) return `<${tag}${attrs}>${inner}</${tag}>`;
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
    if (!id) return `<${tag}${attrs}>${inner}</${tag}>`;
    return `<${tag} id="${id}"${attrs}>${inner}</${tag}>`;
  });
}

/** Quick content stats for editor UI. */
export function htmlStats(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return {
    words,
    readingTime: Math.max(1, Math.round(words / 220)),
    headings: (html.match(/<h[1-6][\s>]/g) ?? []).length,
    images: (html.match(/<img[\s>]/g) ?? []).length,
    tables: (html.match(/<table[\s>]/g) ?? []).length,
  };
}
