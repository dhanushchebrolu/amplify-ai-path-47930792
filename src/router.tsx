import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { GenericPagePending } from "@/components/skeletons";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    trailingSlash: "never",
    defaultPreloadStaleTime: 30_000,
    defaultPendingComponent: GenericPagePending,
    defaultPendingMs: 200,
    defaultPendingMinMs: 400,
  });

  return router;
};

