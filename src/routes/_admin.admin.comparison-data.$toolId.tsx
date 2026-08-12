import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getComparisonAdmin, upsertComparisonAdmin } from "@/lib/compare.functions";
import { inferDraftProfile } from "@/lib/compare-inference";
import { ArrowLeft, Save, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/comparison-data/$toolId")({
  component: ComparisonEditor,
});

type Verification = "draft" | "needs_review" | "verified";

type ToolMeta = { id: string; slug: string; name: string; logo_url: string | null; category: string | null };
type FormState = {
  company: string;
  website: string;
  launch_year: string;
  status: "draft" | "published";
  verification_status: Verification;
  verification_note: string;
  source_url: string;
  open_source: boolean;
  api_available: boolean;
  pricing: string;
  models: string;
  features: string;
  platforms: string;
  languages: string;
  integrations: string;
  use_cases: string;
  limitations: string;
  pros: string;
  cons: string;
  media: string;
};

const empty: FormState = {
  company: "",
  website: "",
  launch_year: "",
  status: "draft",
  verification_status: "draft",
  verification_note: "",
  source_url: "",
  open_source: false,
  api_available: false,
  pricing: "",
  models: "",
  features: "",
  platforms: "",
  languages: "",
  integrations: "",
  use_cases: "",
  limitations: "",
  pros: "",
  cons: "",
  media: "",
};


