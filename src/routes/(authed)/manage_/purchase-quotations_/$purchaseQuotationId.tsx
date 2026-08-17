import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { purchaseQuotationQueryOptions } from "@/features/purchase-quotations/api/options"
import { PurchaseQuotationDetailPage } from "@/features/purchase-quotations/pages/PurchaseQuotationDetailPage"

// No `validateSearch` — the page has a single always-visible section (no `?tab=`) and its
// items table isn't paginated (a quotation's line count is small and comes back in one
// response), same as purchase-requests_/$purchaseRequestId.tsx.
export const Route = createFileRoute(
  "/(authed)/manage_/purchase-quotations_/$purchaseQuotationId"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "purchasing:read"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      purchaseQuotationQueryOptions(params.purchaseQuotationId)
    ),
  component: PurchaseQuotationDetailPage,
  pendingComponent: PageLoading,
})
