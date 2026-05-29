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
  image_url: z.string().url().max(500).nullable().optional(),
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

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  sort_order: z.number().int().default(0),
});

const subcategorySchema = z.object({
  id: z.string().uuid().optional(),
  category_slug: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  sort_order: z.number().int().default(0),
});

const blogSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(160).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(240),
  excerpt: z.string().max(500).nullable().optional(),
  body: z.string().max(60000).default(""),
  cover_url: z.string().url().max(500).nullable().optional(),
  tags: z.array(z.string().max(60)).max(20).default([]),
  published: z.boolean().default(false),
  published_at: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
});

const bookSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(160).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(240),
  author: z.string().max(200).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  cover_url: z.string().url().max(500).nullable().optional(),
  affiliate_url: z.string().url().max(500),
  price_label: z.string().max(60).nullable().optional(),
  tags: z.array(z.string().max(60)).max(20).default([]),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

const courseSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(160).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(240),
  provider: z.string().max(200).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  cover_url: z.string().url().max(500).nullable().optional(),
  affiliate_url: z.string().url().max(500),
  price_label: z.string().max(60).nullable().optional(),
  level: z.string().max(60).nullable().optional(),
  duration: z.string().max(60).nullable().optional(),
  tags: z.array(z.string().max(60)).max(20).default([]),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

const hideSchema = z.object({
  kind: z.enum(["tool", "learn_task", "prompt"]),
  ref_key: z.string().min(1).max(200),
});

// ─── Admin guard helper ───────────────────────────────────────────────
async function ensureAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden: admin role required");
}

// ─── Generic public list ──────────────────────────────────────────────
function listFactory(table: string, opts?: { filter?: (q: any) => any }) {
  return createServerFn({ method: "GET" }).handler(async () => {
    let q: any = (supabaseAdmin as any).from(table).select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    if (opts?.filter) q = opts.filter(q);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  });
}

// ─── Generic upsert/delete factory ────────────────────────────────────
function upsertFactory<T extends z.ZodTypeAny>(table: string, schema: T) {
  return createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((d: unknown) => schema.parse(d))
    .handler(async ({ data, context }: any) => {
      await ensureAdmin({ supabase: context.supabase, userId: context.userId });
      const { id, ...rest } = data as any;
      if (id) {
        const { error } = await context.supabase.from(table).update(rest).eq("id", id);
        if (error) throw new Error(error.message);
        return { id };
      }
      const { data: created, error } = await context.supabase.from(table).insert(rest).select("id").single();
      if (error) throw new Error(error.message);
      return { id: created!.id };
    });
}

function deleteFactory(table: string) {
  return createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
    .handler(async ({ data, context }) => {
      await ensureAdmin({ supabase: context.supabase, userId: context.userId });
      const { error } = await (context.supabase as any).from(table).delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    });
}

// ─── PUBLIC READS ─────────────────────────────────────────────────────
export const listTools = listFactory("tools");
export const listPrompts = listFactory("prompts");
export const listLearnTasks = listFactory("learn_tasks");
export const listCategories = listFactory("categories");
export const listSubcategories = listFactory("subcategories");
export const listBooks = listFactory("books");
export const listCourses = listFactory("courses");
export const listBlogPosts = listFactory("blog_posts", { filter: (q) => q.eq("published", true).order("published_at", { ascending: false }) });
export const listAllBlogPosts = listFactory("blog_posts"); // admin

export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { data: post, error } = await supabaseAdmin.from("blog_posts").select("*").eq("slug", data.slug).eq("published", true).maybeSingle();
    if (error) throw new Error(error.message);
    return post;
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

// ─── ADMIN write fns ──────────────────────────────────────────────────
export const upsertTool = upsertFactory("tools", toolSchema);
export const deleteTool = deleteFactory("tools");

export const upsertPrompt = upsertFactory("prompts", promptSchema);
export const deletePrompt = deleteFactory("prompts");

export const upsertLearnTask = upsertFactory("learn_tasks", learnTaskSchema);
export const deleteLearnTask = deleteFactory("learn_tasks");

export const upsertCategory = upsertFactory("categories", categorySchema);
export const deleteCategory = deleteFactory("categories");

export const upsertSubcategory = upsertFactory("subcategories", subcategorySchema);
export const deleteSubcategory = deleteFactory("subcategories");

export const upsertBlogPost = upsertFactory("blog_posts", blogSchema);
export const deleteBlogPost = deleteFactory("blog_posts");

export const upsertBook = upsertFactory("books", bookSchema);
export const deleteBook = deleteFactory("books");

export const upsertCourse = upsertFactory("courses", courseSchema);
export const deleteCourse = deleteFactory("courses");

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
