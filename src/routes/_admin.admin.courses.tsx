import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";
import { listCourses, upsertCourse, deleteCourse } from "@/lib/content.functions";

export const Route = createFileRoute("/_admin/admin/courses")({
  component: CoursesAdmin,
});

function CoursesAdmin() {
  return (
    <CrudPage
      title="Courses"
      queryKey="admin-courses"
      listFn={() => listCourses()}
      upsertFn={upsertCourse as any}
      deleteFn={deleteCourse as any}
      emptyValues={{ slug: "", title: "", affiliate_url: "", tags: [], featured: false, sort_order: 0 } as any}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug (lowercase, dashes)", required: true },
        { name: "provider", label: "Provider (Coursera, Udemy, etc.)" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "cover_url", label: "Cover image", type: "image", imageFolder: "courses" },
        { name: "affiliate_url", label: "Affiliate URL (where people enroll)", type: "url", required: true },
        { name: "price_label", label: "Price label (e.g. $49, Free)" },
        { name: "level", label: "Level (Beginner/Intermediate/Pro)" },
        { name: "duration", label: "Duration (e.g. 6h, 3 weeks)" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "featured", label: "Featured", type: "boolean" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
      renderRow={(c) => (
        <div className="flex items-center gap-3">
          {c.cover_url && <img src={c.cover_url} alt="" className="w-14 h-10 rounded object-cover" />}
          <div className="min-w-0">
            <div className="font-medium truncate">{c.title}</div>
            <div className="text-xs text-muted-foreground truncate">{c.provider} · {c.level} · {c.price_label}</div>
          </div>
        </div>
      )}
    />
  );
}
