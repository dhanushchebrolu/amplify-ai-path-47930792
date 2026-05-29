import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";
import { listLearnTasks, upsertLearnTask, deleteLearnTask } from "@/lib/content.functions";

export const Route = createFileRoute("/_admin/admin/learn-tasks")({
  component: LearnTasksAdmin,
});

function LearnTasksAdmin() {
  return (
    <CrudPage
      title="Learn tasks"
      queryKey="admin-learn"
      listFn={() => listLearnTasks()}
      upsertFn={upsertLearnTask as any}
      deleteFn={deleteLearnTask as any}
      emptyValues={{ slug: "", kind: "any", title: "", steps: [], sort_order: 0, minutes: 5 } as any}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug (lowercase, dashes)", required: true },
        { name: "kind", label: "Where to show", type: "select", options: ["any", "spin", "swipe", "scratch"] },
        { name: "tagline", label: "Tagline" },
        { name: "category", label: "Category" },
        { name: "difficulty", label: "Difficulty (Beginner/Intermediate/Pro)" },
        { name: "minutes", label: "Minutes", type: "number" },
        { name: "tool_name", label: "Tool name" },
        { name: "tool_url", label: "Tool URL", type: "url" },
        { name: "prompt", label: "Prompt", type: "textarea" },
        { name: "steps", label: "Steps (one per line)", type: "steps" },
        { name: "cover_url", label: "Cover image URL", type: "url" },
        { name: "reference_url", label: "Reference image URL", type: "url" },
        { name: "reference_caption", label: "Reference caption" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
      renderRow={(t) => (
        <div className="flex items-center gap-3">
          {t.cover_url && <img src={t.cover_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
          <div className="min-w-0">
            <div className="font-medium truncate">{t.title}</div>
            <div className="text-xs text-muted-foreground truncate">{t.kind} · {t.category}</div>
          </div>
        </div>
      )}
    />
  );
}
