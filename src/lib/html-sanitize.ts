import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize semantic HTML for blog content.
 * Allows headings, lists, tables, code blocks, links, images, etc.
 * Strips scripts, iframes, event handlers, javascript: URLs.
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
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "style", "link", "meta"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "style"],
    ALLOW_DATA_ATTR: false,
  });
  return clean;
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
