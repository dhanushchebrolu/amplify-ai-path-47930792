import type { SeoLongForm } from "@/lib/seo.functions";

interface Props {
  longForm: SeoLongForm | null | undefined;
  /** Rendered above the grid (intro only). */
  position: "above" | "below";
}

/**
 * Renders AI-generated long-form SEO content in semantic HTML.
 * Splits naturally: intro renders above the tool grid, everything else below.
 * Designed so every text node ships in initial SSR HTML — no JS-gated content.
 */
export function SeoLongForm({ longForm, position }: Props) {
  if (!longForm) return null;

  if (position === "above") {
    if (!longForm.intro) return null;
    return (
      <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        {longForm.intro.split(/\n{2,}/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }

  const { sections, faqs, buying_guide, comparison, conclusion, related } = longForm;
  const hasAny =
    (sections && sections.length) ||
    (faqs && faqs.length) ||
    buying_guide ||
    (comparison && comparison.length) ||
    conclusion ||
    (related && related.length);
  if (!hasAny) return null;

  return (
    <div className="mt-16 max-w-3xl space-y-12">
      {sections?.map((s, i) => (
        <section key={i}>
          <h2 className="font-display text-2xl md:text-3xl mb-3">{s.heading}</h2>
          <div className="text-[15px] leading-relaxed text-muted-foreground space-y-3">
            {s.body.split(/\n{2,}/).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </section>
      ))}

      {buying_guide && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl mb-3">Buying guide</h2>
          <div className="text-[15px] leading-relaxed text-muted-foreground space-y-3">
            {buying_guide.split(/\n{2,}/).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {comparison && comparison.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl mb-4">At-a-glance comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-foreground/10">
            <table className="w-full text-sm text-left">
              <thead className="bg-foreground/[0.04] text-muted-foreground">
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
                  <tr key={i} className="border-t border-foreground/5">
                    <td className="px-4 py-3 font-medium text-foreground">{row.tool}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.strengths}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.weaknesses}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.ideal_for}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.pricing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {faqs && faqs.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl mb-4">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="card-surface p-5 rounded-2xl border border-foreground/10 group"
              >
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                  <span>{f.q}</span>
                  <span className="text-primary-ink group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {conclusion && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl mb-3">The bottom line</h2>
          <div className="text-[15px] leading-relaxed text-muted-foreground space-y-3">
            {conclusion.split(/\n{2,}/).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {related && related.length > 0 && (
        <section>
          <h2 className="font-display text-xl mb-3">Related</h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((r, i) => (
              <li key={i}>
                <a
                  href={r.href}
                  className="text-xs px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]"
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
