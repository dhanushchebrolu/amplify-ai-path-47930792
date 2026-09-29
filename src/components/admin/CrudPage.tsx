import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, lazy, Suspense } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, Pencil as PencilIcon } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { ImageField } from "./ImageField";
import { CharCounterInput } from "./CharCounterInput";
import { BlogContent } from "@/components/BlogContent";

const HtmlEditor = lazy(() => import("./HtmlEditor").then((m) => ({ default: m.HtmlEditor })));

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "markdown" | "html" | "url" | "number" | "tags" | "select" | "steps" | "image" | "boolean" | "seo-title" | "seo-description";
  options?: string[];
  required?: boolean;
  imageFolder?: string;
  hint?: string;
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
  const upsert = useServerFn(upsertFn as any);
  const remove = useServerFn(deleteFn as any);
  const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: listFn });
  const [editing, setEditing] = useState<T | null>(null);

  const save = useMutation({
    mutationFn: (v: T) => upsert({ data: v }) as Promise<{ id: string }>,
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }) as Promise<{ ok: boolean }>,
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

      <div className="mt-6 border border-foreground/10 rounded-2xl overflow-hidden">
        {isLoading ? <div className="p-6 text-muted-foreground text-sm">Loading…</div>
          : (data?.length ?? 0) === 0 ? <div className="p-6 text-muted-foreground text-sm">No entries yet. Click "New" to add one.</div>
          : <ul className="divide-y divide-foreground/10">
              {data!.map((it: any) => (
                <li key={it.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">{renderRow(it)}</div>
                  <button onClick={() => setEditing(it)} className="p-2 hover:bg-foreground/5 rounded-lg" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
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
      <div className="bg-background border border-foreground/10 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl mb-4">{form.id ? "Edit" : "Create"}</h2>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.name}>
              {f.type !== "image" && f.type !== "boolean" && (
                <label className="text-xs text-muted-foreground">{f.label}{f.required && " *"}</label>
              )}
              {f.type === "image" ? (
                <ImageField value={form[f.name]} onChange={(v) => set(f.name, v)} folder={f.imageFolder ?? "misc"} label={f.label} />
              ) : f.type === "boolean" ? (
                <label className="inline-flex items-center gap-2 mt-1 cursor-pointer">
                  <input type="checkbox" checked={!!form[f.name]} onChange={(e) => set(f.name, e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm">{f.label}</span>
                </label>
              ) : f.type === "textarea" ? (
                <textarea rows={4} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25 font-mono" />
              ) : f.type === "markdown" ? (
                <MarkdownField value={form[f.name] ?? ""} onChange={(v) => set(f.name, v)} />
              ) : f.type === "html" ? (
                <Suspense fallback={<div className="text-xs text-muted-foreground p-3">Loading editor…</div>}>
                  <HtmlEditor
                    value={form[f.name] ?? ""}
                    onChange={(v) => set(f.name, v)}
                    onBulkImport={(patch) => setForm((prev: any) => ({ ...prev, ...patch }))}
                  />
                </Suspense>
              ) : f.type === "seo-title" ? (
                <CharCounterInput value={form[f.name] ?? ""} onChange={(v) => set(f.name, v)} recommendedMin={50} recommendedMax={60} />
              ) : f.type === "seo-description" ? (
                <CharCounterInput value={form[f.name] ?? ""} onChange={(v) => set(f.name, v)} recommendedMin={150} recommendedMax={160} multiline />
              ) : f.type === "select" ? (
                <select value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm">
                  {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === "tags" ? (
                <input value={(form[f.name] ?? []).join(", ")} onChange={(e) => set(f.name, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder="comma, separated, tags"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25" />
              ) : f.type === "steps" ? (
                <textarea rows={4} value={(form[f.name] ?? []).join("\n")} onChange={(e) => set(f.name, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                  placeholder="one step per line"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25" />
              ) : f.type === "number" ? (
                <input type="number" value={form[f.name] ?? 0} onChange={(e) => set(f.name, Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25" />
              ) : (
                <input type={f.type === "url" ? "url" : "text"} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-foreground/10 text-sm">Cancel</button>
          <button onClick={() => {
            const cleaned: any = {};
            const urlFields = new Set(fields.filter((f) => f.type === "url" || f.type === "image").map((f) => f.name));
            for (const k of Object.keys(form)) {
              const v = form[k];
              if (v === "" || v === undefined) {
                // For url/image fields, send null so nullable schemas accept it.
                // For other fields, omit so Zod defaults kick in and required fields surface a clear error.
                if (urlFields.has(k)) cleaned[k] = null;
                continue;
              }
              cleaned[k] = v;
            }
            onSubmit(cleaned);
          }} disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

function MarkdownField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  return (
    <div className="mt-1 rounded-xl border border-foreground/10 overflow-hidden">
      <div className="flex items-center gap-1 bg-foreground/[0.03] border-b border-foreground/10 px-2 py-1.5">
        <button type="button" onClick={() => setTab("write")}
          className={"px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1.5 " + (tab === "write" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
          <PencilIcon className="w-3 h-3" /> Write
        </button>
        <button type="button" onClick={() => setTab("preview")}
          className={"px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1.5 " + (tab === "preview" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
          <Eye className="w-3 h-3" /> Preview
        </button>
        <span className="ml-auto text-[10px] text-muted-foreground pr-1">Markdown supported</span>
      </div>
      {tab === "write" ? (
        <textarea
          rows={18}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Heading&#10;&#10;Paragraph text. **Bold**, *italic*, `code`.&#10;&#10;- bullet&#10;- list&#10;&#10;> Quote&#10;&#10;```js&#10;const x = 1;&#10;```"
          className="w-full px-3 py-2.5 bg-transparent text-sm outline-none font-mono leading-relaxed resize-y min-h-[280px]"
        />
      ) : (
        <div className="px-5 py-4 max-h-[60vh] overflow-auto">
          {value.trim() ? <BlogContent content={value} /> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
        </div>
      )}
    </div>
  );
}
