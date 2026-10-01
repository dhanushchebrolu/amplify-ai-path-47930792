import { Link } from "@tanstack/react-router";
import { ChevronDown, Sparkles, Eraser, Compass, Bug, Mail, Menu, X, Search, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BugReportDialog } from "@/components/BugReportDialog";

const LOGO_MARK = "/logo.png";

const ScratchIcon = Eraser;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // `.nav-link` styles the active state from TanStack's data-status="active".
  const navLinks = (
    <>
      <Link to="/" className="nav-link" activeOptions={{ exact: true }} onClick={() => setMobileOpen(false)}>Home</Link>
      <Link to="/browse" className="nav-link" onClick={() => setMobileOpen(false)}>Browse</Link>
      <Link to="/compare" className="nav-link" onClick={() => setMobileOpen(false)}>Compare</Link>
      <Link to="/prompts" className="nav-link" onClick={() => setMobileOpen(false)}>Prompts</Link>
      <Link to="/blog" className="nav-link" onClick={() => setMobileOpen(false)}>Blog</Link>
      <Link to="/ranking" className="nav-link" onClick={() => setMobileOpen(false)}>Ranking</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-border/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 md:h-[72px] flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group min-w-0">
          <span className="shrink-0 rounded-[11px] p-[1.5px] bg-gradient-to-br from-brand via-violet-accent to-highlight shadow-[0_4px_12px_-4px_rgb(56_103_255/0.45)] transition-transform duration-200 group-hover:-rotate-3">
            <img src={LOGO_MARK} alt="" width={36} height={36} className="block w-9 h-9 rounded-[9.5px]" />
          </span>
          <span className="font-bold tracking-[-0.03em] text-[1.35rem] text-navy whitespace-nowrap">AI Blaze</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 text-[15px] font-medium">
          {navLinks}
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className={`nav-link inline-flex items-center gap-1 ${open ? "text-brand" : ""}`}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              Learn New <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="absolute right-0 mt-4 w-72 rounded-xl border border-border bg-popover shadow-[var(--shadow-card-hover)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <DropdownItem to="/learn/spin" icon={<Compass className="w-4 h-4" />} title="Spin" desc="Drag the AI globe, land on a task." onClick={() => setOpen(false)} />
                <DropdownItem to="/learn/scratch" icon={<ScratchIcon className="w-4 h-4" />} title="Scratch" desc="Reveal a hidden challenge." onClick={() => setOpen(false)} />
                <DropdownItem to="/learn/swipe" icon={<Sparkles className="w-4 h-4" />} title="Swipe" desc="Tinder-style discovery." onClick={() => setOpen(false)} />
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/search"
            search={{ q: "" }}
            aria-label="Search AI tools"
            className="grid place-items-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-white text-navy ring-1 ring-navy/10 shadow-[0_4px_12px_-6px_rgb(16_24_40/0.3)] hover:text-brand hover:ring-brand/30 transition-colors"
          >
            <Search className="w-[18px] h-[18px]" />
          </Link>
          <Link
            to="/admin/login"
            className="hidden sm:inline-flex items-center gap-2 h-10 md:h-11 px-4 md:px-5 rounded-xl text-white text-[15px] font-semibold bg-gradient-to-r from-[#3867FF] to-[#5B5BFF] shadow-[0_10px_22px_-10px_rgb(56_103_255/0.8)] hover:-translate-y-0.5 hover:brightness-105 transition-all"
          >
            <UserRound className="w-[18px] h-[18px]" />
            Sign In
          </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-surface text-navy hover:border-brand/40 hover:text-brand transition-colors"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background shadow-[0_12px_24px_-16px_rgb(16_24_40/0.25)]">
          <nav className="mobile-nav mx-auto max-w-7xl px-4 sm:px-6 py-3 flex flex-col text-[15px] font-medium">
            {navLinks}
            <Link to="/admin/login" className="nav-link sm:hidden" onClick={() => setMobileOpen(false)}>Sign In</Link>
            <div className="pt-3 mt-2 border-t border-border">
              <p className="eyebrow mb-2">Learn New</p>
              <div className="flex flex-col gap-1">
                <DropdownItem to="/learn/spin" icon={<Compass className="w-4 h-4" />} title="Spin" desc="Drag the AI globe, land on a task." onClick={() => setMobileOpen(false)} />
                <DropdownItem to="/learn/scratch" icon={<ScratchIcon className="w-4 h-4" />} title="Scratch" desc="Reveal a hidden challenge." onClick={() => setMobileOpen(false)} />
                <DropdownItem to="/learn/swipe" icon={<Sparkles className="w-4 h-4" />} title="Swipe" desc="Tinder-style discovery." onClick={() => setMobileOpen(false)} />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function DropdownItem({ to, icon, title, desc, onClick }: { to: string; icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-blue transition-colors group"
    >
      <span className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-surface-blue to-surface-violet ring-1 ring-brand/15 text-brand grid place-items-center group-hover:text-violet-accent transition-colors">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-navy group-hover:text-brand-dark transition-colors">{title}</span>
        <span className="block text-xs text-muted-foreground mt-0.5">{desc}</span>
      </span>
    </Link>
  );
}

export function SiteFooter() {
  const [bugOpen, setBugOpen] = useState(false);
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-border mt-24 bg-surface">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={LOGO_MARK} alt="" width={36} height={36} className="w-9 h-9 rounded-[9px]" />
            <span className="font-semibold text-navy">AI Blaze</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Every AI tool in one platform. Discover, compare, and learn the best AI tools for writing, video, image, audio, coding, marketing and more.
          </p>
          <a href="mailto:aiblaze.io@gmail.com" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-brand transition-colors">
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
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-navy">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="text-muted-foreground hover:text-brand transition-colors">About</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-brand transition-colors">Contact</Link></li>
            <li>
              <button onClick={() => setBugOpen(true)} className="text-muted-foreground hover:text-brand transition-colors inline-flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5" /> Report a bug
              </button>
            </li>
            <li><a href="/sitemap.xml" className="text-muted-foreground hover:text-brand transition-colors">Sitemap</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between text-xs text-muted-foreground">
          <p>© {year} AI Blaze · All rights reserved · <a href="mailto:aiblaze.io@gmail.com" className="hover:text-brand transition-colors">aiblaze.io@gmail.com</a></p>
          <p>Built for AI builders and learners worldwide.</p>
        </div>
      </div>

      {/* Floating Report-a-bug FAB */}
      <button
        onClick={() => setBugOpen(true)}
        aria-label="Report a bug"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-lg bg-navy text-white px-3.5 py-2.5 text-sm font-medium shadow-[0_8px_24px_-8px_rgb(16_24_40/0.5)] hover:bg-brand-dark hover:-translate-y-0.5 transition-all"
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
      <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-navy">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}><Link to={l.to} className="text-muted-foreground hover:text-brand transition-colors">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
