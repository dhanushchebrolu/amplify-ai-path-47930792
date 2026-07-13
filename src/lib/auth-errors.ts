// Map Supabase auth errors to friendly user-facing messages.
export function friendlyAuthError(err: unknown): string {
  const raw = (err as any)?.message?.toString?.() ?? "";
  const code = (err as any)?.code?.toString?.() ?? "";
  const status = (err as any)?.status;
  const m = raw.toLowerCase();

  if (!raw && !code) return "Something went wrong. Please try again.";

  if (code === "invalid_credentials" || m.includes("invalid login credentials")) {
    return "Wrong email or password.";
  }
  if (code === "email_not_confirmed" || m.includes("email not confirmed")) {
    return "Please verify your email address first. Check your inbox for the confirmation link.";
  }
  if (code === "user_already_exists" || m.includes("already registered") || m.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (code === "weak_password" || m.includes("password should be at least")) {
    return "Password is too weak. Use at least 8 characters with a mix of letters and numbers.";
  }
  if (code === "over_email_send_rate_limit" || m.includes("rate limit")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (code === "signup_disabled" || m.includes("signups not allowed")) {
    return "New account signups are currently disabled.";
  }
  if (m.includes("invalid email") || m.includes("email address is invalid")) {
    return "That email address isn't valid.";
  }
  if (m.includes("network") || m.includes("failed to fetch")) {
    return "Network error. Check your connection and try again.";
  }
  if (status === 500 || m.includes("database error")) {
    return "Server error. Please try again in a moment.";
  }
  return raw || "Sign in failed. Please try again.";
}
