import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const emailSchema = z.object({ email: z.string().email().max(254) });
const userIdSchema = z.object({ user_id: z.string().uuid() });
const tokenSchema = z.object({ token: z.string().uuid() });

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("list_admins");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAdminInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("admin_invitations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAdminAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const inviteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => emailSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: inv, error } = await context.supabase.rpc("invite_admin", { _email: data.email });
    if (error) throw new Error(error.message);
    return inv;
  });

export const revokeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("revoke_admin", { _user_id: data.user_id });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const acceptAdminInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => tokenSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("accept_admin_invitation", { _token: data.token });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
