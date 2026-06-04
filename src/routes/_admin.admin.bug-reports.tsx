import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/_admin/admin/bug-reports")({
  component: BugReportsAdmin,
});

function BugReportsAdmin() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "bug-reports", filter],
    queryFn: async () => {
      let q = supabase.from("bug_reports").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("bug_reports").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin", "bug-reports"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this report?")) return;
    const { error } = await supabase.from("bug_reports").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "bug-reports"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl">Bug reports & contact</h1>
          <p className="text-muted-foreground mt-2 text-sm">Submissions from the floating "Report a bug" button and the contact form.</p>
        </div>
        <div className="flex gap-2 text-sm">
          {["all", "new", "in_progress", "resolved"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full border ${filter === s ? "bg-primary text-primary-foreground border-primary" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {!isLoading && (data ?? []).length === 0 && <p className="text-muted-foreground">No reports yet.</p>}
        {(data ?? []).map((r: any) => (
          <div key={r.id} className="card-surface rounded-2xl border border-white/10 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badgeClass(r.severity)}`}>{r.severity}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass(r.status)}`}>{r.status}</span>
                  <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <h3 className="mt-2 font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm whitespace-pre-wrap text-foreground/90">{r.description}</p>
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  {r.reporter_email && <div>From: <a href={`mailto:${r.reporter_email}`} className="text-primary hover:underline">{r.reporter_email}</a></div>}
                  {r.page_url && <div>Page: <a href={r.page_url} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">{r.page_url}</a></div>}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "in_progress")}>In progress</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "resolved")}>Resolve</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-destructive">Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function badgeClass(sev: string) {
  switch (sev) {
    case "critical": return "bg-red-500/20 text-red-300";
    case "high": return "bg-orange-500/20 text-orange-300";
    case "medium": return "bg-yellow-500/20 text-yellow-300";
    case "low": return "bg-blue-500/20 text-blue-300";
    case "contact": return "bg-purple-500/20 text-purple-300";
    default: return "bg-white/10 text-foreground";
  }
}
function statusClass(s: string) {
  switch (s) {
    case "new": return "bg-primary/20 text-primary";
    case "in_progress": return "bg-yellow-500/20 text-yellow-300";
    case "resolved": return "bg-green-500/20 text-green-300";
    default: return "bg-white/10 text-foreground";
  }
}
