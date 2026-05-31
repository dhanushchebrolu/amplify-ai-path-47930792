import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  listTools, listPrompts, listLearnTasks, listCategories, listSubcategories,
  listAllBlogPosts,
} from "@/lib/content.functions";
import {
  Wrench, MessageSquare, Sparkles, FolderTree, FileText, Layers, Compass, Eraser, Heart,
} from "lucide-react";

export const Route = createFileRoute("/_admin/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const tools = useQuery({ queryKey: ["admin", "tools"], queryFn: () => listTools() });
  const prompts = useQuery({ queryKey: ["admin", "prompts"], queryFn: () => listPrompts() });
  const tasks = useQuery({ queryKey: ["admin", "learn"], queryFn: () => listLearnTasks() });
  const cats = useQuery({ queryKey: ["admin", "cats"], queryFn: () => listCategories() });
  const subs = useQuery({ queryKey: ["admin", "subs"], queryFn: () => listSubcategories() });
  const blog = useQuery({ queryKey: ["admin", "blog"], queryFn: () => listAllBlogPosts() });

  const learnAll = tasks.data ?? [];
  const spinCount = learnAll.filter((t: any) => t.kind === "spin" || t.kind === "any").length;
  const swipeCount = learnAll.filter((t: any) => t.kind === "swipe" || t.kind === "any").length;
  const scratchCount = learnAll.filter((t: any) => t.kind === "scratch" || t.kind === "any").length;

  const cards = [
    { label: "Categories", count: cats.data?.length ?? 0, to: "/admin/categories", icon: <FolderTree className="w-5 h-5" />, hint: "Top-level groups for tools" },
    { label: "Subcategories", count: subs.data?.length ?? 0, to: "/admin/categories", icon: <Layers className="w-5 h-5" />, hint: "Nested under categories" },
    { label: "Tools", count: tools.data?.length ?? 0, to: "/admin/tools", icon: <Wrench className="w-5 h-5" />, hint: "Every AI tool you list" },
    { label: "Prompts", count: prompts.data?.length ?? 0, to: "/admin/prompts", icon: <MessageSquare className="w-5 h-5" />, hint: "Library entries + sample image" },
    { label: "Blog posts", count: blog.data?.length ?? 0, to: "/admin/blog", icon: <FileText className="w-5 h-5" />, hint: "Daily posts (drafts + published)" },
    { label: "Learn — all tasks", count: learnAll.length, to: "/admin/learn-tasks", icon: <Sparkles className="w-5 h-5" />, hint: "Manage every Learn task in one place" },
    { label: "Spin tasks", count: spinCount, to: "/admin/learn-tasks", icon: <Compass className="w-5 h-5" />, hint: "Tasks that appear on /learn/spin" },
    { label: "Swipe tasks", count: swipeCount, to: "/admin/learn-tasks", icon: <Heart className="w-5 h-5" />, hint: "Tasks shown on /learn/swipe" },
    { label: "Scratch tasks", count: scratchCount, to: "/admin/learn-tasks", icon: <Eraser className="w-5 h-5" />, hint: "Tasks shown on /learn/scratch" },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Every section of the site is editable from here. Click any card to manage.
      </p>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}
            className="card-surface rounded-2xl border border-white/10 p-5 hover:border-white/25 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-white/5 text-primary">{c.icon}</div>
              <div className="font-display text-3xl">{c.count}</div>
            </div>
            <div className="mt-4 font-medium">{c.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.hint}</div>
            <div className="text-xs text-primary mt-3 opacity-60 group-hover:opacity-100">Manage →</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 p-6 bg-white/[0.02]">
        <h2 className="font-display text-xl">Tips</h2>
        <ul className="mt-3 text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>Required fields show a red asterisk. If a save fails, the error toast says exactly what's wrong.</li>
          <li>For images, paste a URL <em>or</em> upload a file — both work.</li>
          <li>Blog posts only appear on <code className="text-foreground">/blog</code> when <strong>Published</strong> is on.</li>
          <li>Categories you create here power the <code className="text-foreground">/browse</code> and <code className="text-foreground">/category</code> pages.</li>
          <li>Learn tasks share one editor — set <strong>Kind</strong> to Spin, Swipe, Scratch, or Any to choose where they show.</li>
        </ul>
      </div>
    </div>
  );
}
