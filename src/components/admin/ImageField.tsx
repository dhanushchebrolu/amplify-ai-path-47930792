import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ImageField({
  value,
  onChange,
  folder = "misc",
  label = "Image URL",
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("content-images").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("content-images").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          type="url"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="Paste URL or upload below"
          className="flex-1 px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-foreground/10 text-sm hover:border-foreground/25 disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Upload"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="p-2 rounded-lg border border-foreground/10 hover:bg-red-500/10 text-red-400" aria-label="Clear">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {value && (
        <img src={value} alt="" className="mt-2 max-h-32 rounded-lg border border-foreground/10 object-contain" />
      )}
    </div>
  );
}
