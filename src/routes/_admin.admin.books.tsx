import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";
import { listBooks, upsertBook, deleteBook } from "@/lib/content.functions";

export const Route = createFileRoute("/_admin/admin/books")({
  component: BooksAdmin,
});

function BooksAdmin() {
  return (
    <CrudPage
      title="Books"
      queryKey="admin-books"
      listFn={() => listBooks()}
      upsertFn={upsertBook as any}
      deleteFn={deleteBook as any}
      emptyValues={{ slug: "", title: "", affiliate_url: "", tags: [], featured: false, sort_order: 0 } as any}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug (lowercase, dashes)", required: true },
        { name: "author", label: "Author" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "cover_url", label: "Cover image", type: "image", imageFolder: "books" },
        { name: "affiliate_url", label: "Affiliate URL (where people buy)", type: "url", required: true },
        { name: "price_label", label: "Price label (e.g. $19, Free)" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "featured", label: "Featured", type: "boolean" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
      renderRow={(b) => (
        <div className="flex items-center gap-3">
          {b.cover_url && <img src={b.cover_url} alt="" className="w-10 h-14 rounded object-cover" />}
          <div className="min-w-0">
            <div className="font-medium truncate">{b.title}</div>
            <div className="text-xs text-muted-foreground truncate">{b.author} · {b.price_label}</div>
          </div>
        </div>
      )}
    />
  );
}
