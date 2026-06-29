import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { useEffect, useState, useMemo } from "react";
import {
  Bold, Italic, Underline as UIcon, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, ListChecks, Quote, Minus, Link as LinkIcon, Image as ImgIcon,
  Table as TableIcon, Eye, FileCode, PencilLine, Undo2, Redo2,
} from "lucide-react";
import { sanitizeHtml, htmlStats } from "@/lib/html-sanitize";

type Mode = "visual" | "raw" | "preview";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function HtmlEditor({ value, onChange }: Props) {
  const [mode, setMode] = useState<Mode>("visual");
  const [raw, setRaw] = useState(value || "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image.configure({ inline: false, HTMLAttributes: { loading: "lazy" } }),
      Table.configure({ resizable: false, HTMLAttributes: { class: "tiptap-table" } }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Paste HTML from ChatGPT / Claude, or start writing…" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-prose blog-content min-h-[420px] focus:outline-none px-4 py-4",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      setRaw(html);
      onChange(html);
    },
  });

  // External value changes (e.g. switch row).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      setRaw(value || "");
    }
  }, [value, editor]);

  // Apply raw HTML back to editor when leaving raw mode.
  function syncFromRaw() {
    if (editor && raw !== editor.getHTML()) {
      editor.commands.setContent(raw, { emitUpdate: false });
      onChange(raw);
    }
  }

  const stats = useMemo(() => htmlStats(mode === "raw" ? raw : (editor?.getHTML() ?? value)), [raw, mode, editor, value]);
  const previewHtml = useMemo(() => sanitizeHtml(mode === "raw" ? raw : (editor?.getHTML() ?? value)), [raw, mode, editor, value]);

  if (!editor) return <div className="text-xs text-muted-foreground p-3">Loading editor…</div>;

  return (
    <div className="mt-1 rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 bg-white/[0.03] border-b border-white/10 px-2 py-1.5">
        <TabBtn active={mode === "visual"} onClick={() => { if (mode === "raw") syncFromRaw(); setMode("visual"); }} icon={<PencilLine className="w-3 h-3" />} label="Visual" />
        <TabBtn active={mode === "raw"} onClick={() => setMode("raw")} icon={<FileCode className="w-3 h-3" />} label="Raw HTML" />
        <TabBtn active={mode === "preview"} onClick={() => { if (mode === "raw") syncFromRaw(); setMode("preview"); }} icon={<Eye className="w-3 h-3" />} label="Preview" />
        <span className="ml-auto text-[10px] text-muted-foreground pr-1">
          {stats.words} words · {stats.readingTime} min · {stats.headings} H · {stats.images} img · {stats.tables} tbl
        </span>
      </div>

      {/* Toolbar — only in visual mode */}
      {mode === "visual" && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 px-1.5 py-1 bg-white/[0.02]">
          <TBtn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 className="w-3.5 h-3.5" /></TBtn>
          <TBtn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 className="w-3.5 h-3.5" /></TBtn>
          <Sep />
          <TBtn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1"><Heading1 className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2"><Heading2 className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3"><Heading3 className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} title="H4"><Heading4 className="w-3.5 h-3.5" /></TBtn>
          <Sep />
          <TBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UIcon className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strike"><Strikethrough className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code"><Code className="w-3.5 h-3.5" /></TBtn>
          <Sep />
          <TBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list"><List className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Checklist"><ListChecks className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"><Quote className="w-3.5 h-3.5" /></TBtn>
          <TBtn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block"><Code2 className="w-3.5 h-3.5" /></TBtn>
          <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus className="w-3.5 h-3.5" /></TBtn>
          <Sep />
          <TBtn onClick={() => {
            const prev = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("URL", prev ?? "https://");
            if (url === null) return;
            if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
            else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }} active={editor.isActive("link")} title="Link"><LinkIcon className="w-3.5 h-3.5" /></TBtn>
          <TBtn onClick={() => {
            const url = window.prompt("Image URL", "https://");
            if (url) editor.chain().focus().setImage({ src: url, alt: "" }).run();
          }} title="Image"><ImgIcon className="w-3.5 h-3.5" /></TBtn>
          <TBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Table"><TableIcon className="w-3.5 h-3.5" /></TBtn>
        </div>
      )}

      {/* Body */}
      {mode === "visual" && (
        <div className="max-h-[65vh] overflow-auto bg-background">
          <EditorContent editor={editor} />
        </div>
      )}
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

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className={"px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1.5 " + (active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
      {icon} {label}
    </button>
  );
}

function TBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={"p-1.5 rounded-md " + (active ? "bg-white/15 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground")}>
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-0.5 h-4 w-px bg-white/10" />;
}
