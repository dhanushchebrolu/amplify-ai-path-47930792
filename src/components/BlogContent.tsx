import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { useMemo } from "react";
import "highlight.js/styles/github-dark.css";

interface Props {
  content: string;
  className?: string;
}

/**
 * Detects plain-text content (no markdown signals) and lightly upgrades it
 * to markdown before rendering — turns "Q: ..." / "A: ..." patterns,
 * obvious headings, and bulleted lines into proper markdown.
 */
function normalize(raw: string): string {
  if (!raw) return "";
  const hasMd =
    /(^|\n)#{1,6}\s/.test(raw) ||
    /(^|\n)[*-]\s/.test(raw) ||
    /(^|\n)\d+\.\s/.test(raw) ||
    /```/.test(raw) ||
    /(^|\n)>\s/.test(raw) ||
    /\*\*[^*]+\*\*/.test(raw) ||
    /\[[^\]]+\]\([^)]+\)/.test(raw);
  if (hasMd) return raw;

  // Plain-text fallback: turn ALL-CAPS-ish short lines into H2, "Q:/A:" into Q&A.
  const lines = raw.split(/\r?\n/);
  return lines
    .map((line) => {
      const t = line.trim();
      if (!t) return "";
      if (/^Q[:.]\s+/i.test(t)) return `### ${t.replace(/^Q[:.]\s+/i, "")}`;
      if (/^A[:.]\s+/i.test(t)) return t.replace(/^A[:.]\s+/i, "");
      if (t.length < 80 && /^[A-Z0-9][\w\s\-:&'"]+$/.test(t) && !/[.!?]$/.test(t)) {
        return `## ${t}`;
      }
      return t;
    })
    .join("\n\n");
}

export function BlogContent({ content, className }: Props) {
  const md = useMemo(() => normalize(content), [content]);

  return (
    <article className={"blog-content " + (className ?? "")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          a: ({ href, children, ...rest }) => {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                {...rest}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => (
            <img src={src ?? ""} alt={alt ?? ""} loading="lazy" className="blog-img" />
          ),
          table: ({ children }) => (
            <div className="blog-table-wrap">
              <table>{children}</table>
            </div>
          ),
          blockquote: ({ children }) => {
            // Detect callout style: > 💡 Tip: ...
            return <blockquote>{children}</blockquote>;
          },
        }}
      >
        {md}
      </ReactMarkdown>
    </article>
  );
}
