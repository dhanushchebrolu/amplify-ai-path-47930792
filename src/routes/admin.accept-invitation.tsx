import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { acceptAdminInvitation } from "@/lib/admins.functions";
import { toast } from "sonner";

const searchSchema = z.object({ token: z.string().uuid().optional() });

export const Route = createFileRoute("/admin/accept-invitation")({
  validateSearch: (s) => searchSchema.parse(s),
  component: AcceptInvitation,
});

function AcceptInvitation() {
  const { token } = useSearch({ from: "/admin/accept-invitation" });
  const navigate = useNavigate();
  const accept = useServerFn(acceptAdminInvitation);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => subscription.unsubscribe();
  }, []);

  async function doAccept() {
    if (!token) {
      toast.error("Missing invitation token");
      return;
    }
    setLoading(true);
    try {
      await accept({ data: { token } });
      toast.success("You are now an admin");
      navigate({ to: "/admin" });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed && token) doAccept();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="font-display text-3xl">Invalid invitation</h1>
          <p className="text-muted-foreground mt-2 text-sm">This link is missing or malformed.</p>
          <Link to="/admin/login" className="mt-6 inline-block text-sm underline">Go to admin sign in</Link>
        </div>
      </div>
    );
  }

  if (authed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Accepting invitation…
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.href },
        });
        if (error) throw error;
        toast.success("Account created. If email confirmation is required, confirm then return here.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      toast.error(e.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    // Return to this page (token included) so the invitation is accepted once
    // the session lands. The URL must be in the Supabase Auth redirect allow-list.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (error) {
      toast.error(error.message ?? "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md card-surface rounded-2xl border border-foreground/10 p-8">
        <h1 className="font-display text-3xl">You're invited</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in or create an account with the email address that received this invitation to gain admin access.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="email" required placeholder="email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25"
          />
          <input
            type="password" required minLength={8} placeholder="password (min 8 chars)"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25"
          />
          <button disabled={loading} type="submit"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
            {loading ? "..." : mode === "signin" ? "Sign in & accept" : "Create account & accept"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px bg-foreground/10 flex-1" /> or <div className="h-px bg-foreground/10 flex-1" />
        </div>

        <button onClick={onGoogle} disabled={loading}
          className="w-full py-2.5 rounded-lg border border-foreground/15 text-sm hover:bg-foreground/5 disabled:opacity-50">
          Continue with Google
        </button>

        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "New here? Create an account →" : "Already have an account? Sign in →"}
        </button>
      </div>
    </div>
  );
}
