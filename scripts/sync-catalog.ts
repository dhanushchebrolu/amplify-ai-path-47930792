/**
 * Full sync: pushes everything from the static website datasets
 * (src/data/catalog.ts, src/data/tools.ts, src/data/learnTasks.ts)
 * into the Supabase database so the admin dashboard matches the website.
 *
 * Run: bun run scripts/sync-catalog.ts
 */
import { createClient } from "@supabase/supabase-js";
import { catalog } from "../src/data/catalog";
import { tools as curatedTools, categories as curatedCats } from "../src/data/tools";
import { learnTasks } from "../src/data/learnTasks";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) { console.error("Missing SUPABASE env"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "item";

async function chunkUpsert(table: string, rows: any[], onConflict: string) {
  const size = 200;
  for (let i = 0; i < rows.length; i += size) {
    const slice = rows.slice(i, i + size);
    const { error } = await sb.from(table).upsert(slice, { onConflict });
    if (error) { console.error(`upsert ${table} failed`, error.message); throw error; }
  }
}

async function main() {
  // ── Categories: merge catalog + curated ─────────────────────────────
  const catMap = new Map<string, any>();
  for (const c of curatedCats) {
    catMap.set(c.slug, { slug: c.slug, name: c.name, description: c.description, sort_order: catMap.size });
  }
  for (const c of catalog) {
    if (!catMap.has(c.slug)) {
      catMap.set(c.slug, { slug: c.slug, name: c.name, description: c.short, sort_order: catMap.size });
    }
  }
  const cats = [...catMap.values()];
  await chunkUpsert("categories", cats, "slug");
  console.log(`✓ categories: ${cats.length}`);

  // ── Subcategories from catalog ──────────────────────────────────────
  const subs: any[] = [];
  for (const c of catalog) {
    c.subs.forEach((s, i) => {
      subs.push({
        category_slug: c.slug,
        slug: s.slug,
        name: s.name,
        sort_order: i,
      });
    });
  }
  await chunkUpsert("subcategories", subs, "category_slug,slug");
  console.log(`✓ subcategories: ${subs.length}`);

  // ── Tools: curated first (rich metadata), then catalog fill-in ──────
  const toolMap = new Map<string, any>();
  curatedTools.forEach((t, i) => {
    toolMap.set(t.slug, {
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      description: t.description,
      url: t.website,
      logo_url: t.simpleIcon
        ? `https://cdn.simpleicons.org/${t.simpleIcon}/${t.brandColor.replace("#", "")}`
        : null,
      category: t.category,
      subcategory: null,
      pricing: t.pricing,
      tags: t.tags ?? [],
      featured: !!t.trending,
      sort_order: i,
    });
  });

  let order = curatedTools.length;
  for (const c of catalog) {
    for (const s of c.subs) {
      for (const t of s.tools) {
        const slug = slugify(t.name);
        if (toolMap.has(slug)) {
          // enrich existing row with subcategory if missing
          const existing = toolMap.get(slug);
          if (!existing.subcategory) existing.subcategory = s.slug;
          continue;
        }
        toolMap.set(slug, {
          slug,
          name: t.name,
          tagline: null,
          description: null,
          url: t.website,
          logo_url: null,
          category: c.slug,
          subcategory: s.slug,
          pricing: null,
          tags: [],
          featured: false,
          sort_order: order++,
        });
      }
    }
  }
  const toolRows = [...toolMap.values()];
  await chunkUpsert("tools", toolRows, "slug");
  console.log(`✓ tools: ${toolRows.length}`);

  // ── Learn tasks (spin/swipe/scratch) ────────────────────────────────
  const learnRows = learnTasks.map((t, i) => ({
    slug: t.id,
    kind: "any" as const,
    title: t.title,
    tagline: t.tagline,
    category: t.category,
    difficulty: t.difficulty,
    minutes: t.minutes,
    tool_name: t.tool.name,
    tool_url: t.tool.website,
    prompt: t.prompt,
    steps: t.steps ?? [],
    cover_url: t.cover,
    reference_url: t.reference.url,
    reference_caption: t.reference.caption,
    sort_order: i,
  }));
  await chunkUpsert("learn_tasks", learnRows, "slug");
  console.log(`✓ learn_tasks: ${learnRows.length}`);

  console.log("\nDone. Refresh /admin to see the synced content.");
}

main().catch((e) => { console.error(e); process.exit(1); });
