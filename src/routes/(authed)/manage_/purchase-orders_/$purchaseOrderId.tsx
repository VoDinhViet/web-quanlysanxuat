import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/feedback/LayoutPagePending"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api/options"
import { PurchaseOrderDetailPage } from "@/features/purchase-orders/pages/PurchaseOrderDetailPage"

// No `validateSearch` — a single always-visible section, items table isn't paginated, same as
// purchase-quotations_/$purchaseQuotationId.tsx / purchase-requests_/$purchaseRequestId.tsx.
export const Route = createFileRoute(
  "/(authed)/manage_/purchase-orders_/$purchaseOrderId"
)({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      purchaseOrderQueryOptions(params.purchaseOrderId)
    ),
  component: PurchaseOrderDetailPage,
  pendingComponent: LayoutPagePending,
})
