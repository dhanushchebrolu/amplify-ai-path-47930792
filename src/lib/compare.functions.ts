import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";



const slugRe = /^[a-z0-9-]+$/;

export type CompareTool = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  category: string | null;
  subcategory: string | null;
  tagline: string | null;
  description: string | null;
  url: string;
  tags: string[];
  pricing: string | null;
};

export type VerificationStatus = "draft" | "needs_review" | "verified";

export type CompareData = {
  company: string | null;
  website: string | null;
  launch_year: number | null;
  status: string | null;
  /** Trust gate: only "verified" rows may be rendered publicly. */
  verification_status: VerificationStatus;
  verified_at: string | null;
  source_url: string | null;
  open_source: boolean;
  api_available: boolean;
  pricing: Json;
  models: Json;
  features: Json;
  platforms: Json;
  languages: Json;
  integrations: Json;
  use_cases: string[];
  limitations: Json;
  pros: string[];
  cons: string[];
  media: Json;
  seo: Json;
  metadata: Json;
  updated_at: string;
} | null;


export type CompareBundleItem = { tool: CompareTool; data: CompareData };

// ─── PUBLIC: autocomplete search ──────────────────────────────────────
export const searchToolsForCompare = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string; limit?: number }) =>
    z.object({ q: z.string().max(120), limit: z.number().int().min(1).max(50).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { getPublicSupabase } = await import("./public-supabase.server");
    const q = data.q.trim();
    const limit = data.limit ?? 20;
    if (!q) {
      const { data: rows } = await getPublicSupabase()
        .from("tools")
        .select("id,slug,name,logo_url,category,subcategory,tagline,pricing,featured")
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(limit);
      return rows ?? [];
    }
    const like = `%${q.replace(/[%_]/g, "")}%`;
    const { data: rows, error } = await getPublicSupabase()
      .from("tools")
      .select("id,slug,name,logo_url,category,subcategory,tagline,pricing,featured")
      .or(
        `name.ilike.${like},slug.ilike.${like},tagline.ilike.${like},description.ilike.${like},category.ilike.${like},subcategory.ilike.${like}`,
      )
      .limit(limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ─── PUBLIC: list all tools (for compare picker) ──────────────────────
export const listAllToolsForCompare = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./public-supabase.server");
  const { data, error } = await getPublicSupabase()
    .from("tools")
    .select("id,slug,name,logo_url,category,subcategory,tagline,pricing,tags,featured")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ─── PUBLIC: bundle for a matchup ─────────────────────────────────────
export const getComparisonBundle = createServerFn({ method: "GET" })
  .inputValidator((d: { slugs: string[] }) =>
    z
      .object({
        slugs: z.array(z.string().regex(slugRe).max(120)).min(2).max(4),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<CompareBundleItem[]> => {
    const { getPublicSupabase, describeEnv } = await import("./public-supabase.server");
    const { throwQueryError, CompareError } = await import("./compare-trace");
    let sb: ReturnType<typeof getPublicSupabase>;
    try {
      sb = getPublicSupabase();
    } catch (e) {
      throw new CompareError("supabase-client", e instanceof Error ? e.message : String(e), describeEnv());
    }
    const slugs = Array.from(new Set(data.slugs));
    const t0 = Date.now();
    const { data: tools, error: tErr } = await sb
      .from("tools")
      .select("id,slug,name,logo_url,category,subcategory,tagline,description,url,tags,pricing")
      .in("slug", slugs);
    if (tErr) throwQueryError("tools-lookup", tErr, { table: "tools", filter: { slug_in: slugs }, ...describeEnv() });
    console.log("[compare] tools-lookup", { slugs, rows: tools?.length ?? 0, ms: Date.now() - t0 });
    if (!tools || tools.length === 0) return [];
    const ids = tools.map((t) => t.id);
    const t1 = Date.now();
    const { data: cmp, error: cErr } = await sb
      .from("tool_comparison_data")
      .select("*")
      .in("tool_id", ids)
;
    if (cErr)
      throwQueryError("comparison-data-lookup", cErr, {
        table: "tool_comparison_data",
        filter: { tool_id_in: ids },
        ...describeEnv(),
      });
    console.log("[compare] comparison-data-lookup", { ids: ids.length, rows: cmp?.length ?? 0, ms: Date.now() - t1 });
    const byId = new Map((cmp ?? []).map((r) => [r.tool_id, r]));
    // Preserve requested slug order
    const bySlug = new Map(tools.map((t) => [t.slug, t]));
    const out: CompareBundleItem[] = [];
    for (const s of slugs) {
      const t = bySlug.get(s);
      if (!t) continue;
      const raw = byId.get(t.id) as Record<string, any> | undefined;
      out.push({
        tool: t as CompareTool,
        data: raw
          ? {
              company: raw.company,
              website: raw.website,
              launch_year: raw.launch_year,
              status: raw.status,
              verification_status: (raw.verification_status ?? "draft") as VerificationStatus,
              verified_at: raw.verified_at ?? null,
              source_url: raw.source_url ?? null,
              open_source: raw.open_source,
              api_available: raw.api_available,

              pricing: (raw.pricing as Json) ?? {},
              models: (raw.models as Json) ?? {},
              features: (raw.features as Json) ?? {},
              platforms: (raw.platforms as Json) ?? {},
              languages: (raw.languages as Json) ?? {},
              integrations: (raw.integrations as Json) ?? {},
              use_cases: raw.use_cases ?? [],
              limitations: (raw.limitations as Json) ?? {},
              pros: raw.pros ?? [],
              cons: raw.cons ?? [],
              media: (raw.media as Json) ?? {},
              seo: (raw.seo as Json) ?? {},
              metadata: (raw.metadata as Json) ?? {},
              updated_at: raw.updated_at,
            }
          : null,
      });
    }
    return out;
  });

// ─── PUBLIC: list slugs for sitemap ───────────────────────────────────
export const listComparisonToolSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicSupabase } = await import("./public-supabase.server");
  const { data } = await getPublicSupabase()
    .from("tool_comparison_data")
    .select("tool_id, updated_at, tools:tool_id(slug)")
    .limit(200);

  return (data ?? [])
    .map((r: any) => ({ slug: r.tools?.slug as string | undefined, updated_at: r.updated_at as string }))
    .filter((r): r is { slug: string; updated_at: string } => !!r.slug);
});

// ─── ADMIN: list all tools with data status ───────────────────────────
export const listComparisonAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("forbidden");
    const { data: tools, error } = await supabase
      .from("tools")
      .select(
        "id,slug,name,logo_url,category, tool_comparison_data(tool_id,status,verification_status,verified_at,updated_at)",
      )
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (tools ?? []).map((t: any) => ({
      id: t.id as string,
      slug: t.slug as string,
      name: t.name as string,
      logo_url: t.logo_url as string | null,
      category: t.category as string | null,
      has_data: !!t.tool_comparison_data,
      status: (t.tool_comparison_data?.status as string | null) ?? null,
      verification_status: (t.tool_comparison_data?.verification_status as string | null) ?? null,
      verified_at: (t.tool_comparison_data?.verified_at as string | null) ?? null,
      updated_at: (t.tool_comparison_data?.updated_at as string | null) ?? null,
    }));
  });


