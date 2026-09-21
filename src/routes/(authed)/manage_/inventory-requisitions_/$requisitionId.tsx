import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { inventoryRequisitionQueryOptions } from "@/features/inventory-requisitions/api/options"
import { InventoryRequisitionDetailPage } from "@/features/inventory-requisitions/pages/InventoryRequisitionDetailPage"

// No `validateSearch` — the page has a single always-visible section (no `?tab=`) and its
// items table isn't paginated (a requisition's line count is small and comes back in one
// response), same as purchase-quotations_/$purchaseQuotationId.tsx.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-requisitions_/$requisitionId"
)({
  loader: ({ context, params }) =>
    context.queryClient.query({
      ...inventoryRequisitionQueryOptions(params.requisitionId),
      staleTime: "static",
    }),
  component: InventoryRequisitionDetailPage,
  pendingComponent: LayoutPagePending,
})
