import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { checkAdmin } from "@/lib/content.functions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/callback")({
  component: AdminCallback,
});

function AdminCallback() {
  const navigate = useNavigate();
  const check = useServerFn(checkAdmin);
  const handled = useRef(false);

  useEffect(() => {
    async function decide(hasSession: boolean) {
      if (handled.current) return;
      handled.current = true;

      if (!hasSession) {
        toast.error("Sign-in didn't complete. Please try again.");
        navigate({ to: "/admin/login" });
        return;
      }

      try {
        const res = await check();
        if (res.isAdmin) {
          navigate({ to: "/admin" });
        } else {
          toast.error("Access denied: this account isn't an admin.");
          await supabase.auth.signOut();
          navigate({ to: "/" });
        }
      } catch {
        toast.error("Couldn't verify your account. Please try again.");
        navigate({ to: "/admin/login" });
      }
    }

    // Check current session first
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) decide(true);
    });

    // Also listen — OAuth callback typically fires SIGNED_IN shortly after mount
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) decide(true);
    });

    // Safety timeout — if nothing happens in 6s, assume failure
    const timeout = setTimeout(() => {
      if (!handled.current) decide(false);
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [check, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
        <p className="mt-4 text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
