import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { OrdersPage } from "@/features/orders/pages/OrdersPage"
import {
  orderStatsQueryOptions,
  ordersQueryOptions,
} from "@/features/orders/api/options"
import { ordersSearchSchema } from "@/features/orders/schemas/orders-search.schema"

export const Route = createFileRoute("/(authed)/manage_/orders")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "orders:read"),
  validateSearch: ordersSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and the router's
  // defaultPendingComponent, blanking the whole page). The list itself is
  // read client-side in OrdersPage via useQuery instead. `location.search` is
  // already the router-validated search at runtime, but LoaderFnContext types
  // it as `{}` (loaderDeps-independent) — re-parsing it is a type-safe way to
  // recover the real shape, not an `as` cast.
  loader: ({ context, location }) => {
    // Stats are a secondary block on this page (OrderStatCards) — seed the
    // cache without blocking the route/table on it.
    void context.queryClient.prefetchQuery(orderStatsQueryOptions())

    return context.queryClient.ensureQueryData(
      ordersQueryOptions(ordersSearchSchema.parse(location.search))
    )
  },
  component: OrdersPage,
  pendingComponent: PageLoading,
})
