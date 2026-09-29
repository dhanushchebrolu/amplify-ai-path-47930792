import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/admin/reset-password",
      });
      if (error) throw error;
      setSent(true);
      toast.success("If an account exists for that email, a reset link has been sent.");
    } catch (err: any) {
      // Don't leak whether the email exists
      setSent(true);
      toast.success("If an account exists for that email, a reset link has been sent.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md card-surface rounded-2xl border border-foreground/10 p-8">
        <h1 className="font-display text-3xl">Reset password</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your admin email and we'll send you a secure reset link.
        </p>

        {sent ? (
          <div className="mt-6 text-sm text-muted-foreground">
            <p>Check your inbox for the reset link. It expires shortly for your security.</p>
            <Link to="/admin/login" className="inline-block mt-4 text-foreground hover:underline">
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              <input
                type="email" required placeholder="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25"
              />
              <button disabled={loading} type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <Link to="/admin/login" className="block mt-4 text-xs text-muted-foreground hover:text-foreground">
              ← Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
