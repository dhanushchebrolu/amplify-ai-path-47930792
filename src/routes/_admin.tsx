import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkAdmin } from "@/lib/content.functions";
import { syncMyAccount } from "@/lib/admins.functions";
import { devSignOut, getDevSession, isDevAuthEnabled } from "@/lib/dev-auth";
import { LayoutDashboard, Wrench, MessageSquare, Sparkles, LogOut, FolderTree, FileText, Bug, ShieldCheck, GitCompareArrows } from "lucide-react";

export const Route = createFileRoute("/_admin")({
  // Supabase stores the session in localStorage which the server cannot read.
  // Gating this subtree server-side causes redirect loops on hard refresh and
  // shows the login page for a signed-in admin. Client-only guard is correct.
  ssr: false,
  beforeLoad: async () => {
    // Dev-mode local session bypass. `isDevAuthEnabled()` is compile-time
    // false in production builds, so this branch is dead code there.
    if (isDevAuthEnabled() && getDevSession()) return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const check = useServerFn(checkAdmin);
  const sync = useServerFn(syncMyAccount);
  const devMode = isDevAuthEnabled() && !!getDevSession();
  const [state, setState] = useState<"loading" | "ok" | "denied">(devMode ? "ok" : "loading");

  useEffect(() => {
    if (devMode) return;
    // Records last-login and applies any role invited for this email.
    sync()
      .catch(() => undefined)
      .then(() => check())
      .then((r: { isAdmin: boolean } | undefined) => setState(r?.isAdmin ? "ok" : "denied"))
      .catch(() => setState("denied"));
  }, [check, sync, devMode]);


  async function signOut() {
    if (devMode) {
      devSignOut();
    } else {
      await supabase.auth.signOut();
    }
    navigate({ to: "/admin/login" });
  }

  if (state === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Checking access…</div>;
  }
  if (state === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl">Not authorized</h1>
          <p className="text-muted-foreground mt-2 text-sm">This account isn't the site admin.</p>
          <button onClick={signOut}
            className="mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Sign out</button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-foreground/10 p-4 flex flex-col">
        <Link to="/" className="font-display text-xl mb-6">AI Blaze admin</Link>
        {devMode && (
          <div className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full border border-yellow-400/40 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-medium text-yellow-300">
            <span className="h-1 w-1 rounded-full bg-yellow-400" /> Dev mode
          </div>
        )}
        <nav className="space-y-1 text-sm flex-1">
          <NavItem to="/admin" icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" />
          <NavItem to="/admin/categories" icon={<FolderTree className="w-4 h-4" />} label="Categories" />
          <NavItem to="/admin/tools" icon={<Wrench className="w-4 h-4" />} label="Tools" />
          <NavItem to="/admin/comparison-data" icon={<GitCompareArrows className="w-4 h-4" />} label="Comparison data" />

          <NavItem to="/admin/prompts" icon={<MessageSquare className="w-4 h-4" />} label="Prompts" />
          <NavItem to="/admin/learn-tasks" icon={<Sparkles className="w-4 h-4" />} label="Learn tasks (all)" />
          <NavItem to="/admin/blog" icon={<FileText className="w-4 h-4" />} label="Blog" />
          <NavItem to="/admin/bug-reports" icon={<Bug className="w-4 h-4" />} label="Bug reports" />
          <NavItem to="/admin/admins" icon={<ShieldCheck className="w-4 h-4" />} label="Admins" />
          <NavItem to="/admin/auth-debug" icon={<Bug className="w-4 h-4" />} label="Auth debug" />

        </nav>
        <button onClick={signOut}
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
      activeProps={{ className: "bg-foreground/10 text-foreground" }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
      {icon} {label}
    </Link>
  );
}
