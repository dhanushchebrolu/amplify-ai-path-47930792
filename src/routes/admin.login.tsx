import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { devSignIn, getDevSession, isDevAuthEnabled, logDevAuthBanner } from "@/lib/dev-auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const devMode = isDevAuthEnabled();
  const [email, setEmail] = useState(devMode ? "admin@localhost" : "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (devMode) {
      logDevAuthBanner();
      if (getDevSession()) navigate({ to: "/admin" });
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/admin" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
    return () => subscription.unsubscribe();
  }, [navigate, devMode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (devMode) {
        devSignIn(email, password);
        navigate({ to: "/admin" });
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      if (devMode) {
        toast.error("Incorrect email or password.");
      } else {
        const { friendlyAuthError } = await import("@/lib/auth-errors");
        toast.error(friendlyAuthError(err, "signin"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    // /admin/callback verifies admin access server-side (checkAdmin) and signs
    // out non-admin accounts. This URL must be in the Supabase Auth redirect
    // allow-list.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin/callback` },
    });
    if (error) {
      const { friendlyAuthError } = await import("@/lib/auth-errors");
      toast.error(friendlyAuthError(error, "oauth"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md card-surface rounded-2xl border border-foreground/10 p-8">
        {devMode && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-[11px] font-medium text-yellow-300">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            Development Mode
          </div>
        )}
        <h1 className="font-display text-3xl">Admin sign in</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {devMode
            ? "Local development login. Use the DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD credentials."
            : "Admin access is invitation-only. If you received an invitation link, open it directly to accept."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="email" required placeholder="email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required minLength={8} placeholder="password"
              autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-foreground/5"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button disabled={loading} type="submit"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {loading ? "..." : "Sign in"}
          </button>
        </form>

        {!devMode && (
          <>
            <div className="mt-3 text-right">
              <Link to="/admin/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                Forgot password?
              </Link>
            </div>

            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px bg-foreground/10 flex-1" /> or <div className="h-px bg-foreground/10 flex-1" />
            </div>

            <button onClick={onGoogle} disabled={loading}
              className="w-full py-2.5 rounded-lg border border-foreground/15 text-sm hover:bg-foreground/5 disabled:opacity-50">
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
