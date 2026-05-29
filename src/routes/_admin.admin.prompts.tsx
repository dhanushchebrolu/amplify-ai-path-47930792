import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";
import { listPrompts, upsertPrompt, deletePrompt } from "@/lib/content.functions";

export const Route = createFileRoute("/_admin/admin/prompts")({
  component: PromptsAdmin,
});

function PromptsAdmin() {
  return (
    <CrudPage
      title="Prompts"
      queryKey="admin-prompts"
      listFn={() => listPrompts()}
      upsertFn={upsertPrompt as any}
      deleteFn={deletePrompt as any}
      emptyValues={{ title: "", body: "", tags: [], sort_order: 0 } as any}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "body", label: "Prompt text", type: "textarea", required: true },
        { name: "category", label: "Category (Image/Writing/Video/Coding/Audio/Design/Productivity)" },
        { name: "tool_name", label: "Recommended tool name" },
        { name: "tool_url", label: "Tool URL", type: "url" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
      renderRow={(p) => (
        <div>
          <div className="font-medium truncate">{p.title}</div>
          <div className="text-xs text-muted-foreground truncate">{p.category} · {p.tool_name}</div>
        </div>
      )}
    />
  );
}
