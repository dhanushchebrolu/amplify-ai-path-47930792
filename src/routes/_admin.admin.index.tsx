import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  listTools, listPrompts, listLearnTasks, listCategories, listSubcategories,
  listAllBlogPosts,
} from "@/lib/content.functions";
import { catalog } from "@/data/catalog";
import { learnTasks as staticLearnTasks } from "@/data/learnTasks";
import {
  Wrench, MessageSquare, Sparkles, FolderTree, FileText, Layers, Compass, Eraser, Heart, Bug,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const bugs = useQuery({
    queryKey: ["admin", "bugs-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("bug_reports").select("*", { count: "exact", head: true }).eq("status", "new");
      if (error) throw error;
      return count ?? 0;
    },
  });

  const websiteCategoryCount = catalog.length;
  const websiteSubcategoryCount = catalog.reduce((acc, category) => acc + category.subs.length, 0);
  const websiteToolCount = catalog.reduce((acc, category) => acc + category.subs.reduce((sum, sub) => sum + sub.tools.length, 0), 0);
  const websiteLearnCount = staticLearnTasks.length;

  const learnAll = tasks.data ?? [];
  const spinCount = learnAll.filter((t: any) => t.kind === "spin" || t.kind === "any").length;
  const swipeCount = learnAll.filter((t: any) => t.kind === "swipe" || t.kind === "any").length;
  const scratchCount = learnAll.filter((t: any) => t.kind === "scratch" || t.kind === "any").length;

  const cards = [
    { label: "Categories", count: cats.data?.length ?? 0, to: "/admin/categories", icon: <FolderTree className="w-5 h-5" />, hint: `Website has ${websiteCategoryCount}` },
    { label: "Subcategories", count: subs.data?.length ?? 0, to: "/admin/categories", icon: <Layers className="w-5 h-5" />, hint: `Website has ${websiteSubcategoryCount}` },
    { label: "Tools", count: tools.data?.length ?? 0, to: "/admin/tools", icon: <Wrench className="w-5 h-5" />, hint: `Website has ${websiteToolCount} tool placements` },
    { label: "Prompts", count: prompts.data?.length ?? 0, to: "/admin/prompts", icon: <MessageSquare className="w-5 h-5" />, hint: "Library entries + sample image" },
    { label: "Blog posts", count: blog.data?.length ?? 0, to: "/admin/blog", icon: <FileText className="w-5 h-5" />, hint: "Daily posts (drafts + published)" },
    { label: "Learn — all tasks", count: learnAll.length, to: "/admin/learn-tasks", icon: <Sparkles className="w-5 h-5" />, hint: `Website has ${websiteLearnCount}` },
    { label: "Spin tasks", count: spinCount, to: "/admin/learn-tasks", icon: <Compass className="w-5 h-5" />, hint: "Tasks that appear on /learn/spin" },
    { label: "Swipe tasks", count: swipeCount, to: "/admin/learn-tasks", icon: <Heart className="w-5 h-5" />, hint: "Tasks shown on /learn/swipe" },
    { label: "Scratch tasks", count: scratchCount, to: "/admin/learn-tasks", icon: <Eraser className="w-5 h-5" />, hint: "Tasks shown on /learn/scratch" },
    { label: "New bug reports", count: bugs.data ?? 0, to: "/admin/bug-reports", icon: <Bug className="w-5 h-5" />, hint: "Unread submissions from the report-a-bug button" },
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
            className="card-surface rounded-2xl border border-foreground/10 p-5 hover:border-foreground/25 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-foreground/5 text-primary-ink">{c.icon}</div>
              <div className="font-display text-3xl">{c.count}</div>
            </div>
            <div className="mt-4 font-medium">{c.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.hint}</div>
            <div className="text-xs text-primary-ink mt-3 opacity-60 group-hover:opacity-100">Manage →</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-foreground/10 p-6 bg-foreground/[0.02]">
        <h2 className="font-display text-xl">Tips</h2>
        <ul className="mt-3 text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>Required fields show a red asterisk. If a save fails, the error toast says exactly what's wrong.</li>
          <li>For images, paste a URL <em>or</em> upload a file — both work.</li>
          <li>Blog posts only appear on <code className="text-foreground">/blog</code> when <strong>Published</strong> is on.</li>
          <li>Current website dataset: <strong>{websiteCategoryCount}</strong> categories, <strong>{websiteSubcategoryCount}</strong> subcategories, <strong>{websiteToolCount}</strong> tool placements, and <strong>{websiteLearnCount}</strong> learn tasks.</li>
          <li>The website still has more catalog structure than the database. I’m keeping these counts visible so mismatches are obvious until the full sync is completed.</li>
        </ul>
      </div>
    </div>
  );
}
