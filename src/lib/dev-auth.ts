// Development-only local authentication.
//
// SECURITY: Every export is gated by `import.meta.env.DEV`. In a production
// build Vite statically replaces this to `false`, so every helper short-circuits
// and the bundle is stripped by dead-code elimination. Do NOT reference these
// helpers from code paths that must run in production.

const SESSION_KEY = "dev-admin-session-v1";

// Shared token echoed to the server so the dev bypass in auth-middleware.ts
// only trusts requests originating from *this* dev build. Also injected as
// DEV_ADMIN_BYPASS_TOKEN on the server side (same value).
export const DEV_BYPASS_TOKEN =
  (import.meta.env.VITE_DEV_ADMIN_BYPASS_TOKEN as string | undefined) ??
  "local-dev-bypass";

const DEV_EMAIL =
  (import.meta.env.VITE_DEV_ADMIN_EMAIL as string | undefined) ??
  "admin@localhost";
const DEV_PASSWORD =
  (import.meta.env.VITE_DEV_ADMIN_PASSWORD as string | undefined) ??
  "Admin@123";

export function isDevAuthEnabled(): boolean {
  return !!import.meta.env.DEV;
}

export type DevAdminSession = {
  id: "local-admin";
  email: string;
  role: "admin";
  name: "Local Admin";
  issuedAt: number;
};

export function getDevSession(): DevAdminSession | null {
  if (!isDevAuthEnabled()) return null;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DevAdminSession;
    if (parsed?.id !== "local-admin") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function devSignIn(email: string, password: string): DevAdminSession {
  if (!isDevAuthEnabled()) throw new Error("Dev auth disabled");
  if (email.trim().toLowerCase() !== DEV_EMAIL.toLowerCase() || password !== DEV_PASSWORD) {
    throw new Error("Incorrect email or password.");
  }
  const session: DevAdminSession = {
    id: "local-admin",
    email: DEV_EMAIL,
    role: "admin",
    name: "Local Admin",
    issuedAt: Date.now(),
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function devSignOut(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function logDevAuthBanner(): void {
  if (!isDevAuthEnabled()) return;
  if (typeof window === "undefined") return;
  // eslint-disable-next-line no-console
  console.warn(
    "%c⚠ Development Authentication Enabled",
    "background:#facc15;color:#000;padding:2px 6px;border-radius:4px;font-weight:600;",
    `\nEmail: ${DEV_EMAIL}  |  Local-only session — never available in production.`,
  );
}
