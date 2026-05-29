import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "url" | "number" | "tags" | "select" | "steps";
  options?: string[];
  required?: boolean;
}

export function CrudPage<T extends { id?: string }>({
  title, queryKey, listFn, upsertFn, deleteFn, fields, renderRow, emptyValues,
}: {
  title: string;
  queryKey: string;
  listFn: () => Promise<any[]>;
  upsertFn: (data: { data: T }) => Promise<{ id: string }>;
  deleteFn: (data: { data: { id: string } }) => Promise<{ ok: boolean }>;
  fields: FieldDef[];
  renderRow: (item: any) => React.ReactNode;
  emptyValues: T;
}) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: listFn });
  const [editing, setEditing] = useState<T | null>(null);

  const save = useMutation({
    mutationFn: (v: T) => upsertFn({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message ?? "Delete failed"),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">{title}</h1>
        <button onClick={() => setEditing({ ...emptyValues })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      <div className="mt-6 border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? <div className="p-6 text-muted-foreground text-sm">Loading…</div>
          : (data?.length ?? 0) === 0 ? <div className="p-6 text-muted-foreground text-sm">No entries yet. Click "New" to add one.</div>
          : <ul className="divide-y divide-white/10">
              {data!.map((it: any) => (
                <li key={it.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">{renderRow(it)}</div>
                  <button onClick={() => setEditing(it)} className="p-2 hover:bg-white/5 rounded-lg" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { if (confirm("Delete this entry?")) del.mutate(it.id); }} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>}
      </div>

      {editing && (
        <EditDialog values={editing} fields={fields}
          onClose={() => setEditing(null)}
          onSubmit={(v) => save.mutate(v as T)} saving={save.isPending} />
      )}
    </div>
  );
}

function EditDialog({ values, fields, onClose, onSubmit, saving }: {
  values: any; fields: FieldDef[]; onClose: () => void; onSubmit: (v: any) => void; saving: boolean;
}) {
  const [form, setForm] = useState<any>(values);

  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl mb-4">{form.id ? "Edit" : "Create"}</h2>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-xs text-muted-foreground">{f.label}{f.required && " *"}</label>
              {f.type === "textarea" ? (
                <textarea rows={4} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25 font-mono" />
              ) : f.type === "select" ? (
                <select value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm">
                  {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === "tags" ? (
                <input value={(form[f.name] ?? []).join(", ")} onChange={(e) => set(f.name, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder="comma, separated, tags"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25" />
              ) : f.type === "steps" ? (
                <textarea rows={4} value={(form[f.name] ?? []).join("\n")} onChange={(e) => set(f.name, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                  placeholder="one step per line"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25" />
              ) : f.type === "number" ? (
                <input type="number" value={form[f.name] ?? 0} onChange={(e) => set(f.name, Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25" />
              ) : (
                <input type={f.type === "url" ? "url" : "text"} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-sm">Cancel</button>
          <button onClick={() => {
            const cleaned: any = {};
            for (const k of Object.keys(form)) {
              const v = form[k];
              cleaned[k] = v === "" ? null : v;
            }
            onSubmit(cleaned);
          }} disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