function parseJson(s: string, fallback: unknown = {}): unknown {
  const t = s.trim();
  if (!t) return fallback;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

function splitLines(s: string): string[] {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function isJsonEmpty(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  try {
    const v = JSON.parse(t);
    if (v == null) return true;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "object") {
      const obj = v as Record<string, unknown>;
      if (Array.isArray(obj.items)) return (obj.items as unknown[]).length === 0;
      return Object.keys(obj).length === 0;
    }
    return false;
  } catch {
    return false;
  }
}

function ComparisonEditor() {
  const { toolId } = Route.useParams();
  const navigate = useNavigate();
  const getFn = useServerFn(getComparisonAdmin);
  const saveFn = useServerFn(upsertComparisonAdmin);
  const [tool, setTool] = useState<ToolMeta | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    getFn({ data: { toolId } }).then((res: any) => {
      setTool(res.tool);
      const d = res.data;
      setForm({
        company: d?.company ?? "",
        website: d?.website ?? res.tool?.url ?? "",
        launch_year: d?.launch_year ? String(d.launch_year) : "",
        status: (d?.status === "published" ? "published" : "draft"),
        verification_status: (["draft", "needs_review", "verified"].includes(d?.verification_status)
          ? d.verification_status
          : "draft") as Verification,
        verification_note: d?.verification_note ?? "",
        source_url: d?.source_url ?? "",

        open_source: !!d?.open_source,
        api_available: !!d?.api_available,
        pricing: JSON.stringify(d?.pricing ?? {}, null, 2),
        models: JSON.stringify(d?.models ?? {}, null, 2),
        features: JSON.stringify(d?.features ?? {}, null, 2),
        platforms: JSON.stringify(d?.platforms ?? {}, null, 2),
        languages: JSON.stringify(d?.languages ?? {}, null, 2),
        integrations: JSON.stringify(d?.integrations ?? {}, null, 2),
        use_cases: (d?.use_cases ?? []).join("\n"),
        limitations: JSON.stringify(d?.limitations ?? {}, null, 2),
        pros: (d?.pros ?? []).join("\n"),
        cons: (d?.cons ?? []).join("\n"),
        media: JSON.stringify(d?.media ?? {}, null, 2),
      });
      setLoading(false);
    });
  }, [getFn, toolId]);


  async function save(_verification?: Verification) {
    const next: Verification = "verified";
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        toolId,
        company: form.company || null,
        website: form.website || null,
        launch_year: form.launch_year ? parseInt(form.launch_year, 10) : null,
        status: "published" as const,
        verification_status: next,
        verification_note: form.verification_note || null,
        source_url: form.source_url || null,
        open_source: form.open_source,
        api_available: form.api_available,
        pricing: (parseJson(form.pricing) ?? {}) as Record<string, unknown>,
        models: (parseJson(form.models) ?? {}) as Record<string, unknown>,
        features: (parseJson(form.features) ?? {}) as Record<string, unknown>,
        platforms: (parseJson(form.platforms) ?? {}) as Record<string, unknown>,
        languages: (parseJson(form.languages) ?? {}) as Record<string, unknown>,
        integrations: (parseJson(form.integrations) ?? {}) as Record<string, unknown>,
        use_cases: splitLines(form.use_cases),
        limitations: (parseJson(form.limitations) ?? {}) as Record<string, unknown>,
        pros: splitLines(form.pros),
        cons: splitLines(form.cons),
        media: (parseJson(form.media) ?? {}) as Record<string, unknown>,
        seo: {},
        metadata: {},
      };
      await saveFn({ data: payload });
      setForm((f) => ({ ...f, status: payload.status, verification_status: next }));
      setMsg("Saved & live ✓");
    } catch (e: any) {
      setMsg(`Error: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  }

  function generateFromInference(overwrite = false) {
    if (!tool) return;
    const inferred = inferDraftProfile(tool as unknown as import("@/lib/compare.functions").CompareTool);
    setForm((f) => {
      const keep = <T,>(cur: T, isEmpty: boolean, next: T): T => (overwrite || isEmpty ? next : cur);
      return {
        ...f,
        company: keep(f.company, !f.company.trim(), inferred.company ?? ""),
        website: keep(f.website, !f.website.trim(), inferred.website ?? ""),
        open_source: overwrite ? inferred.open_source : f.open_source || inferred.open_source,
        api_available: overwrite ? inferred.api_available : f.api_available || inferred.api_available,
        pricing: keep(f.pricing, isJsonEmpty(f.pricing), JSON.stringify(inferred.pricing ?? {}, null, 2)),
        models: keep(f.models, isJsonEmpty(f.models), JSON.stringify(inferred.models ?? {}, null, 2)),
        features: keep(f.features, isJsonEmpty(f.features), JSON.stringify(inferred.features ?? {}, null, 2)),
        platforms: keep(f.platforms, isJsonEmpty(f.platforms), JSON.stringify(inferred.platforms ?? {}, null, 2)),
        languages: keep(f.languages, isJsonEmpty(f.languages), JSON.stringify(inferred.languages ?? {}, null, 2)),
        integrations: keep(f.integrations, isJsonEmpty(f.integrations), JSON.stringify(inferred.integrations ?? {}, null, 2)),
        use_cases: keep(f.use_cases, !f.use_cases.trim(), (inferred.use_cases ?? []).join("\n")),
        pros: keep(f.pros, !f.pros.trim(), (inferred.pros ?? []).join("\n")),
        cons: keep(f.cons, !f.cons.trim(), (inferred.cons ?? []).join("\n")),
        limitations: keep(f.limitations, isJsonEmpty(f.limitations), JSON.stringify(inferred.limitations ?? {}, null, 2)),
      };
    });
    setMsg("Draft suggestions filled in — review every field before verifying. Nothing here is published yet.");
  }


  if (loading) return <div className="text-muted-foreground">Loading…</div>;
  if (!tool) return <div>Tool not found</div>;

  return (
    <div className="max-w-4xl">
      <Link to="/admin/comparison-data" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> Back
      </Link>

      <div className="flex items-center gap-4 mt-2 mb-6">
        {tool.logo_url && <img src={tool.logo_url} alt="" className="w-10 h-10 rounded-lg" />}
        <div className="flex-1">
          <h1 className="font-display text-2xl">{tool.name}</h1>
          <div className="text-xs text-muted-foreground">
            {tool.slug} · {tool.category || "no category"}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => generateFromInference(false)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary px-3 py-1.5 text-xs hover:bg-primary/20"
            title="Fill empty fields with editable draft suggestions — nothing is published"
          >
            <Sparkles className="w-3.5 h-3.5" /> Autofill from directory
          </button>
          <button
            onClick={() => {
              if (confirm("Refill empty fields suggestions for empty fields? Filled fields are kept.")) generateFromInference(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs hover:bg-white/[0.08]"
          >
            Refill empty fields
          </button>

        </div>
      </div>
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-sm font-semibold mb-2">Editorial notes</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Everything you save here is published immediately and overrides the auto-generated profile.
          Leave a field empty and it stays hidden on the public page — never guessed.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Text
            label="Source URL (optional)"
            value={form.source_url}
            onChange={(v) => setForm((f) => ({ ...f, source_url: v }))}
          />
          <Text
            label="Internal note (optional)"
            value={form.verification_note}
            onChange={(v) => setForm((f) => ({ ...f, verification_note: v }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Text label="Company" value={form.company} onChange={(v) => setForm((f) => ({ ...f, company: v }))} />
        <Text label="Website" value={form.website} onChange={(v) => setForm((f) => ({ ...f, website: v }))} />
        <Text label="Launch year" value={form.launch_year} onChange={(v) => setForm((f) => ({ ...f, launch_year: v }))} />
        <div className="flex gap-4 items-end">
          <Bool label="Open source" value={form.open_source} onChange={(v) => setForm((f) => ({ ...f, open_source: v }))} />
          <Bool label="API available" value={form.api_available} onChange={(v) => setForm((f) => ({ ...f, api_available: v }))} />
        </div>
      </div>

      <Section title="Pricing" hint='JSON. Example: {"starting_at":19,"tiers":[{"name":"Free","price":0},{"name":"Pro","price":19}]}'>
        <JsonArea value={form.pricing} onChange={(v) => setForm((f) => ({ ...f, pricing: v }))} />
      </Section>

      <Section title="AI Models" hint='JSON. Example: {"items":["GPT-4o","Claude 3.5 Sonnet","Gemini 1.5 Pro"]}'>
        <JsonArea value={form.models} onChange={(v) => setForm((f) => ({ ...f, models: v }))} />
      </Section>

      <Section title="Core features" hint='JSON key/value. Example: {"file_uploads":true,"vision":true,"web_browse":false}'>
        <JsonArea value={form.features} onChange={(v) => setForm((f) => ({ ...f, features: v }))} />
      </Section>

      <Section title="Platforms" hint='JSON. Example: {"items":["Web","macOS","Windows","iOS","Android"]}'>
        <JsonArea value={form.platforms} onChange={(v) => setForm((f) => ({ ...f, platforms: v }))} />
      </Section>

      <Section title="Languages" hint='JSON. Example: {"items":["English","Spanish","Japanese"]}'>
        <JsonArea value={form.languages} onChange={(v) => setForm((f) => ({ ...f, languages: v }))} />
      </Section>

      <Section title="Integrations" hint='JSON. Example: {"items":["Slack","Zapier","GitHub"]}'>
        <JsonArea value={form.integrations} onChange={(v) => setForm((f) => ({ ...f, integrations: v }))} />
      </Section>

      <Section title="Use cases" hint="One per line">
        <TextArea value={form.use_cases} onChange={(v) => setForm((f) => ({ ...f, use_cases: v }))} />
      </Section>

      <Section title="Pros" hint="One per line">
        <TextArea value={form.pros} onChange={(v) => setForm((f) => ({ ...f, pros: v }))} />
      </Section>

      <Section title="Cons" hint="One per line">
        <TextArea value={form.cons} onChange={(v) => setForm((f) => ({ ...f, cons: v }))} />
      </Section>

      <Section title="Limitations" hint='JSON. Example: {"items":["No offline mode","Rate limits"]}'>
        <JsonArea value={form.limitations} onChange={(v) => setForm((f) => ({ ...f, limitations: v }))} />
      </Section>

      <Section title="Media (screenshots, video)" hint='JSON. Example: {"screenshots":["https://…"],"video":"https://…"}'>
        <JsonArea value={form.media} onChange={(v) => setForm((f) => ({ ...f, media: v }))} />
      </Section>

      <div className="sticky bottom-4 mt-8 flex items-center gap-3 justify-end bg-background/80 backdrop-blur border border-white/10 rounded-2xl p-3">
        {msg && <span className="text-xs text-muted-foreground mr-auto">{msg}</span>}
        <button
          onClick={() => save()}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-semibold disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" /> Save changes
        </button>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="flex items-baseline gap-2 mb-1.5">
        <label className="text-sm font-medium">{title}</label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}
function Bool({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
function TextArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={5}
      className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm outline-none font-mono"
    />
  );
}
function JsonArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const valid = !value.trim() || (() => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  })();
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className={`w-full rounded-lg bg-white/[0.04] border px-3 py-2 text-xs outline-none font-mono ${
          valid ? "border-white/10" : "border-rose-400/50"
        }`}
      />
      {!valid && <div className="text-[10px] text-rose-400 mt-1">Invalid JSON</div>}
    </div>
  );
}
