import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";
import { listAllBlogPosts, upsertBlogPost, deleteBlogPost } from "@/lib/content.functions";

export const Route = createFileRoute("/_admin/admin/blog")({
  component: BlogAdmin,
});

function BlogAdmin() {
  return (
    <CrudPage
      title="Blog posts"
      queryKey="admin-blog"
      listFn={() => listAllBlogPosts()}
      upsertFn={upsertBlogPost as any}
      deleteFn={deleteBlogPost as any}
      emptyValues={{
        slug: "", title: "", excerpt: "", body: "", content_html: "",
        tags: [], published: false, sort_order: 0,
        seo_title: "", seo_description: "", focus_keyword: "",
      } as any}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug (lowercase, dashes)", required: true },
        { name: "excerpt", label: "Excerpt (short summary, shown in listings)", type: "textarea" },
        { name: "content_html", label: "Content (HTML — paste from ChatGPT/Claude, or write visually)", type: "html" },
        { name: "body", label: "Legacy body (Markdown — used only if HTML is empty)", type: "markdown" },
        { name: "cover_url", label: "Cover image", type: "image", imageFolder: "blog" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "published", label: "Published (visible on /blog)", type: "boolean" },
        { name: "published_at", label: "Published at (ISO timestamp, optional)" },
        { name: "sort_order", label: "Sort order", type: "number" },

        // SEO group
        { name: "seo_title", label: "SEO title (50–60 chars)", type: "seo-title" },
        { name: "seo_description", label: "SEO description (150–160 chars)", type: "seo-description" },
        { name: "focus_keyword", label: "Focus keyword" },
        { name: "canonical_url", label: "Canonical URL (optional override)", type: "url" },

        // Social
        { name: "og_title", label: "Open Graph title" },
        { name: "og_description", label: "Open Graph description", type: "textarea" },
        { name: "og_image", label: "Open Graph image", type: "image", imageFolder: "blog" },
        { name: "twitter_title", label: "Twitter title" },
        { name: "twitter_description", label: "Twitter description", type: "textarea" },
        { name: "twitter_image", label: "Twitter image", type: "image", imageFolder: "blog" },
      ]}
      renderRow={(p) => (
        <div className="flex items-center gap-3">
          {p.cover_url && <img src={p.cover_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
          <div className="min-w-0">
            <div className="font-medium truncate">{p.title} {!p.published && <span className="text-xs text-muted-foreground">(draft)</span>}</div>
            <div className="text-xs text-muted-foreground truncate">{p.slug}</div>
          </div>
        </div>
      )}
    />
  );
}
