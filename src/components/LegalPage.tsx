import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Link } from "@tanstack/react-router";

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-12 pb-24 w-full">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        <h1 className="font-display text-4xl md:text-5xl mt-4">{title}</h1>
        {updated && <p className="text-xs text-muted-foreground mt-2">Last updated: {updated}</p>}
        <div className="prose prose-invert mt-8 max-w-none text-foreground/90 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_a]:text-primary-ink [&_a]:underline">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
