import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

const idSchema = z.object({ id: z.string().uuid() });

// ─── PUBLIC READS ─────────────────────────────────────────────────────
export const listTools = createServerFn({ method: "GET" }).handler(async () => {
  const { adminList } = await import("./content.server");
  return adminList("tools");
});
export const listPrompts = createServerFn({ method: "GET" }).handler(async () => {
  const { adminList } = await import("./content.server");
  return adminList("prompts");
});
export const listLearnTasks = createServerFn({ method: "GET" }).handler(async () => {
  const { adminList } = await import("./content.server");
  return adminList("learn_tasks");
});
export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { adminList } = await import("./content.server");
  return adminList("categories");
});
export const listSubcategories = createServerFn({ method: "GET" }).handler(async () => {
  const { adminList } = await import("./content.server");
  return adminList("subcategories");
});
export const listBooks = createServerFn({ method: "GET" }).handler(async () => {
  const { adminList } = await import("./content.server");
  return adminList("books");
});
export const listCourses = createServerFn({ method: "GET" }).handler(async () => {
  const { adminList } = await import("./content.server");
  return adminList("courses");
});
export const listBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { adminList } = await import("./content.server");
  return adminList("blog_posts", {
    filter: (q) => q.eq("published", true).order("published_at", { ascending: false }),
  });
});
export const listAllBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { adminList } = await import("./content.server");
  return adminList("blog_posts");
});

export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./content.server");
    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return post;
  });

export const listHiddenItems = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("./content.server");
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
export const upsertTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => toolSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminUpsert } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminUpsert("tools", data);
  });
export const deleteTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminDelete } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminDelete("tools", data.id);
  });

export const upsertPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => promptSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminUpsert } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminUpsert("prompts", data);
  });
export const deletePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminDelete } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminDelete("prompts", data.id);
  });

export const upsertLearnTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => learnTaskSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminUpsert } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminUpsert("learn_tasks", data);
  });
export const deleteLearnTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminDelete } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminDelete("learn_tasks", data.id);
  });

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categorySchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminUpsert } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminUpsert("categories", data);
  });
export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminDelete } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminDelete("categories", data.id);
  });

export const upsertSubcategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => subcategorySchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminUpsert } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminUpsert("subcategories", data);
  });
export const deleteSubcategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminDelete } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminDelete("subcategories", data.id);
  });

export const upsertBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => blogSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminUpsert } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminUpsert("blog_posts", data);
  });
export const deleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminDelete } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminDelete("blog_posts", data.id);
  });

export const upsertBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bookSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminUpsert } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminUpsert("books", data);
  });
export const deleteBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminDelete } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminDelete("books", data.id);
  });

export const upsertCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => courseSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminUpsert } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminUpsert("courses", data);
  });
export const deleteCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, adminDelete } = await import("./content.server");
    await ensureAdmin(context.userId);
    return adminDelete("courses", data.id);
  });

// ─── ADMIN: HIDE / UNHIDE static items ────────────────────────────────
export const hideItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => hideSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, supabaseAdmin } = await import("./content.server");
    await ensureAdmin(context.userId);
    const { error } = await (supabaseAdmin as any)
      .from("hidden_items")
      .upsert(data, { onConflict: "kind,ref_key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unhideItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => hideSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { ensureAdmin, supabaseAdmin } = await import("./content.server");
    await ensureAdmin(context.userId);
    const { error } = await (supabaseAdmin as any)
      .from("hidden_items")
      .delete()
      .eq("kind", data.kind)
      .eq("ref_key", data.ref_key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
