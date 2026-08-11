import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api/options"
import { PurchaseOrderDetailPage } from "@/features/purchase-orders/pages/PurchaseOrderDetailPage"

// No `validateSearch` — a single always-visible section, items table isn't paginated, same as
// purchase-quotations_/$purchaseQuotationId.tsx / purchase-requests_/$purchaseRequestId.tsx.
export const Route = createFileRoute(
  "/(authed)/manage_/purchase-orders_/$purchaseOrderId"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "purchasing:read"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      purchaseOrderQueryOptions(params.purchaseOrderId)
    ),
  component: PurchaseOrderDetailPage,
  pendingComponent: PageLoading,
})
