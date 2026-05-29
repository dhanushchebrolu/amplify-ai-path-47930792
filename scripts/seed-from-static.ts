/**
 * Seeds the Supabase tables (tools, prompts, learn_tasks) from the static
 * data files (src/data/tools.ts, src/data/learnTasks.ts).
 *
 * Run: bun run scripts/seed-from-static.ts
 *
 * Idempotent: uses upsert on slug/title so reruns refresh rows.
 */
import { createClient } from "@supabase/supabase-js";
import { tools as staticTools } from "../src/data/tools";
import { learnTasks as staticLearn } from "../src/data/learnTasks";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function seedTools() {
  const rows = staticTools.map((t, i) => ({
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    description: t.description,
    url: t.website,
    logo_url: t.simpleIcon ? `https://cdn.simpleicons.org/${t.simpleIcon}/${t.brandColor.replace("#", "")}` : null,
    category: t.category,
    subcategory: null,
    pricing: t.pricing,
    tags: t.tags ?? [],
    featured: !!t.trending,
    sort_order: i,
  }));
  const { error } = await sb.from("tools").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✓ Seeded ${rows.length} tools`);
}

async function seedLearnTasks() {
  const rows = staticLearn.map((t, i) => ({
    slug: t.id,
    kind: "any",
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
  const { error } = await sb.from("learn_tasks").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✓ Seeded ${rows.length} learn tasks`);
}

async function seedPrompts() {
  // Reuse learn tasks as a prompt library seed (matches what /prompts shows today).
  const rows = staticLearn.map((t, i) => ({
    title: t.title,
    body: t.prompt,
    category: t.category,
    tool_name: t.tool.name,
    tool_url: t.tool.website,
    tags: [t.category, t.difficulty],
    sort_order: i,
  }));
  // No natural unique key, so wipe + insert for idempotency.
  await sb.from("prompts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await sb.from("prompts").insert(rows);
  if (error) throw error;
  console.log(`✓ Seeded ${rows.length} prompts`);
}

async function main() {
  // Check slug uniqueness exists on tools/learn_tasks; if not, fall back to delete-all + insert.
  try {
    await seedTools();
  } catch (e: any) {
    if (String(e.message).includes("no unique or exclusion constraint")) {
      console.log("  → tools.slug not unique; wiping and re-inserting");
      await sb.from("tools").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await sb.from("tools").insert(staticTools.map((t, i) => ({
        slug: t.slug, name: t.name, tagline: t.tagline, description: t.description,
        url: t.website,
        logo_url: t.simpleIcon ? `https://cdn.simpleicons.org/${t.simpleIcon}/${t.brandColor.replace("#", "")}` : null,
        category: t.category, pricing: t.pricing, tags: t.tags ?? [],
        featured: !!t.trending, sort_order: i,
      })));
      console.log(`✓ Seeded ${staticTools.length} tools (wipe+insert)`);
    } else throw e;
  }
  try {
    await seedLearnTasks();
  } catch (e: any) {
    if (String(e.message).includes("no unique or exclusion constraint")) {
      console.log("  → learn_tasks.slug not unique; wiping and re-inserting");
      await sb.from("learn_tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await sb.from("learn_tasks").insert(staticLearn.map((t, i) => ({
        slug: t.id, kind: "any", title: t.title, tagline: t.tagline,
        category: t.category, difficulty: t.difficulty, minutes: t.minutes,
        tool_name: t.tool.name, tool_url: t.tool.website, prompt: t.prompt,
        steps: t.steps ?? [], cover_url: t.cover,
        reference_url: t.reference.url, reference_caption: t.reference.caption,
        sort_order: i,
      })));
      console.log(`✓ Seeded ${staticLearn.length} learn tasks (wipe+insert)`);
    } else throw e;
  }
  await seedPrompts();
  console.log("\nAll done. Refresh /admin to see the seeded content.");
}

main().catch((e) => { console.error(e); process.exit(1); });
