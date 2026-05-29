import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import {
  listCategories, upsertCategory, deleteCategory,
  listSubcategories, upsertSubcategory, deleteSubcategory,
} from "@/lib/content.functions";

export const Route = createFileRoute("/_admin/admin/categories")({
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ["admin-cats"], queryFn: () => listCategories() });
  const subs = useQuery({ queryKey: ["admin-subs"], queryFn: () => listSubcategories() });

  const [editing, setEditing] = useState<any | null>(null);
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const saveCat = useMutation({
    mutationFn: (v: any) => upsertCategory({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-cats"] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
  const delCat = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-cats"] }); toast.success("Deleted"); },
  });
  const saveSub = useMutation({
    mutationFn: (v: any) => upsertSubcategory({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-subs"] }); setEditingSub(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
  const delSub = useMutation({
    mutationFn: (id: string) => deleteSubcategory({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-subs"] }); toast.success("Deleted"); },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">Categories</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage categories and their subcategories. Click a row to expand.</p>
        </div>
        <button onClick={() => setEditing({ slug: "", name: "", description: "", sort_order: 0 })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
          <Plus className="w-4 h-4" /> New category
        </button>
      </div>

      <div className="mt-6 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
        {(cats.data ?? []).map((c: any) => {
          const childSubs = (subs.data ?? []).filter((s: any) => s.category_slug === c.slug);
          const isOpen = expanded === c.slug;
          return (
            <div key={c.id}>
              <div className="p-4 flex items-center gap-3">
                <button onClick={() => setExpanded(isOpen ? null : c.slug)} className="p-1 hover:bg-white/5 rounded">
                  <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.name} <span className="text-xs text-muted-foreground ml-2">({c.slug})</span></div>
                  <div className="text-xs text-muted-foreground truncate">{childSubs.length} subcategories</div>
                </div>
                <button onClick={() => setEditing(c)} className="p-2 hover:bg-white/5 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm("Delete category?")) delCat.mutate(c.id); }} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
              {isOpen && (
                <div className="bg-white/[0.02] px-4 pb-4">
                  <div className="flex justify-end mb-2">
                    <button onClick={() => setEditingSub({ category_slug: c.slug, slug: "", name: "", description: "", sort_order: 0 })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs hover:border-white/25">
                      <Plus className="w-3.5 h-3.5" /> Add subcategory
                    </button>
                  </div>
                  {childSubs.length === 0 ? (
                    <div className="text-xs text-muted-foreground py-2">No subcategories yet.</div>
                  ) : (
                    <ul className="divide-y divide-white/5">
                      {childSubs.map((s: any) => (
                        <li key={s.id} className="py-2 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm">{s.name} <span className="text-xs text-muted-foreground ml-2">({s.slug})</span></div>
                          </div>
                          <button onClick={() => setEditingSub(s)} className="p-1.5 hover:bg-white/5 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { if (confirm("Delete subcategory?")) delSub.mutate(s.id); }} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {(cats.data?.length ?? 0) === 0 && !cats.isLoading && (
          <div className="p-6 text-sm text-muted-foreground">No categories yet. Click "New category".</div>
        )}
      </div>

      {editing && (
        <SimpleDialog title={editing.id ? "Edit category" : "New category"} onClose={() => setEditing(null)} onSave={() => saveCat.mutate(editing)} saving={saveCat.isPending}>
          <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
          <Field label="Slug (lowercase, dashes)" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
          <Field label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} textarea />
          <Field label="Sort order" value={String(editing.sort_order ?? 0)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })} type="number" />
        </SimpleDialog>
      )}

      {editingSub && (
        <SimpleDialog title={editingSub.id ? "Edit subcategory" : "New subcategory"} onClose={() => setEditingSub(null)} onSave={() => saveSub.mutate(editingSub)} saving={saveSub.isPending}>
          <Field label="Category slug" value={editingSub.category_slug} onChange={(v) => setEditingSub({ ...editingSub, category_slug: v })} />
          <Field label="Name" value={editingSub.name} onChange={(v) => setEditingSub({ ...editingSub, name: v })} />
          <Field label="Slug" value={editingSub.slug} onChange={(v) => setEditingSub({ ...editingSub, slug: v })} />
          <Field label="Description" value={editingSub.description ?? ""} onChange={(v) => setEditingSub({ ...editingSub, description: v })} textarea />
          <Field label="Sort order" value={String(editingSub.sort_order ?? 0)} onChange={(v) => setEditingSub({ ...editingSub, sort_order: Number(v) })} type="number" />
        </SimpleDialog>
      )}
    </div>
  );
}

function SimpleDialog({ title, children, onClose, onSave, saving }: any) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl">{title}</h2>
        {children}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-sm">Cancel</button>
          <button disabled={saving} onClick={onSave} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea, type }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm" />
      ) : (
        <input type={type ?? "text"} value={value} onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm" />
      )}
    </div>
  );
}
