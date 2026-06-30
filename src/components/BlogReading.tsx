import { useEffect, useMemo, useState, useRef, type RefObject } from "react";
import { Link as LinkIcon, Check, Copy, X, List } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Reading progress bar                                               */
/* ------------------------------------------------------------------ */

export function ReadingProgress({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = rect.height - viewport;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setPct(total > 0 ? (scrolled / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetRef]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Table of contents                                                  */
/* ------------------------------------------------------------------ */

export type TocItem = { id: string; text: string; level: 2 | 3 };

export function extractToc(html: string): TocItem[] {
  if (!html) return [];
  const items: TocItem[] = [];
  const re = /<(h2|h3)\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[3].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    items.push({ id: m[2], text, level: m[1].toLowerCase() === "h2" ? 2 : 3 });
  }
  return items;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  const Body = (
    <nav aria-label="Table of contents" className="text-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        On this page
      </div>
      <ul className="space-y-1.5 border-l border-border">
        {items.map((it) => (
          <li key={it.id} className={it.level === 3 ? "pl-6" : "pl-4"}>
            <a
              href={`#${it.id}`}
              onClick={() => setOpenMobile(false)}
              className={`block -ml-px border-l-2 py-0.5 transition-colors ${
                active === it.id
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden xl:block fixed top-28 right-[max(1.5rem,calc((100vw-72rem)/2))] w-60 max-h-[70vh] overflow-y-auto pr-2">
        {Body}
      </aside>

      {/* Mobile floating button + sheet */}
      <button
        type="button"
        onClick={() => setOpenMobile(true)}
        className="xl:hidden fixed bottom-5 right-5 z-40 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-3 text-sm font-medium flex items-center gap-2"
        aria-label="Open table of contents"
      >
        <List className="h-4 w-4" /> Contents
      </button>
      {openMobile && (
        <div className="xl:hidden fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpenMobile(false)}
          />
          <div className="relative w-full bg-background border-t border-border rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto">
            <button
              onClick={() => setOpenMobile(false)}
              className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {Body}
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Article enhancements: copy heading link, copy code, lightbox,      */
/* responsive table wrap. Runs after the article HTML is in the DOM.  */
/* ------------------------------------------------------------------ */

export function useArticleEnhancements(
  containerRef: RefObject<HTMLElement | null>,
  deps: ReadonlyArray<unknown> = [],
) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // ---- Heading anchor copy buttons (h2/h3 with id) ----
    const headings = root.querySelectorAll<HTMLElement>("h2[id], h3[id]");
    const headingCleanups: Array<() => void> = [];
    headings.forEach((h) => {
      if (h.querySelector(".heading-anchor-btn")) return;
      h.classList.add("group/h", "relative");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "heading-anchor-btn ml-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover/h:opacity-100 hover:bg-muted hover:text-foreground transition-opacity align-middle";
      btn.setAttribute("aria-label", "Copy link to section");
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
      const onClick = (e: Event) => {
        e.preventDefault();
        const url = `${window.location.origin}${window.location.pathname}#${h.id}`;
        navigator.clipboard?.writeText(url).catch(() => {});
        history.replaceState(null, "", `#${h.id}`);
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        window.setTimeout(() => {
          btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
        }, 1500);
      };
      btn.addEventListener("click", onClick);
      h.appendChild(btn);
      headingCleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
      });
    });

    // ---- Code block copy buttons ----
    const codeCleanups: Array<() => void> = [];
    root.querySelectorAll<HTMLPreElement>("pre").forEach((pre) => {
      if (pre.querySelector(".code-copy-btn")) return;
      pre.classList.add("relative", "group/code");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "code-copy-btn absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-border bg-background/80 backdrop-blur px-2 py-1 text-xs text-muted-foreground opacity-0 group-hover/code:opacity-100 hover:text-foreground transition-opacity";
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>';
      const onClick = () => {
        const text = pre.innerText.replace(/\nCopy$/, "").trim();
        navigator.clipboard?.writeText(text).catch(() => {});
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Copied</span>';
        window.setTimeout(() => {
          btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>';
        }, 1500);
      };
      btn.addEventListener("click", onClick);
      pre.appendChild(btn);
      codeCleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
      });
    });

    // ---- Responsive table wrap ----
    const tableCleanups: Array<() => void> = [];
    root.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
      const parent = table.parentElement;
      if (!parent || parent.classList.contains("blog-table-wrap")) return;
      const wrap = document.createElement("div");
      wrap.className = "blog-table-wrap";
      parent.insertBefore(wrap, table);
      wrap.appendChild(table);
      tableCleanups.push(() => {
        if (wrap.parentElement) {
          wrap.parentElement.insertBefore(table, wrap);
          wrap.remove();
        }
      });
    });

    // ---- Image lightbox ----
    const imgCleanups: Array<() => void> = [];
    root.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      img.loading = img.loading || "lazy";
      img.decoding = "async";
      img.classList.add("blog-img", "cursor-zoom-in");
      const onClick = () => {
        setLightbox({ src: img.currentSrc || img.src, alt: img.alt || "" });
      };
      img.addEventListener("click", onClick);
      imgCleanups.push(() => img.removeEventListener("click", onClick));
    });

    return () => {
      headingCleanups.forEach((f) => f());
      codeCleanups.forEach((f) => f());
      tableCleanups.forEach((f) => f());
      imgCleanups.forEach((f) => f());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...deps]);

  return {
    lightbox,
    closeLightbox: () => setLightbox(null),
  };
}

export function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/* Marker exports so tree-shaker doesn't drop icon imports used in JSX */
export const __icons = { LinkIcon, Check, Copy };
// Keep import alive for downstream consumers
void useRef;
void useMemo;
