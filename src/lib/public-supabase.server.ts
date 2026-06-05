// Server-side Supabase client using the PUBLISHABLE (anon) key.
// Use for public reads where RLS already allows anon SELECT.
// Avoids requiring SUPABASE_SERVICE_ROLE_KEY at build/prerender time.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let _client: ReturnType<typeof createClient<Database>> | undefined;

export function getPublicSupabase() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase URL or publishable key missing");
  _client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export async function publicList(table: string, opts?: { filter?: (q: any) => any }) {
  let q: any = getPublicSupabase()
    .from(table as any)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (opts?.filter) q = opts.filter(q);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}
