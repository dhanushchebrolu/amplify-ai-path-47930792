import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  listTools, listPrompts, listLearnTasks, listCategories, listSubcategories,
  listAllBlogPosts, listBooks, listCourses,
} from "@/lib/content.functions";
import {
  Wrench, MessageSquare, Sparkles, FolderTree, FileText, BookOpen, GraduationCap, Layers,
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
  const books = useQuery({ queryKey: ["admin", "books"], queryFn: () => listBooks() });
  const courses = useQuery({ queryKey: ["admin", "courses"], queryFn: () => listCourses() });

  const cards = [
    { label: "Categories", count: cats.data?.length ?? 0, to: "/admin/categories", icon: <FolderTree className="w-5 h-5" />, hint: "Top-level groups for tools" },
    { label: "Subcategories", count: subs.data?.length ?? 0, to: "/admin/categories", icon: <Layers className="w-5 h-5" />, hint: "Nested under categories" },
    { label: "Tools", count: tools.data?.length ?? 0, to: "/admin/tools", icon: <Wrench className="w-5 h-5" />, hint: "Every AI tool you list" },
    { label: "Prompts", count: prompts.data?.length ?? 0, to: "/admin/prompts", icon: <MessageSquare className="w-5 h-5" />, hint: "Library entries + sample image" },
    { label: "Learn tasks", count: tasks.data?.length ?? 0, to: "/admin/learn-tasks", icon: <Sparkles className="w-5 h-5" />, hint: "Spin / Swipe / Scratch tasks" },
    { label: "Blog posts", count: blog.data?.length ?? 0, to: "/admin/blog", icon: <FileText className="w-5 h-5" />, hint: "Daily posts (drafts + published)" },
    { label: "Books", count: books.data?.length ?? 0, to: "/admin/books", icon: <BookOpen className="w-5 h-5" />, hint: "Affiliate book picks" },
    { label: "Courses", count: courses.data?.length ?? 0, to: "/admin/courses", icon: <GraduationCap className="w-5 h-5" />, hint: "Affiliate course picks" },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Every section of the site is editable from here. Click any card to manage.
      </p>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <li>For images, you can paste a URL <em>or</em> upload a file — both work.</li>
          <li>Blog posts only appear on <code className="text-foreground">/blog</code> when <strong>Published</strong> is on.</li>
          <li>Books and Courses use your affiliate link as the "Get it" button.</li>
          <li>Categories you create here power the <code className="text-foreground">/browse</code> and <code className="text-foreground">/category</code> pages.</li>
        </ul>
      </div>
    </div>
  );
}
