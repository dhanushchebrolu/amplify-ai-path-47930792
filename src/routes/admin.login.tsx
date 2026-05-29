import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/admin" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" });
    if (res.error) {
      toast.error(res.error.message ?? "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md card-surface rounded-2xl border border-white/10 p-8">
        <h1 className="font-display text-3xl">Admin sign in</h1>
        <p className="text-sm text-muted-foreground mt-2">
          The <strong>first account</strong> to sign up here becomes the sole admin. After that, signups have no dashboard access.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input type="email" required placeholder="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25" />
          <input type="password" required minLength={8} placeholder="password (min 8 chars)"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25" />
          <button disabled={loading} type="submit"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {loading ? "..." : mode === "signin" ? "Sign in" : "Create admin account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px bg-white/10 flex-1" /> or <div className="h-px bg-white/10 flex-1" />
        </div>

        <button onClick={onGoogle} disabled={loading}
          className="w-full py-2.5 rounded-lg border border-white/15 text-sm hover:bg-white/5 disabled:opacity-50">
          Continue with Google
        </button>

        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "First time? Create the admin account →" : "Already have an account? Sign in →"}
        </button>
      </div>
    </div>
  );
}
