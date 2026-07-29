import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { productionOrdersQueryOptions } from "@/features/production-orders/api/production-orders.options"
import { ProductionOrdersPage } from "@/features/production-orders/pages/ProductionOrdersPage"
import { productionOrdersSearchSchema } from "@/features/production-orders/schemas/production-orders-search.schema"

export const Route = createFileRoute("/(authed)/manage_/production-orders")({
  // The LSX queue reads order data — there is no backend permission of its own
  // yet, so `orders:read` is the honest gate. Swap in a dedicated permission if
  // the backend ever ships one.
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "orders:read"),
  validateSearch: productionOrdersSearchSchema,
  // No loaderDeps: see orders.tsx for why — a filter/pagination navigation must
  // not create a new route match, which would re-trigger this loader and blank
  // the whole page. The list itself is read client-side in
  // ProductionOrdersPage via useQuery instead.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      productionOrdersQueryOptions(
        productionOrdersSearchSchema.parse(location.search)
      )
    ),
  component: ProductionOrdersPage,
})
