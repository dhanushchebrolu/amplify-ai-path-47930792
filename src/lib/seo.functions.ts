import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  kind: z.enum(["category", "subcategory", "tool"]),
  slugPath: z.string().min(1).max(300),
});

export type SeoLongFormSection = { heading: string; body: string };
export type SeoFaq = { q: string; a: string };
export type SeoComparisonRow = { tool: string; strengths: string; weaknesses: string; ideal_for: string; pricing: string };

export type SeoLongForm = {
  h1?: string;
  intro?: string; // 1–3 paragraphs, separated by \n\n
  sections?: SeoLongFormSection[];
  faqs?: SeoFaq[];
  buying_guide?: string;
  comparison?: SeoComparisonRow[];
  conclusion?: string;
  related?: { label: string; href: string }[];
};

export type SeoContentRow = {
  kind: "category" | "subcategory" | "tool";
  slug_path: string;
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  long_form: SeoLongForm | null;
  structured_data: Record<string, unknown>[] | null;
};

export const getSeoContent = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data }): Promise<SeoContentRow | null> => {
    const { getPublicSupabase } = await import("./public-supabase.server");
    const { data: row, error } = await getPublicSupabase()
      .from("seo_content" as any)
      .select(
        "kind, slug_path, seo_title, seo_description, og_title, og_description, twitter_title, twitter_description, long_form, structured_data",
      )
      .eq("kind", data.kind)
      .eq("slug_path", data.slugPath)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as SeoContentRow | null) ?? null;
  });
