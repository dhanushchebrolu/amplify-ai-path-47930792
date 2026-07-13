import { createFileRoute, redirect } from "@tanstack/react-router";

// The dedicated Browse landing page has been removed — the homepage now serves
// as the category explorer. Any inbound traffic to /browse is redirected home.
export const Route = createFileRoute("/browse")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
  component: () => null,
});
