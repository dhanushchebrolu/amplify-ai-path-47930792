import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listTools, listPrompts, listLearnTasks } from "@/lib/content.functions";

export const Route = createFileRoute("/_admin/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const tools = useQuery({ queryKey: ["admin", "tools"], queryFn: () => listTools() });
  const prompts = useQuery({ queryKey: ["admin", "prompts"], queryFn: () => listPrompts() });
  const tasks = useQuery({ queryKey: ["admin", "learn"], queryFn: () => listLearnTasks() });

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Manage every piece of content on the site.</p>
      <div className="mt-8 grid grid-cols-3 gap-4">
        <Card label="Tools" count={tools.data?.length ?? 0} to="/admin/tools" />
        <Card label="Prompts" count={prompts.data?.length ?? 0} to="/admin/prompts" />
        <Card label="Learn tasks" count={tasks.data?.length ?? 0} to="/admin/learn-tasks" />
      </div>
    </div>
  );
}

function Card({ label, count, to }: { label: string; count: number; to: string }) {
  return (
    <Link to={to} className="card-surface rounded-2xl border border-white/10 p-6 hover:border-white/25 transition-colors">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-5xl mt-2">{count}</div>
      <div className="text-xs text-primary mt-3">Manage →</div>
    </Link>
  );
}
