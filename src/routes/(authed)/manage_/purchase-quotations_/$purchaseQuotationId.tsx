import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { purchaseQuotationQueryOptions } from "@/features/purchase-quotations/api/options"
import { PurchaseQuotationDetailPage } from "@/features/purchase-quotations/pages/PurchaseQuotationDetailPage"

// No `validateSearch` — the page has a single always-visible section (no `?tab=`) and its
// items table isn't paginated (a quotation's line count is small and comes back in one
// response), same as purchase-requests_/$purchaseRequestId.tsx.
export const Route = createFileRoute(
  "/(authed)/manage_/purchase-quotations_/$purchaseQuotationId"
)({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      purchaseQuotationQueryOptions(params.purchaseQuotationId)
    ),
  component: PurchaseQuotationDetailPage,
  pendingComponent: LayoutPagePending,
})
