import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserPlus, ShieldCheck, Pause, Play, Search } from "lucide-react";
import {
  listAdminUsers,
  listRoleInvitations,
  listAdminAuditLog,
  amISuperAdmin,
  assignRole,
  removeRole,
  setRoleStatus,
  ROLES,
  type AppRole,
} from "@/lib/admins.functions";

export const Route = createFileRoute("/_admin/admin/admins")({
  component: AdminsPage,
});

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  moderator: "Moderator",
};

function fmt(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function AdminsPage() {
  const qc = useQueryClient();
  const _list = useServerFn(listAdminUsers);
  const _invs = useServerFn(listRoleInvitations);
  const _log = useServerFn(listAdminAuditLog);
  const _super = useServerFn(amISuperAdmin);
  const _assign = useServerFn(assignRole);
  const _remove = useServerFn(removeRole);
  const _status = useServerFn(setRoleStatus);

  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => _list() });
  const invitations = useQuery({ queryKey: ["role-invitations"], queryFn: () => _invs() });
  const log = useQuery({ queryKey: ["admin-audit"], queryFn: () => _log() });
  const isSuper = useQuery({ queryKey: ["is-super-admin"], queryFn: () => _super() });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("admin");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["role-invitations"] });
    qc.invalidateQueries({ queryKey: ["admin-audit"] });
  };

  const add = useMutation({
    mutationFn: (v: { email: string; role: AppRole }) => _assign({ data: v }),
    onSuccess: (r) => {
      toast.success(
        r.outcome === "invited"
          ? "No account with that email yet — the role will be applied automatically at their first sign-in."
          : "Role assigned. It applies the next time they sign in.",
      );
      setEmail("");
      refresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const drop = useMutation({
    mutationFn: (v: { user_id: string; role: AppRole }) => _remove({ data: v }),
    onSuccess: () => {
      toast.success("Role removed");
      refresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const status = useMutation({
    mutationFn: (v: { user_id: string; role: AppRole; status: "active" | "suspended" }) =>
      _status({ data: v }),
    onSuccess: () => {
      toast.success("Status updated");
      refresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const rows = useMemo(() => {
    const all = (users.data ?? []) as any[];
    return all.filter(
      (r) =>
        (roleFilter === "all" || r.role === roleFilter) &&
        (!q || (r.email ?? "").toLowerCase().includes(q.toLowerCase())),
    );
  }, [users.data, q, roleFilter]);

  const canManage = !!isSuper.data?.isSuperAdmin;

  return (
    <div className="max-w-5xl space-y-10">
      <header>
        <h1 className="font-display text-3xl flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" /> Admin management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign roles by email. Existing accounts get the role right away; unknown emails keep a stored
          invitation that is applied automatically the first time they sign in. Signing in is always
          done by the user themselves.
        </p>
        {!canManage && (
          <p className="text-xs text-amber-300 mt-2">
            You can view this page, but only Super Admins can add, remove or suspend admins.
          </p>
        )}
      </header>

      <section>
        <h2 className="font-display text-xl mb-3">Add admin</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            add.mutate({ email, role });
          }}
          className="flex flex-wrap gap-2"
        >
          <input
            type="email"
            required
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!canManage}
            className="flex-1 min-w-[220px] px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25 disabled:opacity-50"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AppRole)}
            disabled={!canManage}
            className="px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none disabled:opacity-50"
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-background">
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!canManage || add.isPending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4 inline mr-1.5" />
            {add.isPending ? "Saving…" : "Add"}
          </button>
        </form>
      </section>

      <section>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="font-display text-xl mr-auto">Admins</h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search email…"
              className="pl-8 pr-3 py-1.5 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as AppRole | "all")}
            className="px-3 py-1.5 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none"
          >
            <option value="all" className="bg-background">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-background">
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-foreground/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-foreground/[0.04] text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Last login</th>
                <th className="text-left px-4 py-2">Created</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.isLoading && (
                <tr><td colSpan={6} className="px-4 py-4 text-muted-foreground">Loading…</td></tr>
              )}
              {!users.isLoading && rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-4 text-muted-foreground">No matching admins.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={`${r.user_id}-${r.role}`} className="border-t border-foreground/5">
                  <td className="px-4 py-2">{r.email}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs rounded-full border border-foreground/10 bg-foreground/[0.05] px-2 py-0.5">
                      {ROLE_LABELS[r.role as AppRole] ?? r.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={r.status === "suspended" ? "text-amber-400 text-xs" : "text-emerald-400 text-xs"}>
                      ● {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{fmt(r.last_login_at)}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{fmt(r.user_created_at)}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {canManage && (
                      <>
                        <button
                          onClick={() =>
                            status.mutate({
                              user_id: r.user_id,
                              role: r.role,
                              status: r.status === "suspended" ? "active" : "suspended",
                            })
                          }
                          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mr-4"
                        >
                          {r.status === "suspended" ? (
                            <><Play className="w-3.5 h-3.5" /> Reactivate</>
                          ) : (
                            <><Pause className="w-3.5 h-3.5" /> Suspend</>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${ROLE_LABELS[r.role as AppRole]} from ${r.email}?`))
                              drop.mutate({ user_id: r.user_id, role: r.role });
                          }}
                          className="text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Pending invitations</h2>
        <div className="rounded-xl border border-foreground/10 divide-y divide-foreground/10">
          {invitations.isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
          {(invitations.data ?? []).filter((i: any) => i.status === "pending").length === 0 &&
            !invitations.isLoading && (
              <div className="p-4 text-sm text-muted-foreground">No pending invitations.</div>
            )}
          {(invitations.data ?? [])
            .filter((i: any) => i.status === "pending")
            .map((i: any) => (
              <div key={i.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{i.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {ROLE_LABELS[i.role as AppRole] ?? i.role} · applied automatically at first sign-in ·
                    expires {fmt(i.expires_at)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Audit log</h2>
        <div className="rounded-xl border border-foreground/10 divide-y divide-foreground/10 text-sm">
          {log.isLoading && <div className="p-4 text-muted-foreground">Loading…</div>}
          {(log.data ?? []).map((row: any) => (
            <div key={row.id} className="p-3 flex justify-between gap-4">
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-foreground/10 mr-2">{row.action}</span>
                <span className="text-muted-foreground">{row.actor_email ?? "system"}</span>
                {row.target_email && <span className="text-muted-foreground"> → {row.target_email}</span>}
                {row.metadata?.role && (
                  <span className="text-muted-foreground"> ({row.metadata.role})</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(row.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
