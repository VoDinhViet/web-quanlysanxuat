import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { OrdersPage } from "@/features/orders/pages/OrdersPage"
import {
  orderStatsQueryOptions,
  ordersQueryOptions,
} from "@/features/orders/api/options"
import { ordersSearchSchema } from "@/features/orders/schemas/orders-search.schema"

export const Route = createFileRoute("/(authed)/manage_/orders/")({
  validateSearch: ordersSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and blank the outlet). The list
  // itself is read client-side in OrdersPage via useQuery instead.
  // `location.search` is already the router-validated search at runtime, but
  // LoaderFnContext types it as `{}` (loaderDeps-independent) — re-parsing it
  // is a type-safe way to recover the real shape, not an `as` cast.
  loader: ({ context, location }) => {
    // Stats are a secondary block on this page (OrderStatCards) — seed the
    // cache without blocking the route/table on it.
    void context.queryClient.prefetchQuery(orderStatsQueryOptions())

    return context.queryClient.ensureQueryData(
      ordersQueryOptions(ordersSearchSchema.parse(location.search))
    )
  },
  component: OrdersPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
