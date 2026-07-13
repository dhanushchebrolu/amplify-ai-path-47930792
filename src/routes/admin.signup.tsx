import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { friendlyAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/admin/signup")({
  component: AdminSignup,
});

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"] as const;
  const colors = ["bg-red-500/60", "bg-red-500/60", "bg-yellow-500/60", "bg-blue-500/60", "bg-green-500/60"];
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score], color: colors[score] };
}

function AdminSignup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = passwordStrength(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    if (strength.score < 2) {
      toast.error("Please choose a stronger password (8+ chars, mixed case, numbers).");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/admin/login",
          data: { full_name: fullName },
        },
      });
      if (error) throw error;

      // If email confirmation is disabled and a session is returned,
      // the user is signed in immediately. Route them through the callback
      // so the role check happens the same way as OAuth.
      if (data.session) {
        toast.success("Account created!");
        navigate({ to: "/admin/callback" });
        return;
      }

      setDone(true);
      toast.success("Account created. Check your email to verify, then sign in.");
    } catch (err: any) {
      toast.error(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md card-surface rounded-2xl border border-white/10 p-8">
        <h1 className="font-display text-3xl">Create account</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign up to access AI Blaze. New accounts start with standard access.
        </p>

        {done ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.04] border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                We've sent a confirmation link to <span className="text-foreground">{email}</span>. Verify your email, then sign in.
              </div>
            </div>
            <Link
              to="/admin/login"
              className="block w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium text-center hover:opacity-90"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              <input
                type="text" required placeholder="Full name" autoComplete="name"
                value={fullName} onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25 disabled:opacity-50"
              />
              <input
                type="email" required placeholder="Email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25 disabled:opacity-50"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required minLength={8} placeholder="Password"
                  autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25 disabled:opacity-50"
                />
                <button
                  type="button" onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"} tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-white/5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="space-y-1">
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full transition-all ${strength.color}`}
                      style={{ width: `${(strength.score / 4) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{strength.label}</div>
                </div>
              )}

              <input
                type={showPassword ? "text" : "password"}
                required minLength={8} placeholder="Confirm password"
                autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-white/25 disabled:opacity-50"
              />
              {confirm && confirm !== password && (
                <p className="text-xs text-red-400">Passwords don't match.</p>
              )}

              <button disabled={loading} type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Creating…" : "Create Account"}
              </button>
            </form>

            <Link
              to="/admin/login"
              className="block mt-4 text-xs text-center text-muted-foreground hover:text-foreground"
            >
              ← Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
