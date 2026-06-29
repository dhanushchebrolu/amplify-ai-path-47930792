import type { RichSeoContent } from "@/lib/category-seo-content";
import { Link } from "@tanstack/react-router";

/** Render bold inline markers (**text**) as <strong>. Plain, no extra deps. */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
  );
}

function Para({ text }: { text: string }) {
  return <p>{renderInline(text)}</p>;
}

interface RelatedLink { label: string; to: string; params?: Record<string, string> }

interface Props {
  content: RichSeoContent;
  /** Cross-links rendered at the very end. Internal links improve crawlability. */
  related?: RelatedLink[];
}

/** Comprehensive long-form SEO block. Rendered below the tool grid. */
export function RichSeoBlock({ content, related }: Props) {
  const { intro, sections, comparison, faqs, conclusion } = content;

  return (
    <div className="mt-16 max-w-3xl space-y-12 text-[15px] leading-relaxed text-muted-foreground">
      {intro && (
        <section>
          {intro.split(/\n{2,}/).map((p, i) => (
            <Para key={i} text={p} />
          ))}
        </section>
      )}

      {sections.map((s, i) => (
        <section key={i}>
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">{s.heading}</h2>
          <div className="space-y-3">
            {s.body.split(/\n{2,}/).map((p, j) => (
              <Para key={j} text={p} />
            ))}
          </div>
        </section>
      ))}

      {comparison && comparison.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">At-a-glance comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.04] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Tool</th>
                  <th className="px-4 py-3 font-medium">Strengths</th>
                  <th className="px-4 py-3 font-medium">Weaknesses</th>
                  <th className="px-4 py-3 font-medium">Ideal for</th>
                  <th className="px-4 py-3 font-medium">Pricing</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="px-4 py-3 font-medium text-foreground">{row.tool}</td>
                    <td className="px-4 py-3">{row.strengths}</td>
                    <td className="px-4 py-3">{row.weaknesses}</td>
                    <td className="px-4 py-3">{row.ideal_for}</td>
                    <td className="px-4 py-3">{row.pricing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="card-surface p-5 rounded-2xl border border-white/10 group">
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center text-foreground">
                  <span>{f.q}</span>
                  <span className="text-primary group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {conclusion && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">The bottom line</h2>
          <Para text={conclusion} />
        </section>
      )}

      {related && related.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-foreground mb-3">Related categories</h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((r, i) => (
              <li key={i}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Link
                  to={r.to as any}
                  params={r.params as any}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
