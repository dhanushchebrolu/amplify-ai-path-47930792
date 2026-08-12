import { createFileRoute } from "@tanstack/react-router";

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

export const Route = createFileRoute("/api/public/compare-health")({
  server: {
    handlers: {
      GET: async () => {
        const { getPublicSupabase, describeEnv } = await import("@/lib/public-supabase.server");
        const env = describeEnv();
        const checks: Check[] = [];

        checks.push({
          name: "environment",
          status: env.missingEnv.length ? "error" : "healthy",
          detail: env.missingEnv.length
            ? `Missing: ${env.missingEnv.join(", ")}`
            : `${env.supabaseUrl} (project ${env.supabaseProjectId ?? "?"}, APP_ENV=${env.appEnv ?? "unset"})`,
        });

        if (env.missingEnv.length) {
          return Response.json({ status: "error", env, checks }, { status: 500 });
        }

        const sb = getPublicSupabase();

        checks.push(
          await timed("tools table (anon SELECT)", async () => {
            const { data, error } = await sb.from("tools").select("slug").limit(5);
            if (error) return { name: "tools table (anon SELECT)", status: "error", detail: `${error.code ?? ""} ${error.message}` };
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

        // ── Query-shape isolation tests ─────────────────────────────────
        // Diagnostic only (temporary): the exact same `sb` client already
        // proved it can read tool_comparison_data via a head/count select
        // above. These tests progressively reshape the query toward what
        // getComparisonBundle actually sends, to isolate whether a PGRST205
        // is tied to query shape (select *, .in() filter) or is an
        // intermittent PostgREST-side schema-cache issue. Safe to remove
        // once root cause is confirmed — reads only, no writes, no schema
        // changes.
        checks.push(
          await timed("test A: select(*) limit(1)", async () => {
            const { data, error } = await sb.from("tool_comparison_data").select("*").limit(1);
            if (error)
              return { name: "test A: select(*) limit(1)", status: "error", detail: `${error.code ?? ""} ${error.message}` };
            return { name: "test A: select(*) limit(1)", status: "healthy", detail: `${data?.length ?? 0} rows` };
          }),
        );

        checks.push(
          await timed("test B: select(tool_id) limit(1)", async () => {
            const { data, error } = await sb.from("tool_comparison_data").select("tool_id").limit(1);
            if (error)
              return { name: "test B: select(tool_id) limit(1)", status: "error", detail: `${error.code ?? ""} ${error.message}` };
            return { name: "test B: select(tool_id) limit(1)", status: "healthy", detail: `${data?.length ?? 0} rows` };
          }),
        );

        let sampleIds: string[] = [];
        checks.push(
          await timed("resolve chatgpt/claude tool ids", async () => {
            const { data, error } = await sb.from("tools").select("id,slug").in("slug", ["chatgpt", "claude"]);
            if (error)
              return { name: "resolve chatgpt/claude tool ids", status: "error", detail: `${error.code ?? ""} ${error.message}` };
            sampleIds = (data ?? []).map((t) => t.id);
            return {
              name: "resolve chatgpt/claude tool ids",
              status: sampleIds.length > 0 ? "healthy" : "warning",
              detail: `resolved ${sampleIds.length} ids: ${JSON.stringify(data?.map((t) => t.slug))}`,
            };
          }),
        );

        checks.push(
          await timed("test C: select(tool_id).in(tool_id, ids)", async () => {
            if (sampleIds.length === 0)
              return { name: "test C: select(tool_id).in(tool_id, ids)", status: "warning", detail: "skipped: no ids resolved" };
            const { data, error } = await sb.from("tool_comparison_data").select("tool_id").in("tool_id", sampleIds);
            if (error)
              return {
                name: "test C: select(tool_id).in(tool_id, ids)",
                status: "error",
                detail: `${error.code ?? ""} ${error.message}`,
              };
            return { name: "test C: select(tool_id).in(tool_id, ids)", status: "healthy", detail: `${data?.length ?? 0} rows` };
          }),
        );

        checks.push(
          await timed("test D: select(*).in(tool_id, ids)", async () => {
            if (sampleIds.length === 0)
              return { name: "test D: select(*).in(tool_id, ids)", status: "warning", detail: "skipped: no ids resolved" };
            const { data, error } = await sb.from("tool_comparison_data").select("*").in("tool_id", sampleIds);
            if (error)
              return { name: "test D: select(*).in(tool_id, ids)", status: "error", detail: `${error.code ?? ""} ${error.message}` };
            return { name: "test D: select(*).in(tool_id, ids)", status: "healthy", detail: `${data?.length ?? 0} rows` };
          }),
        );

        checks.push(
          await timed("test E: getComparisonBundle (real path, retry x3)", async () => {
            const { getComparisonBundle } = await import("@/lib/compare.functions");
            const attempts: string[] = [];
            for (let i = 0; i < 3; i++) {
              try {
                const items = await getComparisonBundle({ data: { slugs: ["chatgpt", "claude"] } });
                attempts.push(`try${i + 1}=ok(${items.length})`);
              } catch (e) {
                attempts.push(`try${i + 1}=fail(${e instanceof Error ? e.message.slice(0, 60) : String(e)})`);
              }
            }
            const anyOk = attempts.some((a) => a.includes("=ok"));
            const anyFail = attempts.some((a) => a.includes("=fail"));
            return {
              name: "test E: getComparisonBundle (real path, retry x3)",
              status: anyFail && anyOk ? "warning" : anyFail ? "error" : "healthy",
              detail: attempts.join(" | ") + (anyFail && anyOk ? " — INTERMITTENT: same query, different outcomes" : ""),
            };
          }),
        );

        const status = checks.some((c) => c.status === "error")
          ? "error"
          : checks.some((c) => c.status === "warning")
            ? "warning"
            : "healthy";

        return Response.json(
          { status, env, checks, generatedAt: new Date().toISOString() },
          { status: status === "error" ? 500 : 200, headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
