import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkAdmin } from "@/lib/content.functions";
import { LayoutDashboard, Wrench, MessageSquare, Sparkles, LogOut, FolderTree, FileText, Bug } from "lucide-react";

export const Route = createFileRoute("/_admin")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const check = useServerFn(checkAdmin);
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    check().then((r) => setState(r.isAdmin ? "ok" : "denied")).catch(() => setState("denied"));
  }, [check]);

  if (state === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Checking access…</div>;
  }
  if (state === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl">Not authorized</h1>
          <p className="text-muted-foreground mt-2 text-sm">This account isn't the site admin.</p>
          <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}
            className="mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-white/10 p-4 flex flex-col">
        <Link to="/" className="font-display text-xl mb-6">AIBlaze admin</Link>
        <nav className="space-y-1 text-sm flex-1">
          <NavItem to="/admin" icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" />
          <NavItem to="/admin/categories" icon={<FolderTree className="w-4 h-4" />} label="Categories" />
          <NavItem to="/admin/tools" icon={<Wrench className="w-4 h-4" />} label="Tools" />
          <NavItem to="/admin/prompts" icon={<MessageSquare className="w-4 h-4" />} label="Prompts" />
          <NavItem to="/admin/learn-tasks" icon={<Sparkles className="w-4 h-4" />} label="Learn tasks (all)" />
          <NavItem to="/admin/blog" icon={<FileText className="w-4 h-4" />} label="Blog" />
          <NavItem to="/admin/bug-reports" icon={<Bug className="w-4 h-4" />} label="Bug reports" />
        </nav>
        <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}
          className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto"><Outlet /></main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} activeOptions={{ exact: true }}
      activeProps={{ className: "bg-white/10 text-foreground" }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground">
      {icon} {label}
    </Link>
  );
}
