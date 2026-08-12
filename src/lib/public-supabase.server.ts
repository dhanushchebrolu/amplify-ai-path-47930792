// Server-side Supabase client using the PUBLISHABLE (anon) key.
// Use for public reads where RLS already allows anon SELECT.
// Avoids requiring SUPABASE_SERVICE_ROLE_KEY at build/prerender time.
import { requireServerEnv, readServerEnv } from "@/config/env.server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let _client: ReturnType<typeof createClient<Database>> | undefined;

/** Non-secret environment fingerprint for diagnostics (no keys are exposed). */
export function describeEnv() {
  const { env, missing } = readServerEnv();
  return {
    supabaseUrl: env.SUPABASE_URL ?? null,
    supabaseProjectId: env.SUPABASE_PROJECT_ID ?? null,
    publishableKeyPresent: !!env.SUPABASE_PUBLISHABLE_KEY,
    missingEnv: missing,
    appEnv: process.env.APP_ENV ?? null,
  };
}


export function getPublicSupabase() {
  if (_client) return _client;
  const { SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key } = requireServerEnv();
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
