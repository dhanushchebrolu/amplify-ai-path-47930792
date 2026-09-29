import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { listComparisonAdmin } from "@/lib/compare.functions";

export const Route = createFileRoute("/_admin/admin/comparison-data")({
  component: ComparisonDataList,
});

type Row = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  category: string | null;
  has_data: boolean;
  status: string | null;
  verification_status: string | null;

  updated_at: string | null;
};

function ComparisonDataList() {
  const listFn = useServerFn(listComparisonAdmin);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    listFn()
      .then((r) => setRows(r as Row[]))
      .finally(() => setLoading(false));
  }, [listFn]);

  const filtered = rows.filter(
    (r) => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.slug.includes(q.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Comparison Data</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in structured comparison info for each tool. Published rows appear on /compare.
          </p>
        </div>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search tools…"
        className="w-full max-w-md mb-4 rounded-lg bg-foreground/[0.04] border border-foreground/10 px-3 py-2 text-sm outline-none"
      />

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading…</div>
      ) : (
        <div className="rounded-2xl border border-foreground/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-foreground/[0.04] text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Tool</th>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Updated</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-foreground/5">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {r.logo_url ? (
                        <img src={r.logo_url} alt="" className="w-6 h-6 rounded" />
                      ) : (
                        <div className="w-6 h-6 rounded bg-foreground/10" />
                      )}
                      <span className="font-medium">{r.name}</span>
                      <span className="text-muted-foreground text-xs">{r.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{r.category || "—"}</td>
                  <td className="px-4 py-2">
                    {r.has_data ? (
                      <span className="text-emerald-400 text-xs">● Customised</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Auto-generated</span>
                    )}
                  </td>

                  <td className="px-4 py-2 text-muted-foreground text-xs">
                    {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to="/admin/comparison-data/$toolId"
                      params={{ toolId: r.id }}
                      className="text-primary-ink hover:underline text-xs"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
