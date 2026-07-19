import { QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Data stays fresh for 1 min so navigating back to a list doesn't
        // refetch; entity writes force a refetch via `invalidateQueries`.
        staleTime: 60_000,
        // Server functions already throw clean Vietnamese messages — one retry
        // is enough, don't hammer a failing backend.
        retry: 1,
      },
    },
  })

  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    context: { queryClient },
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
