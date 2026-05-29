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
      emptyValues={{ slug: "", title: "", excerpt: "", body: "", tags: [], published: false, sort_order: 0 } as any}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug (lowercase, dashes)", required: true },
        { name: "excerpt", label: "Excerpt (short summary)", type: "textarea" },
        { name: "body", label: "Body (Markdown supported)", type: "textarea" },
        { name: "cover_url", label: "Cover image", type: "image", imageFolder: "blog" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "published", label: "Published (visible on /blog)", type: "boolean" },
        { name: "published_at", label: "Published at (ISO timestamp, optional)" },
        { name: "sort_order", label: "Sort order", type: "number" },
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
