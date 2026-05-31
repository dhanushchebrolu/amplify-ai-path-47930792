import { Link } from "@tanstack/react-router";
import { Star, ChevronDown, Sparkles, Eraser, Compass } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ScratchIcon = Eraser;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
            <Star className="w-4 h-4 fill-current" />
          </span>
          <span className="font-semibold tracking-tight">NeuroHub</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>
            Home
          </Link>
          <Link to="/browse" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Browse
          </Link>
          <Link to="/prompts" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Prompts
          </Link>
          <Link to="/blog" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Blog
          </Link>
          <Link to="/ranking" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Ranking
          </Link>

          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              Learn New <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <DropdownItem to="/learn/spin" icon={<Compass className="w-4 h-4" />} title="Spin" desc="Drag the AI globe, land on a task." onClick={() => setOpen(false)} />
                <DropdownItem to="/learn/scratch" icon={<ScratchIcon className="w-4 h-4" />} title="Scratch" desc="Reveal a hidden challenge." onClick={() => setOpen(false)} />
                <DropdownItem to="/learn/swipe" icon={<Sparkles className="w-4 h-4" />} title="Swipe" desc="Tinder-style discovery." onClick={() => setOpen(false)} />
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function DropdownItem({ to, icon, title, desc, onClick }: { to: string; icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group"
    >
      <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground mt-0.5">{desc}</span>
      </span>
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
            <Star className="w-3 h-3 fill-current" />
          </span>
          <span className="text-foreground font-medium">NeuroHub</span>
          <span>— Every AI tool in one platform.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          <Link to="/ranking" className="hover:text-foreground">Ranking</Link>
          <Link to="/prompts" className="hover:text-foreground">Prompts</Link>
          <Link to="/learn/spin" className="hover:text-foreground">Learn</Link>
        </div>
      </div>
    </footer>
  );
}
