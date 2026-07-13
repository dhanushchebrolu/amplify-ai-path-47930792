import { useState, useMemo } from "react";
import { Upload, Wand2, X, AlertTriangle, CheckCircle2, Info, FileText } from "lucide-react";
import { parseBlogHtml, toBlogFormPatch, type ImportedBlog } from "@/lib/blog-import";
import { logImport } from "@/lib/admin-diagnostics";

if (typeof window !== "undefined") {
  logImport("parseBlogHtml", parseBlogHtml);
  logImport("toBlogFormPatch", toBlogFormPatch);
  // eslint-disable-next-line no-console
  console.log("%c[ADMIN-DIAG] ✓ BlogImportDialog module loaded", "color:#4ade80");
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with a partial blog row (title, slug, excerpt, content_html, seo_*, etc.). */
  onApply: (patch: Record<string, unknown>, parsed: ImportedBlog) => void;
}

export function BlogImportDialog({ open, onClose, onApply }: Props) {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ImportedBlog | null>(null);

  const stats = parsed?.stats;

  if (!open) return null;

  async function handleFile(file: File) {
    const text = await file.text();
    setRaw(text);
    setParsed(parseBlogHtml(text));
  }

  function runParse() {
    setParsed(parseBlogHtml(raw));
  }

  function apply() {
    if (!parsed) return;
    onApply(toBlogFormPatch(parsed), parsed);
    onClose();
    setRaw("");
    setParsed(null);
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-white/10 rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Wand2 className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg flex-1">Import HTML Blog</h2>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">Paste from ChatGPT / Claude / Gemini and we auto-extract everything.</span>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-1 overflow-hidden">
          {/* Left: input */}
          <div className="flex flex-col border-r border-white/10 min-h-0">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-white/[0.02]">
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-white/5 hover:bg-white/10 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Upload .html
                <input type="file" accept=".html,.htm,text/html" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
              </label>
              <button onClick={runParse} disabled={!raw.trim()} className="px-2.5 py-1 rounded-md text-xs bg-primary text-primary-foreground disabled:opacity-40">
                Parse
              </button>
              <span className="ml-auto text-[10px] text-muted-foreground">{raw.length.toLocaleString()} chars</span>
            </div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Paste full HTML here — including <html>, <head>, <body>, or just the article fragment. Meta tags, og: tags, headings, images, tables, FAQs, code blocks all detected automatically."
              spellCheck={false}
              className="flex-1 w-full px-4 py-3 bg-transparent text-[12px] font-mono outline-none resize-none min-h-[300px]"
            />
          </div>

          {/* Right: preview */}
          <div className="overflow-auto bg-white/[0.02] min-h-0">
            {!parsed ? (
              <div className="h-full flex items-center justify-center p-10 text-center text-sm text-muted-foreground">
                <div>
                  <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  Paste HTML and click <strong>Parse</strong> to see the extracted fields, stats, FAQs, taxonomy and SEO scores.
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <Section label="Detected">
                  <Field label="Title" value={parsed.title} />
                  <Field label="Slug" value={parsed.slug} mono />
                  <Field label="Excerpt" value={parsed.excerpt} wrap />
                  {parsed.cover_url && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Featured image</div>
                      <img src={parsed.cover_url} alt={parsed.cover_alt || ""} className="rounded-lg max-h-32 border border-white/10" />
                      <div className="text-[11px] text-muted-foreground mt-1">ALT: {parsed.cover_alt || "—"}</div>
                    </div>
                  )}
                </Section>

                <Section label="SEO">
                  <Field label="SEO title" value={`${parsed.seo_title}  (${parsed.seo_title.length} ch)`} />
                  <Field label="SEO description" value={`${parsed.seo_description}  (${parsed.seo_description.length} ch)`} wrap />
                  <Field label="Focus keyword" value={parsed.focus_keyword} />
                  <Field label="Secondary keywords" value={parsed.secondary_keywords.join(", ")} />
                  {parsed.canonical_url && <Field label="Canonical" value={parsed.canonical_url} mono />}
                </Section>

                <Section label="Taxonomy">
                  <Field label="Category" value={parsed.category_suggestion?.name || "—"} />
                  <Field label="Subcategory" value={parsed.subcategory_suggestion?.name || "—"} />
                  <Field label="Tags" value={parsed.tags.join(", ") || "—"} />
                  <Field label="Related tools" value={parsed.related_tools.join(", ") || "—"} />
                </Section>

                <Section label="Content stats">
                  <Stats stats={stats!} />
                </Section>

                {parsed.faqs.length > 0 && (
                  <Section label={`FAQs (${parsed.faqs.length})`}>
                    <ul className="space-y-2">
                      {parsed.faqs.slice(0, 4).map((f, i) => (
                        <li key={i} className="text-[12px]">
                          <div className="font-medium">{f.q}</div>
                          <div className="text-muted-foreground line-clamp-2">{f.a}</div>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                <Section label="Scores">
                  <div className="grid grid-cols-5 gap-2">
                    {(["seo","readability","headingStructure","internalLinking","completeness"] as const).map((k) => (
                      <ScoreCell key={k} label={k} value={parsed.scores[k]} />
                    ))}
                  </div>
                </Section>

                {parsed.warnings.length > 0 && (
                  <Section label="Validation">
                    <ul className="space-y-1.5">
                      {parsed.warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px]">
                          {w.level === "error" ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                            : w.level === "warning" ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                            : <Info className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />}
                          <span>{w.message}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-3 flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Importing populates every field below. You can still edit before saving.
          </span>
          <button onClick={onClose} className="ml-auto px-3.5 py-1.5 rounded-lg border border-white/10 text-sm">Cancel</button>
          <button onClick={apply} disabled={!parsed} className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm inline-flex items-center gap-2 disabled:opacity-40">
            <CheckCircle2 className="w-4 h-4" /> Apply to form
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">{label}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value, wrap, mono }: { label: string; value: string; wrap?: boolean; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 items-baseline">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={"text-[12px] " + (mono ? "font-mono " : "") + (wrap ? "" : "truncate")}>{value || "—"}</div>
    </div>
  );
}

function Stats({ stats }: { stats: { words: number; readingTime: number; paragraphs: number; images: number; tables: number; codeBlocks: number; blockquotes: number; lists: number; h2: number; h3: number; h4: number } }) {
  const cells: [string, number | string][] = [
    ["Words", stats.words], ["Reading", `${stats.readingTime} min`],
    ["Paragraphs", stats.paragraphs], ["Images", stats.images],
    ["Tables", stats.tables], ["Code", stats.codeBlocks],
    ["Quotes", stats.blockquotes], ["Lists", stats.lists],
    ["H2", stats.h2], ["H3", stats.h3], ["H4", stats.h4],
  ];
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {cells.map(([k, v]) => (
        <div key={k} className="rounded-lg bg-white/[0.03] border border-white/5 px-2.5 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div>
          <div className="text-sm font-medium">{v}</div>
        </div>
      ))}
    </div>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "text-emerald-400" : value >= 60 ? "text-amber-400" : "text-red-400";
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 px-2 py-2 text-center">
      <div className={"text-lg font-semibold " + color}>{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

export function useBlogImport() {
  const [open, setOpen] = useState(false);
  return useMemo(() => ({ open, setOpen, openImporter: () => setOpen(true), closeImporter: () => setOpen(false) }), [open]);
}
