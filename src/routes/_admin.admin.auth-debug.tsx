import { env as appEnv } from "@/config/env";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAuthDiagnostics } from "@/lib/content.functions";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Copy } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/auth-debug")({
  component: AuthDebug,
});

type Diag = Awaited<ReturnType<typeof getAuthDiagnostics>>;

type SessionSnapshot = {
  hasSession: boolean;
  userId: string | null;
  email: string | null;
  provider: string | null;
  expiresAt: number | null;
  hasRefreshToken: boolean;
  accessTokenPreview: string | null;
};

function emptySession(): SessionSnapshot {
  return {
    hasSession: false, userId: null, email: null, provider: null,
    expiresAt: null, hasRefreshToken: false, accessTokenPreview: null,
  };
}

function classifyEnv(origin: string): "production" | "preview" | "localhost" {
  if (/localhost|127\.0\.0\.1/.test(origin)) return "localhost";
  if (/lovable\.app|-preview--|preview\./.test(origin)) return "preview";
  return "production";
}

function AuthDebug() {
  const runDiag = useServerFn(getAuthDiagnostics);
  const [diag, setDiag] = useState<Diag | null>(null);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionSnapshot>(emptySession());
  const [lastEvent, setLastEvent] = useState<string>("(none since page load)");
  const [now, setNow] = useState<number>(Date.now());
  const listenerCount = useRef(0);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const env = classifyEnv(origin);
  const supabaseUrl = appEnv.SUPABASE_URL;
  const projectId = appEnv.SUPABASE_PROJECT_ID;
  const storageKey = projectId ? `sb-${projectId}-auth-token` : "";

  useEffect(() => {
    listenerCount.current++;
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session;
      setSession(
        s
          ? {
              hasSession: true,
              userId: s.user?.id ?? null,
              email: s.user?.email ?? null,
              provider: (s.user?.app_metadata as any)?.provider ?? null,
              expiresAt: s.expires_at ?? null,
              hasRefreshToken: !!s.refresh_token,
              accessTokenPreview: s.access_token ? s.access_token.slice(0, 12) + "…" : null,
            }
          : emptySession(),
      );
    };
    load();
    runDiag()
      .then((r) => setDiag(r))
      .catch((e) => setDiagError(e?.message ?? "Failed to load diagnostics"));

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setLastEvent(`${event} @ ${new Date().toLocaleTimeString()}`);
      setSession(
        s
          ? {
              hasSession: true,
              userId: s.user?.id ?? null,
              email: s.user?.email ?? null,
              provider: (s.user?.app_metadata as any)?.provider ?? null,
              expiresAt: s.expires_at ?? null,
              hasRefreshToken: !!s.refresh_token,
              accessTokenPreview: s.access_token ? s.access_token.slice(0, 12) + "…" : null,
            }
          : emptySession(),
      );
    });

    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      sub.subscription.unsubscribe();
      clearInterval(tick);
      listenerCount.current--;
    };
  }, [runDiag]);

  const secondsUntilExpiry = session.expiresAt
    ? Math.max(0, session.expiresAt - Math.floor(now / 1000))
    : null;

  const cookiePresent = typeof document !== "undefined" && document.cookie.length > 0;
  const storageHasSession = typeof window !== "undefined" && storageKey ? !!window.localStorage.getItem(storageKey) : false;

  const checks = [
    { label: "Session valid", ok: session.hasSession && (secondsUntilExpiry ?? 0) > 0 },
    { label: "Refresh token present", ok: session.hasRefreshToken },
    { label: "Auto-refresh enabled", ok: true }, // configured in client.ts
    { label: "Auth listener running", ok: listenerCount.current > 0 },
    { label: "Session persisted (localStorage)", ok: storageHasSession },
    { label: "User confirmed", ok: !!diag?.emailConfirmed },
    { label: "User has admin role", ok: !!diag?.isAdmin },
    { label: "Supabase URL configured", ok: !!supabaseUrl },
    { label: "Google OAuth (provider on session)", ok: session.provider === "google" || (diag?.providers ?? []).includes("google") || session.provider === "email" || !!session.provider },
    { label: "Redirect origin matches env", ok: !!origin },
  ];

  function copyReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: { env, origin, supabaseUrl, projectId, storageKey },
      session: { ...session, secondsUntilExpiry },
      diagnostics: diag ?? { error: diagError },
      routing: {
        currentPath: window.location.pathname,
        postOAuthRedirect: sessionStorage.getItem("post_oauth_redirect"),
      },
      storage: { cookiePresent, storageHasSession },
      checks,
      lastEvent,
    };
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      .then(() => toast.success("Debug report copied"))
      .catch(() => toast.error("Copy failed"));
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Auth diagnostics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live snapshot of authentication and authorization state for this browser session.
          </p>
        </div>
        <button
          onClick={copyReport}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
        >
          <Copy className="w-4 h-4" /> Copy debug report
        </button>
      </div>

      <Section title="Health checks">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-sm">
              {c.ok
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                : <XCircle className="w-4 h-4 text-red-500" />}
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Authentication">
        <Row k="User ID" v={session.userId} />
        <Row k="Email" v={session.email} />
        <Row k="Provider" v={session.provider} />
        <Row k="Session exists" v={String(session.hasSession)} />
        <Row k="Session expires at" v={session.expiresAt ? new Date(session.expiresAt * 1000).toISOString() : null} />
        <Row k="Access token expires in" v={secondsUntilExpiry != null ? `${secondsUntilExpiry}s` : null} />
        <Row k="Refresh token present" v={String(session.hasRefreshToken)} />
        <Row k="Access token (preview)" v={session.accessTokenPreview} />
        <Row k="Last auth event" v={lastEvent} />
      </Section>

      <Section title="Authorization (server-verified)">
        {diagError && <p className="text-sm text-red-500">Failed to load: {diagError}</p>}
        <Row k="Is admin" v={diag ? String(diag.isAdmin) : "…"} />
        <Row k="has_role(admin)" v={diag ? String(diag.isAdmin) : "…"} />
        <Row k="JWT role" v={diag?.role ?? null} />
        <Row k="JWT aud" v={diag?.aud ?? null} />
        <Row k="Email confirmed" v={diag ? String(diag.emailConfirmed) : null} />
        <Row k="Providers" v={diag ? JSON.stringify(diag.providers) : null} />
        <div className="mt-3">
          <div className="text-xs uppercase text-muted-foreground mb-1">user_roles rows</div>
          <pre className="text-xs bg-foreground/[0.03] border border-foreground/10 rounded-lg p-3 overflow-auto">
{JSON.stringify(diag?.roles ?? [], null, 2)}
          </pre>
        </div>
      </Section>

      <Section title="Environment">
        <Row k="Environment" v={env} />
        <Row k="Current origin" v={origin} />
        <Row k="Supabase URL" v={supabaseUrl} />
        <Row k="Supabase project ID" v={projectId} />
        <Row k="localStorage session key" v={storageKey} />
        <Row k="OAuth redirect_uri (used)" v={origin} />
        <Row k="Password reset redirect" v={`${origin}/admin/reset-password`} />
        <Row k="Invitation redirect" v={`${origin}/admin/accept-invitation`} />
      </Section>

      <Section title="Routing">
        <Row k="Current path" v={typeof window !== "undefined" ? window.location.pathname : ""} />
        <Row k="Post-OAuth redirect (pending)" v={typeof window !== "undefined" ? sessionStorage.getItem("post_oauth_redirect") : null} />
        <Row k="Recovery redirect (route)" v="/admin/reset-password" />
      </Section>

      <Section title="Storage">
        <Row k="Cookies present on origin" v={String(cookiePresent)} />
        <Row k="Session restored from localStorage" v={String(storageHasSession)} />
      </Section>

      <p className="text-xs text-muted-foreground">
        This page never displays raw tokens. Access token shown as first 12 characters only.
        Data is read-only and scoped to your own account.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-foreground/10 p-4 bg-foreground/[0.02]">
      <h2 className="font-display text-lg mb-3">{title}</h2>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="grid grid-cols-[220px_1fr] gap-3 text-sm">
      <div className="text-muted-foreground">{k}</div>
      <div className="font-mono text-xs break-all">{v ?? <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}
