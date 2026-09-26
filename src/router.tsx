import { QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { DefaultCatchBoundary } from "@/components/shared/primitives/DefaultCatchBoundary"
import { DefaultNotFound } from "@/components/shared/primitives/DefaultNotFound"
import { LoadingScreen } from "@/components/shared/primitives/LoadingScreen"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Three freshness tiers. This is the default one: data is fresh for 30s, so going back to
        // a page just visited reuses the cache instead of refetching; older data is served
        // instantly and revalidated in the background. Reference lists (units, clients, ...)
        // override it upward with a literal 5–15 min `staleTime`; fast-moving screens (stock,
        // production execution) override it to 0. Every mutation invalidates the feature roots
        // it affects, so the user's own writes are never hidden behind this window.
        staleTime: 30_000,
        // Longer than the 5 min default so back/forward navigation still finds the cache.
        // Always >= staleTime.
        gcTime: 15 * 60_000,
        refetchOnMount: true,
        refetchOnReconnect: true,
        // Server functions already throw clean Vietnamese messages — one retry
        // is enough, don't hammer a failing backend.
        retry: 1,
        // Internal ERP: users alt-tab constantly, and every return would fire
        // a refetch per stale query. The one query that must poll on focus
        // (use-session-watchdog.ts) declares refetchOnWindowFocus itself.
        refetchOnWindowFocus: false,
      },
    },
  })

  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultStaleTime: 0,
    // React Query owns freshness — without this the router keeps preloaded
    // loader results fresh for 30s and skips the loader on a repeat hover.
    defaultPreloadStaleTime: 0,
    // Keeps selector results referentially stable (`useSearch({ select })`
    // etc.) — off by default for backwards compat, expected to flip in v2.
    defaultStructuralSharing: true,
    // Loaders block navigation — show the shared spinner while a route loads.
    defaultPendingComponent: LoadingScreen,
    // Routes outside (authed) have no boundary of their own — without these
    // they'd fall through to the router's built-in English fallbacks.
    // (authed)/route.tsx keeps its own errorComponent, which still wins.
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: DefaultNotFound,
    context: { queryClient },
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    handleRedirects: true,
    wrapQueryClient: true,
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
