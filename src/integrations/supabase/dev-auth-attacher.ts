// Dev-only client middleware. In production builds `import.meta.env.DEV` is
// statically `false`, so the header is never attached and the whole branch is
// dead-code eliminated.
import { createMiddleware } from "@tanstack/react-start";
import { DEV_BYPASS_TOKEN, getDevSession, isDevAuthEnabled } from "@/lib/dev-auth";

export const attachDevAdminBypass = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    if (!isDevAuthEnabled()) return next({});
    const session = getDevSession();
    if (!session) return next({});
    return next({
      headers: {
        "x-dev-admin-bypass": DEV_BYPASS_TOKEN,
        "x-dev-admin-email": session.email,
      },
    });
  },
);