// ─── ADMIN: fetch one ─────────────────────────────────────────────────
export const getComparisonAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { toolId: string }) =>
    z.object({ toolId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("forbidden");
    const { data: tool, error: tErr } = await supabase
      .from("tools")
      .select("id,slug,name,logo_url,category,subcategory,url,description,tagline,pricing,tags")
      .eq("id", data.toolId)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!tool) throw new Error("tool not found");
    const { data: cmp } = await supabase
      .from("tool_comparison_data")
      .select("*")
      .eq("tool_id", data.toolId)
      .maybeSingle();
    return { tool, data: cmp };
  });

// ─── ADMIN: upsert ────────────────────────────────────────────────────
const upsertSchema = z.object({
  toolId: z.string().uuid(),
  company: z.string().max(200).nullable().optional(),
  website: z.string().max(500).nullable().optional(),
  launch_year: z.number().int().min(1970).max(2100).nullable().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  verification_status: z.enum(["draft", "needs_review", "verified"]).default("verified"),
  verification_note: z.string().max(2000).nullable().optional(),
  source_url: z.string().max(500).nullable().optional(),

  open_source: z.boolean().default(false),
  api_available: z.boolean().default(false),
  pricing: z.record(z.string(), z.unknown()).default({}),
  models: z.record(z.string(), z.unknown()).default({}),
  features: z.record(z.string(), z.unknown()).default({}),
  platforms: z.record(z.string(), z.unknown()).default({}),
  languages: z.record(z.string(), z.unknown()).default({}),
  integrations: z.record(z.string(), z.unknown()).default({}),
  use_cases: z.array(z.string().max(300)).max(50).default([]),
  limitations: z.record(z.string(), z.unknown()).default({}),
  pros: z.array(z.string().max(300)).max(50).default([]),
  cons: z.array(z.string().max(300)).max(50).default([]),
  media: z.record(z.string(), z.unknown()).default({}),
  seo: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const upsertComparisonAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof upsertSchema>) => upsertSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("forbidden");
    const { toolId, ...rest } = data;
    // Verification provenance is stamped server-side only — never trusted from the client.
    const verified = rest.verification_status === "verified";
    const { data: row, error } = await supabase
      .from("tool_comparison_data")
      .upsert(
        {
          tool_id: toolId,
          ...rest,
          verified_at: verified ? new Date().toISOString() : null,
          verified_by: verified ? userId : null,
        } as never,
        { onConflict: "tool_id" },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row;
  });

