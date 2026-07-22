import { QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
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
    // Loaders block navigation — show the shared spinner while a route loads.
    defaultPendingComponent: LoadingScreen,
    // Only show it after 200ms so fast (preloaded) navigations don't flash it...
    defaultPendingMs: 200,
    // ...and once shown, keep it up for at least 500ms to avoid a flicker.
    defaultPendingMinMs: 500,
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
