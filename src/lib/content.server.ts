// Server-only helpers. The `.server.ts` suffix blocks this from the client bundle.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export { supabaseAdmin };

export async function ensureAdmin(userId: string) {
  const { data, error } = await (supabaseAdmin as any).rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden: admin role required");
}

export async function adminList(table: string, opts?: { filter?: (q: any) => any }) {
  let q: any = (supabaseAdmin as any)
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (opts?.filter) q = opts.filter(q);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpsert(table: string, row: any) {
  const { id, ...rest } = row;
  if (id) {
    const { error } = await (supabaseAdmin as any).from(table).update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { id };
  }
  const { data: created, error } = await (supabaseAdmin as any)
    .from(table)
    .insert(rest)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: created!.id };
}

export async function adminDelete(table: string, id: string) {
  const { error } = await (supabaseAdmin as any).from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
