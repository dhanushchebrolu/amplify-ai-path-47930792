// Client-side startup health check for the auth subsystem.
// Emits console warnings in development only. No user-visible UI, no network calls.

export function runAuthHealthCheck() {
  if (typeof window === "undefined") return;
  if (!import.meta.env.DEV) return;

  const issues: string[] = [];

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url) issues.push("VITE_SUPABASE_URL is not set");
  if (!key) issues.push("VITE_SUPABASE_PUBLISHABLE_KEY is not set");

  if (url && !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)) {
    issues.push(`VITE_SUPABASE_URL looks unusual: ${url}`);
  }

  try {
    if (!window.localStorage) issues.push("localStorage unavailable — Supabase session cannot persist");
  } catch {
    issues.push("localStorage is blocked — Supabase session cannot persist");
  }

  const origin = window.location.origin;
  const expectedRedirects = [
    `${origin}/admin`,
    `${origin}/admin/reset-password`,
    `${origin}/admin/accept-invitation`,
  ];

  if (issues.length) {
    // eslint-disable-next-line no-console
    console.warn(
      "[auth-health] Issues detected:\n  - " + issues.join("\n  - ") +
      "\nEnsure these redirect URLs are allow-listed in Supabase → Authentication → URL Configuration:\n  - " +
      expectedRedirects.join("\n  - "),
    );
  } else {
    // eslint-disable-next-line no-console
    console.info("[auth-health] Auth environment OK. Ensure Supabase allow-list includes:", expectedRedirects);
  }
}
