import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
  Eye, FileCode, Wand2,
} from "lucide-react";
import { sanitizeHtml, htmlStats } from "@/lib/html-sanitize";
import { BlogImportDialog } from "./BlogImportDialog";

type Mode = "raw" | "preview";

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Optional: receive a multi-field patch (title, slug, seo_*, etc.) from the HTML importer. */
  onBulkImport?: (patch: Record<string, unknown>) => void;
}

export function HtmlEditor({ value, onChange, onBulkImport }: Props) {
  const [mode, setMode] = useState<Mode>("raw");
  const [raw, setRaw] = useState(value || "");
  const [importOpen, setImportOpen] = useState(false);

  // External value changes (e.g. switch row).
  useEffect(() => {
    setRaw(value || "");
  }, [value]);

  const stats = useMemo(() => htmlStats(raw), [raw]);
  const previewHtml = useMemo(() => sanitizeHtml(raw), [raw]);

  return (
    <div className="mt-1 rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 bg-white/[0.03] border-b border-white/10 px-2 py-1.5">
        <TabBtn active={mode === "raw"} onClick={() => setMode("raw")} icon={<FileCode className="w-3 h-3" />} label="Raw HTML" />
        <TabBtn active={mode === "preview"} onClick={() => setMode("preview")} icon={<Eye className="w-3 h-3" />} label="Preview" />
        <button type="button" onClick={() => setImportOpen(true)}
          className="ml-1 px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1.5 bg-primary/15 text-primary hover:bg-primary/25"
          title="Paste HTML from ChatGPT / Claude / Gemini — auto-extracts title, slug, SEO, FAQs, etc.">
          <Wand2 className="w-3 h-3" /> Import HTML
        </button>
        <span className="ml-auto text-[10px] text-muted-foreground pr-1">
          {stats.words} words · {stats.readingTime} min · {stats.headings} H · {stats.images} img · {stats.tables} tbl
        </span>
      </div>

      <BlogImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onApply={(patch) => {
          if (typeof patch.content_html === "string") {
            const html = patch.content_html;
            setRaw(html);
            onChange(html);
          }
          onBulkImport?.(patch);
        }}
      />

      {/* Body */}
      {mode === "raw" && (
        <textarea
          rows={22}
          value={raw}
          onChange={(e) => { setRaw(e.target.value); onChange(e.target.value); }}
          spellCheck={false}
          placeholder="<h2>Heading</h2>\n<p>Paste clean semantic HTML here…</p>"
          className="w-full px-3 py-3 bg-transparent text-[13px] outline-none font-mono leading-relaxed resize-y min-h-[420px]"
        />
      )}
      {mode === "preview" && (
        <div className="px-5 py-4 max-h-[65vh] overflow-auto bg-background">
          {previewHtml.trim()
            ? <article className="blog-content" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className={"px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1.5 " + (active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
      {icon} {label}
    </button>
  );
}