// ─── PUBLIC: editor-written comparison content ────────────────────────
export type ComparisonEditorial = {
  matchup: string;
  headline: string | null;
  intro: string | null;
  quick_summary: Array<{ label: string; tool: string }>;
  category_winners: Array<{ label: string; tool: string }>;
  verdicts: Record<string, string>;
  faqs: Array<{ q: string; a: string }>;
  long_form: Array<{ heading: string; body: string }>;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  updated_at: string;
} | null;

export const getComparisonEditorial = createServerFn({ method: "GET" })
  .inputValidator((d: { matchup: string }) =>
    z.object({ matchup: z.string().max(300).regex(/^[a-z0-9-]+$/) }).parse(d),
  )
  .handler(async ({ data }): Promise<ComparisonEditorial> => {
    const { getPublicSupabase, describeEnv } = await import("./public-supabase.server");
    const { throwQueryError } = await import("./compare-trace");
    const t0 = Date.now();
    const { data: row, error } = await getPublicSupabase()
      .from("tool_comparisons")
      .select("*")
      .eq("matchup", data.matchup)
      .eq("published", true)
      .maybeSingle();
    if (error)
      throwQueryError("editorial-lookup", error, {
        table: "tool_comparisons",
        filter: { matchup: data.matchup, published: true },
        ...describeEnv(),
      });
    console.log("[compare] editorial-lookup", { matchup: data.matchup, found: !!row, ms: Date.now() - t0 });
    return (row as ComparisonEditorial) ?? null;
  });

// ─── PUBLIC: related content rail ─────────────────────────────────────
export const getCompareRelated = createServerFn({ method: "GET" })
  .inputValidator((d: { slugs: string[]; category?: string | null }) =>
    z
      .object({
        slugs: z.array(z.string().regex(slugRe).max(120)).min(1).max(4),
        category: z.string().max(200).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { getPublicSupabase } = await import("./public-supabase.server");
    const sb = getPublicSupabase();
    const tRel = Date.now();
    let toolsQ = sb
      .from("tools")
      .select("id,slug,name,logo_url,category,tagline")
      .not("slug", "in", `(${data.slugs.join(",")})`)
      .limit(8);
    if (data.category) toolsQ = toolsQ.eq("category", data.category);
    const [{ data: tools }, { data: posts }, { data: prompts }, { data: pairs }] = await Promise.all([
      toolsQ,
      sb
        .from("blog_posts")
        .select("slug,title,excerpt,cover_url,published_at")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(4),
      sb.from("prompts").select("id,title,category").limit(6),
      sb
        .from("tool_comparisons")
        .select("matchup,headline")
        .eq("published", true)
        .neq("matchup", data.slugs.join("-vs-"))
        .limit(6),
    ]);
    console.log("[compare] related-lookup", {
      tools: tools?.length ?? 0,
      posts: posts?.length ?? 0,
      prompts: prompts?.length ?? 0,
      comparisons: pairs?.length ?? 0,
      ms: Date.now() - tRel,
    });
    return {
      tools: tools ?? [],
      posts: posts ?? [],
      prompts: prompts ?? [],
      comparisons: pairs ?? [],
    };
  });

// ─── ADMIN: editorial comparisons ─────────────────────────────────────
export const listEditorialComparisons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("tool_comparisons")
      .select("id,matchup,headline,published,updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getEditorialComparison = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { matchup: string }) =>
    z.object({ matchup: z.string().max(300).regex(/^[a-z0-9-]+$/) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: row } = await context.supabase
      .from("tool_comparisons")
      .select("*")
      .eq("matchup", data.matchup)
      .maybeSingle();
    return row;
  });

const editorialSchema = z.object({
  matchup: z.string().max(300).regex(/^[a-z0-9-]+$/),
  headline: z.string().max(300).nullable().optional(),
  intro: z.string().max(8000).nullable().optional(),
  quick_summary: z.array(z.object({ label: z.string().max(120), tool: z.string().max(120) })).max(24).default([]),
  category_winners: z.array(z.object({ label: z.string().max(120), tool: z.string().max(120) })).max(24).default([]),
  faqs: z.array(z.object({ q: z.string().max(300), a: z.string().max(3000) })).max(30).default([]),
  long_form: z.array(z.object({ heading: z.string().max(200), body: z.string().max(20000) })).max(30).default([]),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(400).nullable().optional(),
  published: z.boolean().default(false),
});

export const upsertEditorialComparison = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof editorialSchema>) => editorialSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const slugs = data.matchup.split("-vs-");
    const { data: row, error } = await supabase
      .from("tool_comparisons")
      .upsert({ ...data, slugs } as never, { onConflict: "matchup" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteEditorialComparison = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { matchup: string }) =>
    z.object({ matchup: z.string().max(300) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("tool_comparisons").delete().eq("matchup", data.matchup);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
