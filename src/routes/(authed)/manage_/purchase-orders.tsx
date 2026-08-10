import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { purchaseOrdersQueryOptions } from "@/features/purchase-orders/api/options"
import { PurchaseOrdersPage } from "@/features/purchase-orders/pages/PurchaseOrdersPage"
import { purchaseOrdersSearchSchema } from "@/features/purchase-orders/schemas/purchase-orders-search.schema"

export const Route = createFileRoute("/(authed)/manage_/purchase-orders")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "purchasing:read"),
  validateSearch: purchaseOrdersSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which would
  // re-trigger this loader and blank the whole page. The list itself is read client-side in
  // PurchaseOrdersPage via useQuery instead.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      purchaseOrdersQueryOptions(
        purchaseOrdersSearchSchema.parse(location.search)
      )
    ),
  component: PurchaseOrdersPage,
  pendingComponent: PageLoading,
})
