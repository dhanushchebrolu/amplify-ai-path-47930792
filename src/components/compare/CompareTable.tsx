import { Check, Minus, Crown } from "lucide-react";
import { useState } from "react";
import type { Cell, MatrixGroup, ResolvedTool, Verdict } from "@/lib/compare-matrix";

const verdictClass: Record<Verdict, string> = {
  better: "bg-emerald-500/12 text-emerald-300",
  similar: "bg-amber-400/10 text-foreground",
  none: "bg-white/[0.02] text-muted-foreground/50",
};

function CellView({ cell, verdict }: { cell: Cell; verdict: Verdict }) {
  if (cell.kind === "bool") {
    return cell.v ? (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <Check className="w-4 h-4 text-emerald-400" /> Yes
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60">
        <Minus className="w-4 h-4" /> No
      </span>
    );
  }
  if (cell.kind === "num") {
    return <span className="text-sm font-medium">{cell.display ?? "—"}</span>;
  }
  if (cell.kind === "list") {
    if (!cell.v.length) return <span className="text-sm text-muted-foreground/50">—</span>;
    return (
      <span className="flex flex-wrap gap-1">
        {cell.v.slice(0, 12).map((s) => (
          <span key={s} className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px]">
            {s}
          </span>
        ))}
      </span>
    );
  }
  void verdict;
  return cell.v ? (
    <span className="text-sm break-words">{cell.v}</span>
  ) : (
    <span className="text-sm text-muted-foreground/50">—</span>
  );
}

export function CompareTable({
  groups,
  tools,
  differencesOnlyDefault = false,
}: {
  groups: MatrixGroup[];
  tools: ResolvedTool[];
  differencesOnlyDefault?: boolean;
}) {
  const [diffOnly, setDiffOnly] = useState(differencesOnlyDefault);
  const cols = tools.length;
  const gridTemplate = { gridTemplateColumns: `minmax(140px,1.1fr) repeat(${cols}, minmax(120px,1fr))` };

  const visible = groups
    .map((g) => ({ ...g, rows: diffOnly ? g.rows.filter((r) => !r.identical) : g.rows }))
    .filter((g) => g.rows.length > 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Legend />
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={diffOnly}
            onChange={(e) => setDiffOnly(e.target.checked)}
            className="accent-primary w-4 h-4"
          />
          Show differences only
        </label>
      </div>

      {visible.map((g) => (
        <section key={g.id} id={`section-${g.id}`} className="scroll-mt-36">
          <h2 className="font-display text-2xl mb-3">{g.title}</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <div className="min-w-[560px]">
              <div
                className="grid bg-white/[0.05] border-b border-white/10"
                style={gridTemplate}
              >
                <div className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Feature</div>
                {tools.map((t) => (
                  <div key={t.tool.id} className="px-4 py-2.5 text-xs font-semibold truncate">
                    {t.tool.name}
                  </div>
                ))}
              </div>
              {g.rows.map((r, ri) => (
                <div
                  key={r.key}
                  className={`grid border-b border-white/5 last:border-b-0 ${ri % 2 ? "bg-white/[0.015]" : ""}`}
                  style={gridTemplate}
                >
                  <div className="px-4 py-3 text-sm text-muted-foreground sticky left-0 bg-background/80 backdrop-blur-sm">
                    {r.label}
                  </div>
                  {r.cells.map((c, ci) => (
                    <div
                      key={ci}
                      className={`px-4 py-3 transition-colors ${verdictClass[r.verdicts[ci]]} ${
                        r.verdicts[ci] === "better" ? "relative" : ""
                      }`}
                    >
                      {r.verdicts[ci] === "better" && !r.identical && (
                        <Crown className="absolute top-2.5 right-2.5 w-3 h-3 text-emerald-400/70" aria-label="Better" />
                      )}
                      <CellView cell={c} verdict={r.verdicts[ci]} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-emerald-500/40" /> Better
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-amber-400/30" /> Similar
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-white/10" /> Not available
      </span>
    </div>
  );
}
