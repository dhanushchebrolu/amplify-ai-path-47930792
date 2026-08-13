import { createFileRoute } from "@tanstack/react-router";

/**
 * Compare health endpoint.
 *
 * Public callers get a boolean-only liveness answer — no table names, no
 * Postgres codes/messages, no environment details.
 *
 * Full diagnostics are returned ONLY to an authenticated admin (bearer token
 * in the Authorization header, verified server-side against Supabase Auth and
 * the `has_role(uid,'admin')` RPC).
 */

type Check = { name: string; status: "healthy" | "warning" | "error"; detail?: string; ms?: number };

async function timed(name: string, fn: () => Promise<Check>): Promise<Check> {
  const t0 = Date.now();
  try {
    const c = await fn();
    return { ...c, ms: Date.now() - t0 };
  } catch (e) {
    return {
      name,
      status: "error",
      detail: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
      ms: Date.now() - t0,
    };
  }
}

async function isAdminRequest(request: Request): Promise<boolean> {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token) return false;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return false;
    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user) return false;
    const { data: ok } = await sb.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    return ok === true;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/compare-health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await isAdminRequest(request);
        const { getPublicSupabase, describeEnv } = await import("@/lib/public-supabase.server");
        const env = describeEnv();

        const publicResponse = (healthy: boolean) =>
          Response.json(
            { status: healthy ? "ok" : "error" },
            { status: healthy ? 200 : 503, headers: { "cache-control": "no-store" } },
          );

        if (env.missingEnv.length) {
          console.error("[compare-health] missing env", env.missingEnv);
          if (!admin) return publicResponse(false);
          return Response.json(
            {
              status: "error",
              env,
              checks: [
                { name: "environment", status: "error", detail: `Missing: ${env.missingEnv.join(", ")}` },
              ],
            },
            { status: 500, headers: { "cache-control": "no-store" } },
          );
        }

        const sb = getPublicSupabase();
        const checks: Check[] = [
          {
            name: "environment",
            status: "healthy",
            detail: `${env.supabaseUrl} (project ${env.supabaseProjectId ?? "?"})`,
          },
        ];

        checks.push(
          await timed("tools table (anon SELECT)", async () => {
            const { data, error } = await sb.from("tools").select("slug").limit(5);
            if (error)
              return {
                name: "tools table (anon SELECT)",
                status: "error",
                detail: `${error.code ?? ""} ${error.message}`,
              };
            return {
              name: "tools table (anon SELECT)",
              status: (data?.length ?? 0) > 0 ? "healthy" : "warning",
              detail: `${data?.length ?? 0} rows sampled`,
            };
          }),
        );

        checks.push(
          await timed("tool_comparison_data (anon SELECT)", async () => {
            const { count, error } = await sb
              .from("tool_comparison_data")
              .select("id", { count: "exact", head: true });
            if (error)
              return {
                name: "tool_comparison_data (anon SELECT)",
                status: "error",
                detail: `${error.code ?? ""} ${error.message}`,
              };
            return {
              name: "tool_comparison_data (anon SELECT)",
              status: "healthy",
              detail: `${count ?? 0} rows (0 is fine — profiles are inferred)`,
            };
          }),
        );

        checks.push(
          await timed("tool_comparisons editorial (anon SELECT)", async () => {
            const { count, error } = await sb
              .from("tool_comparisons")
              .select("id", { count: "exact", head: true })
              .eq("published", true);
            if (error)
              return {
                name: "tool_comparisons editorial (anon SELECT)",
                status: "error",
                detail: `${error.code ?? ""} ${error.message}`,
              };
            return {
              name: "tool_comparisons editorial (anon SELECT)",
              status: "healthy",
              detail: `${count ?? 0} published rows`,
            };
          }),
        );

        const status = checks.some((c) => c.status === "error")
          ? "error"
          : checks.some((c) => c.status === "warning")
            ? "warning"
            : "healthy";

        if (!admin) {
          if (status === "error") console.error("[compare-health] checks failed", checks);
          return publicResponse(status !== "error");
        }

        return Response.json(
          { status, env, checks, generatedAt: new Date().toISOString() },
          { status: status === "error" ? 500 : 200, headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
