/**
 * Single source of truth for SERVER-side configuration (Cloudflare Worker).
 *
 * Read only inside request handlers / server functions — never at module scope,
 * because the Worker injects bindings at call time.
 */

function pick(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (v) return v;
  }
  return undefined;
}

export type ServerEnv = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_PROJECT_ID: string | undefined;
};

export function readServerEnv(): { env: Partial<ServerEnv>; missing: string[] } {
  const env: Partial<ServerEnv> = {
    SUPABASE_URL: pick("SUPABASE_URL", "VITE_SUPABASE_URL"),
    SUPABASE_PUBLISHABLE_KEY: pick(
      "SUPABASE_PUBLISHABLE_KEY",
      "VITE_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_ANON_KEY",
      "VITE_SUPABASE_ANON_KEY",
    ),
    SUPABASE_PROJECT_ID: pick("SUPABASE_PROJECT_ID", "VITE_SUPABASE_PROJECT_ID"),
  };
  const missing: string[] = [];
  if (!env.SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!env.SUPABASE_PUBLISHABLE_KEY) missing.push("SUPABASE_PUBLISHABLE_KEY");
  return { env, missing };
}

/** Returns validated server config or throws naming exactly what is missing. */
export function requireServerEnv(): ServerEnv {
  const { env, missing } = readServerEnv();
  if (missing.length) {
    throw new Error(
      `Missing required Worker environment variable(s): ${missing.join(", ")}. ` +
        `Configure them on the Cloudflare Worker (see ENVIRONMENT_SETUP.md) and redeploy.`,
    );
  }
  return env as ServerEnv;
}
