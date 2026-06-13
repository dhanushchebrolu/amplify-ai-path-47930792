import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Mail, Copy, ShieldCheck } from "lucide-react";
import {
  listAdmins,
  listAdminInvitations,
  listAdminAuditLog,
  inviteAdmin,
  revokeAdmin,
} from "@/lib/admins.functions";

export const Route = createFileRoute("/_admin/admin/admins")({
  component: AdminsPage,
});

function AdminsPage() {
  const qc = useQueryClient();
  const _listAdmins = useServerFn(listAdmins);
  const _listInv = useServerFn(listAdminInvitations);
  const _listLog = useServerFn(listAdminAuditLog);
  const _invite = useServerFn(inviteAdmin);
  const _revoke = useServerFn(revokeAdmin);

  const admins = useQuery({ queryKey: ["admins"], queryFn: () => _listAdmins() });
  const invs = useQuery({ queryKey: ["admin-invitations"], queryFn: () => _listInv() });
  const log = useQuery({ queryKey: ["admin-audit"], queryFn: () => _listLog() });

  const [email, setEmail] = useState("");

  const invite = useMutation({
    mutationFn: (email: string) => _invite({ data: { email } }),
    onSuccess: () => {
      toast.success("Invitation created. Share the link below with the invitee.");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
      qc.invalidateQueries({ queryKey: ["admin-audit"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to invite"),
  });

  const revoke = useMutation({
    mutationFn: (user_id: string) => _revoke({ data: { user_id } }),
    onSuccess: () => {
      toast.success("Admin access revoked");
      qc.invalidateQueries({ queryKey: ["admins"] });
      qc.invalidateQueries({ queryKey: ["admin-audit"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to revoke"),
  });

  function inviteLink(token: string) {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/admin/accept-invitation?token=${token}`;
  }

  return (
    <div className="max-w-4xl space-y-10">
      <header>
        <h1 className="font-display text-3xl flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" /> Admin management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invite new admins by email. Only existing admins can grant or revoke admin access. The last admin cannot be removed.
        </p>
      </header>

      <section>
        <h2 className="font-display text-xl mb-3">Invite a new admin</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            invite.mutate(email);
          }}
          className="flex gap-2"
        >
          <input
            type="email" required placeholder="email@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25"
          />
          <button
            type="submit" disabled={invite.isPending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            <Mail className="w-4 h-4 inline mr-1.5" />
            {invite.isPending ? "Inviting…" : "Send invitation"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Current admins</h2>
        <div className="rounded-xl border border-white/10 divide-y divide-white/10">
          {admins.isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
          {admins.data?.map((a: any) => (
            <div key={a.user_id} className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{a.email}</div>
                <div className="text-xs text-muted-foreground">since {new Date(a.granted_at).toLocaleDateString()}</div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Revoke admin access for ${a.email}?`)) revoke.mutate(a.user_id);
                }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Revoke
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Invitations</h2>
        <div className="rounded-xl border border-white/10 divide-y divide-white/10">
          {invs.isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
          {invs.data?.length === 0 && <div className="p-4 text-sm text-muted-foreground">No invitations yet.</div>}
          {invs.data?.map((i: any) => (
            <div key={i.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{i.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.status} · expires {new Date(i.expires_at).toLocaleDateString()}
                  </div>
                </div>
                {i.status === "pending" && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink(i.token));
                      toast.success("Invitation link copied");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy link
                  </button>
                )}
              </div>
              {i.status === "pending" && (
                <div className="mt-2 text-[11px] text-muted-foreground break-all bg-white/[0.03] rounded p-2 border border-white/5">
                  {inviteLink(i.token)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Audit log</h2>
        <div className="rounded-xl border border-white/10 divide-y divide-white/10 text-sm">
          {log.isLoading && <div className="p-4 text-muted-foreground">Loading…</div>}
          {log.data?.map((row: any) => (
            <div key={row.id} className="p-3 flex justify-between gap-4">
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 mr-2">{row.action}</span>
                <span className="text-muted-foreground">{row.actor_email ?? "system"}</span>
                {row.target_email && <span className="text-muted-foreground"> → {row.target_email}</span>}
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
