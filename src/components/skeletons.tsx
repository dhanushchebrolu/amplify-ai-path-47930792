import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

/**
 * Production skeleton library — dimensions match the loaded components
 * so there is zero CLS. Wrapped in `fade-in-soft` for graceful entry.
 */

export function PageFade({ children }: { children: React.ReactNode }) {
  return <div className="fade-in-soft">{children}</div>;
}

export function ToolCardSkeleton() {
  return (
    <div className="card-surface p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-4 w-10 rounded-full" />
      </div>
      <div className="space-y-2 min-h-[60px]">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/60">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function CatalogToolCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 p-5 flex flex-col gap-4 bg-[var(--surface)]">
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function CategoryBentoSkeleton() {
  return (
    <div className="card-surface p-6 h-[260px] flex flex-col justify-between">
      <div className="space-y-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function PromptCardSkeleton() {
  return (
    <div className="card-surface rounded-2xl border border-white/10 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="card-surface rounded-2xl border border-white/10 overflow-hidden">
      <Skeleton className="w-full aspect-[16/9] rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-20 mt-2" />
      </div>
    </div>
  );
}

export function GridSkeleton({
  count = 6,
  cols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  Item,
}: {
  count?: number;
  cols?: string;
  Item: React.ComponentType;
}) {
  return (
    <div className={`grid gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}

/* ---------- Route-level pending pages ---------- */

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24 w-full fade-in-soft">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function BlogIndexPending() {
  return (
    <PageShell>
      <Skeleton className="h-3 w-12 mb-3" />
      <Skeleton className="h-12 w-2/3 mb-4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="mt-10 grid md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </PageShell>
  );
}

export function BlogPostPending() {
  return (
    <PageShell>
      <Skeleton className="h-3 w-20 mb-4" />
      <Skeleton className="h-12 w-3/4 mb-3" />
      <Skeleton className="h-4 w-32 mb-8" />
      <Skeleton className="w-full aspect-[16/9] rounded-2xl mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`h-3 ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </PageShell>
  );
}

export function ToolPagePending() {
  return (
    <PageShell>
      <Skeleton className="h-3 w-40 mb-6" />
      <div className="card-surface p-7 flex flex-col md:flex-row gap-6 md:items-center rounded-2xl border border-white/10">
        <Skeleton className="h-20 w-20 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </PageShell>
  );
}

export function PromptPagePending() {
  return (
    <PageShell>
      <Skeleton className="h-3 w-24 mb-6" />
      <Skeleton className="h-10 w-3/4 mb-3" />
      <Skeleton className="h-4 w-40 mb-8" />
      <Skeleton className="h-48 w-full rounded-2xl mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={`h-3 ${i % 3 === 2 ? "w-1/2" : "w-full"}`} />
        ))}
      </div>
    </PageShell>
  );
}

export function GenericPagePending() {
  return (
    <PageShell>
      <Skeleton className="h-10 w-1/3 mb-6" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    </PageShell>
  );
}
