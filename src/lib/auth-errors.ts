// Central mapping from raw Supabase auth errors to user-friendly messages.
// Never surface raw error strings — they leak backend details and confuse users.

export type AuthErrorContext =
  | "signin"
  | "signup"
  | "oauth"
  | "reset-request"
  | "reset-update"
  | "session";

export function friendlyAuthError(err: unknown, ctx: AuthErrorContext = "signin"): string {
  const raw = String((err as any)?.message ?? err ?? "").toLowerCase();
  const status = (err as any)?.status as number | undefined;

  if (!raw) return defaultFor(ctx);

  // Network / transport
  if (raw.includes("failed to fetch") || raw.includes("network") || raw.includes("networkerror")) {
    return "Network error. Check your connection and try again.";
  }
  if (raw.includes("timeout") || raw.includes("timed out")) {
    return "The request timed out. Please try again.";
  }

  // Rate limiting
  if (status === 429 || raw.includes("rate limit") || raw.includes("too many")) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  // Credentials
  if (raw.includes("invalid login credentials") || raw.includes("invalid credentials")) {
    return "Incorrect email or password. If you were invited, open your invitation link first to set a password.";
  }
  if (raw.includes("user not found") || raw.includes("no user found")) {
    return "No account found for that email address.";
  }

  // Email state
  if (raw.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (raw.includes("email already registered") || raw.includes("already been registered") || raw.includes("user already registered")) {
    return "That email is already registered. Try signing in instead.";
  }

  // Account state
  if (raw.includes("user is disabled") || raw.includes("banned") || raw.includes("user is banned")) {
    return "This account has been disabled. Contact the site owner.";
  }

  // Password rules
  if (raw.includes("password should be at least") || raw.includes("weak password") || raw.includes("password is too short")) {
    return "Password is too weak. Use at least 8 characters with a mix of letters and numbers.";
  }
  if (raw.includes("same password") || raw.includes("new password should be different")) {
    return "Your new password must be different from the current one.";
  }

  // Recovery / reset link
  if (raw.includes("token has expired") || raw.includes("expired") && ctx === "reset-update") {
    return "This reset link has expired. Request a new one.";
  }
  if (raw.includes("invalid token") || raw.includes("token is invalid") || (raw.includes("otp") && raw.includes("expired"))) {
    return "This reset link is invalid or has already been used. Request a new one.";
  }

  // Session
  if (raw.includes("jwt expired") || raw.includes("session_not_found") || raw.includes("session expired")) {
    return "Your session has expired. Please sign in again.";
  }
  if (raw.includes("no authorization") || raw.includes("unauthorized") || status === 401) {
    return ctx === "session"
      ? "Your session has expired. Please sign in again."
      : "You aren't authorized to perform this action.";
  }

  // OAuth
  if (ctx === "oauth") {
    if (raw.includes("popup") || raw.includes("closed")) return "Google sign-in was cancelled.";
    if (raw.includes("redirect")) return "Google sign-in failed: redirect URL not allowed. Contact the site owner.";
    return "Google sign-in failed. Please try again.";
  }

  return defaultFor(ctx);
}

function defaultFor(ctx: AuthErrorContext): string {
  switch (ctx) {
    case "signup": return "Could not create your account. Please try again.";
    case "oauth": return "Google sign-in failed. Please try again.";
    case "reset-request": return "Could not send the reset email. Please try again.";
    case "reset-update": return "Could not update your password. Please try again.";
    case "session": return "There was a problem with your session. Please sign in again.";
    default: return "Sign in failed. Please try again.";
  }
}
