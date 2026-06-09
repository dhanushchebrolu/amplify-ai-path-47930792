import { Link } from "@tanstack/react-router";
import { ChevronDown, Sparkles, Eraser, Compass, Bug, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BugReportDialog } from "@/components/BugReportDialog";

const LOGO_MARK = "/logo.png";

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
          <img src={LOGO_MARK} alt="" width={44} height={44} className="w-11 h-11" />
          <span className="font-semibold tracking-tight text-xl whitespace-nowrap">AI Blaze</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Home</Link>
          <Link to="/browse" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Browse</Link>
          <Link to="/prompts" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Prompts</Link>
          <Link to="/blog" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Blog</Link>
          <Link to="/ranking" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Ranking</Link>

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
  const [bugOpen, setBugOpen] = useState(false);
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 mt-24 bg-background/40">
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={LOGO_MARK} alt="" width={40} height={40} className="w-10 h-10" />
            <span className="font-semibold">AI Blaze</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Every AI tool in one platform. Discover, compare, and learn the best AI tools for writing, video, image, audio, coding, marketing and more.
          </p>
          <a href="mailto:aiblaze.io@gmail.com" className="mt-4 inline-flex items-center gap-2 text-sm text-foreground hover:text-primary">
            <Mail className="w-4 h-4" /> aiblaze.io@gmail.com
          </a>
        </div>

        <FooterCol title="Explore" links={[
          { label: "Home", to: "/" },
          { label: "Browse all tools", to: "/browse" },
          { label: "Prompts", to: "/prompts" },
          { label: "Blog", to: "/blog" },
          { label: "Ranking", to: "/ranking" },
          { label: "Learn — Spin", to: "/learn/spin" },
        ]} />

        <FooterCol title="Legal" links={[
          { label: "Privacy Policy", to: "/privacy" },
          { label: "Terms of Service", to: "/terms" },
          { label: "Cookie Policy", to: "/cookies" },
          { label: "Disclaimer", to: "/disclaimer" },
          { label: "Affiliate Disclosure", to: "/affiliate-disclosure" },
          { label: "DMCA", to: "/dmca" },
        ]} />

        <div>
          <h4 className="text-sm font-semibold text-foreground">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            <li>
              <button onClick={() => setBugOpen(true)} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5" /> Report a bug
              </button>
            </li>
            <li><a href="/sitemap.xml" className="text-muted-foreground hover:text-foreground">Sitemap</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between text-xs text-muted-foreground">
          <p>© {year} AI Blaze · All rights reserved · <a href="mailto:aiblaze.io@gmail.com" className="hover:text-foreground">aiblaze.io@gmail.com</a></p>
          <p>Built for AI builders and learners worldwide.</p>
        </div>
      </div>

      {/* Floating Report-a-bug FAB */}
      <button
        onClick={() => setBugOpen(true)}
        aria-label="Report a bug"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium shadow-lg hover:opacity-90 transition-opacity"
      >
        <Bug className="w-4 h-4" /> Report a bug
      </button>

      <BugReportDialog open={bugOpen} onOpenChange={setBugOpen} />
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}><Link to={l.to} className="text-muted-foreground hover:text-foreground">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
