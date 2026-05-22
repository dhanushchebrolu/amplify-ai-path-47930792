import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
            <Star className="w-4 h-4 fill-current" />
          </span>
          <span className="font-semibold tracking-tight">NeuroHub</span>
        </Link>
        <nav className="flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/browse" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Browse All
          </Link>
          <Link to="/category/$slug" params={{ slug: "ai-writing-tools" }} className="hover:text-foreground transition-colors">
            Writing
          </Link>
          <Link to="/category/$slug" params={{ slug: "ai-video-tools" }} className="hover:text-foreground transition-colors">
            Video
          </Link>
          <Link to="/category/$slug" params={{ slug: "ai-coding-developer-tools" }} className="hover:text-foreground transition-colors">
            Coding
          </Link>
        </nav>
      </div>
    </header>
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
          <Link to="/browse" className="hover:text-foreground">All tools</Link>
          <a href="#" className="hover:text-foreground">Submit a tool</a>
          <a href="#" className="hover:text-foreground">Newsletter</a>
        </div>
      </div>
    </footer>
  );
}
