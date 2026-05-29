import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";
import { listTools, upsertTool, deleteTool } from "@/lib/content.functions";

export const Route = createFileRoute("/_admin/admin/tools")({
  component: ToolsAdmin,
});

function ToolsAdmin() {
  return (
    <CrudPage
      title="Tools"
      queryKey="admin-tools"
      listFn={() => listTools()}
      upsertFn={upsertTool as any}
      deleteFn={deleteTool as any}
      emptyValues={{ slug: "", name: "", url: "", tags: [], featured: false, sort_order: 0 } as any}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug (lowercase, dashes)", required: true },
        { name: "url", label: "Website URL", type: "url", required: true },
        { name: "logo_url", label: "Logo URL", type: "url" },
        { name: "tagline", label: "Tagline" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "category", label: "Category" },
        { name: "subcategory", label: "Subcategory" },
        { name: "pricing", label: "Pricing (Free/Freemium/Paid)" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
      renderRow={(t) => (
        <div className="flex items-center gap-3">
          {t.logo_url && <img src={t.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
          <div className="min-w-0">
            <div className="font-medium truncate">{t.name}</div>
            <div className="text-xs text-muted-foreground truncate">{t.category} · {t.url}</div>
          </div>
        </div>
      )}
    />
  );
}
