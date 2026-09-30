import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/Analytics";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI Blaze – Discover & Compare the Best AI Tools, Prompts & AI Blogs" },
      { name: "description", content: "Discover the world's leading AI tools, curated prompts, and expert AI blogs in one trusted platform. Compare features, explore the latest innovations, and stay ahead with AI Blaze." },
      { name: "author", content: "AI Blaze" },
      { name: "theme-color", content: "#ffffff" },
      { property: "og:site_name", content: "AI Blaze" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@aiblaze" },
      { property: "og:image", content: "https://aiblaze.io/og-default.png" },
      { property: "og:image:width", content: "1536" },
      { property: "og:image:height", content: "1024" },
      { name: "twitter:image", content: "https://aiblaze.io/og-default.png" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:title", content: "AI Blaze – Discover & Compare the Best AI Tools, Prompts & AI Blogs" },
      { name: "twitter:title", content: "AI Blaze – Discover & Compare the Best AI Tools, Prompts & AI Blogs" },
      { property: "og:description", content: "Discover the world's leading AI tools, curated prompts, and expert AI blogs in one trusted platform. Compare features, explore the latest innovations, and stay ahead with AI Blaze." },
      { name: "twitter:description", content: "Discover the world's leading AI tools, curated prompts, and expert AI blogs in one trusted platform. Compare features, explore the latest innovations, and stay ahead with AI Blaze." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-64.png", type: "image/png", sizes: "64x64" },
      { rel: "icon", href: "/favicon.png", type: "image/png", sizes: "512x512" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "alternate", type: "application/rss+xml", href: "https://aiblaze.io/rss.xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://vcijromdouxsymmglrha.supabase.co" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&display=swap",
      },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AI Blaze",
          url: "https://aiblaze.io",
          email: "aiblaze.io@gmail.com",
          description: "The curated directory of AI tools, prompts, and tutorials.",
          logo: {
            "@type": "ImageObject",
            url: "https://aiblaze.io/logo.png",
            width: 512,
            height: 512,
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AI Blaze",
          url: "https://aiblaze.io",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://aiblaze.io/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    // Development-only environment sanity check.
    import("@/lib/auth-health").then((m) => m.runAuthHealthCheck()).catch(() => {});

    // On first mount, honor pending OAuth trampoline even if the session was
    // already restored before we mounted (INITIAL_SESSION already fired).
    try {
      const target = sessionStorage.getItem("post_oauth_redirect");
      if (target) {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            sessionStorage.removeItem("post_oauth_redirect");
            if (window.location.pathname !== target) {
              window.location.replace(target);
            }
          }
        });
      }
    } catch {}

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Filter noisy events to avoid thrashing router/query cache.
      if (
        event !== "SIGNED_IN" &&
        event !== "SIGNED_OUT" &&
        event !== "USER_UPDATED" &&
        event !== "PASSWORD_RECOVERY"
      ) {
        return;
      }

      // Password recovery: Supabase fires this after the reset link exchanges
      // a session. Route the user to the dedicated reset page regardless of
      // where the email link dropped them (Site URL fallback in dashboard).
      if (event === "PASSWORD_RECOVERY") {
        if (window.location.pathname !== "/admin/reset-password") {
          window.location.replace("/admin/reset-password");
        }
        return;
      }

      // Post-OAuth trampoline: broker forces redirect_uri to the bare origin,
      // so /admin/login stores the intended destination in sessionStorage and
      // we forward once the SIGNED_IN event lands.
      if (event === "SIGNED_IN" && session) {
        try {
          const target = sessionStorage.getItem("post_oauth_redirect");
          if (target) {
            sessionStorage.removeItem("post_oauth_redirect");
            if (window.location.pathname !== target) {
              window.location.replace(target);
              return;
            }
          }
        } catch {}
      }

      router.invalidate();
      // Do NOT invalidate queries on SIGNED_OUT — refetching against a cleared
      // session storms the app with 401s. The sign-out handler clears the cache.
      if (event !== "SIGNED_OUT") qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <Analytics />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
