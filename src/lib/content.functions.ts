import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ─── Schemas ───────────────────────────────────────────────────────────
const toolSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  tagline: z.string().max(300).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  url: z.string().url().max(500),
  logo_url: z.string().url().max(500).nullable().optional(),
  category: z.string().max(120).nullable().optional(),
  subcategory: z.string().max(120).nullable().optional(),
  tags: z.array(z.string().max(60)).max(20).default([]),
  pricing: z.string().max(60).nullable().optional(),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

const promptSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(8000),
  category: z.string().max(60).nullable().optional(),
  tool_name: z.string().max(120).nullable().optional(),
  tool_url: z.string().url().max(500).nullable().optional(),
  tags: z.array(z.string().max(60)).max(20).default([]),
  sort_order: z.number().int().default(0),
});

const learnTaskSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  kind: z.enum(["spin", "swipe", "scratch", "any"]),
  title: z.string().min(1).max(200),
  tagline: z.string().max(300).nullable().optional(),
  category: z.string().max(60).nullable().optional(),
  difficulty: z.string().max(40).nullable().optional(),
  minutes: z.number().int().min(1).max(240).default(5),
  tool_name: z.string().max(120).nullable().optional(),
  tool_url: z.string().url().max(500).nullable().optional(),
  prompt: z.string().max(4000).nullable().optional(),
  steps: z.array(z.string().max(500)).max(20).default([]),
  cover_url: z.string().url().max(500).nullable().optional(),
  reference_url: z.string().url().max(500).nullable().optional(),
  reference_caption: z.string().max(300).nullable().optional(),
  sort_order: z.number().int().default(0),
});

const hideSchema = z.object({
  kind: z.enum(["tool", "learn_task", "prompt"]),
  ref_key: z.string().min(1).max(200),
});

// ─── Admin guard helper (called from inside server fns) ───────────────
async function ensureAdmin(context: { supabase: ReturnType<typeof supabaseAdmin.from> extends never ? never : any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden: admin role required");
}

// ─── PUBLIC READS ─────────────────────────────────────────────────────
export const listTools = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("tools")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listPrompts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("prompts")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listLearnTasks = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("learn_tasks")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listHiddenItems = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.from("hidden_items").select("kind, ref_key");
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ─── ADMIN: check role ────────────────────────────────────────────────
export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    return { isAdmin: !!data, userId };
  });

// ─── ADMIN: TOOLS ─────────────────────────────────────────────────────
export const upsertTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => toolSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin({ supabase: context.supabase, userId: context.userId });
    const { id, ...rest } = data;
    if (id) {
      const { error } = await context.supabase.from("tools").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: created, error } = await context.supabase.from("tools").insert(rest).select("id").single();
    if (error) throw new Error(error.message);
    return { id: created!.id };
  });

export const deleteTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin({ supabase: context.supabase, userId: context.userId });
    const { error } = await context.supabase.from("tools").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── ADMIN: PROMPTS ───────────────────────────────────────────────────
export const upsertPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => promptSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin({ supabase: context.supabase, userId: context.userId });
    const { id, ...rest } = data;
    if (id) {
      const { error } = await context.supabase.from("prompts").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: created, error } = await context.supabase.from("prompts").insert(rest).select("id").single();
    if (error) throw new Error(error.message);
    return { id: created!.id };
  });

export const deletePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin({ supabase: context.supabase, userId: context.userId });
    const { error } = await context.supabase.from("prompts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── ADMIN: LEARN TASKS ───────────────────────────────────────────────
export const upsertLearnTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => learnTaskSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin({ supabase: context.supabase, userId: context.userId });
    const { id, ...rest } = data;
    if (id) {
      const { error } = await context.supabase.from("learn_tasks").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: created, error } = await context.supabase.from("learn_tasks").insert(rest).select("id").single();
    if (error) throw new Error(error.message);
    return { id: created!.id };
  });

export const deleteLearnTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin({ supabase: context.supabase, userId: context.userId });
    const { error } = await context.supabase.from("learn_tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── ADMIN: HIDE / UNHIDE static items ────────────────────────────────
export const hideItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => hideSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin({ supabase: context.supabase, userId: context.userId });
    const { error } = await context.supabase.from("hidden_items").upsert(data, { onConflict: "kind,ref_key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unhideItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => hideSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin({ supabase: context.supabase, userId: context.userId });
    const { error } = await context.supabase.from("hidden_items").delete().eq("kind", data.kind).eq("ref_key", data.ref_key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
