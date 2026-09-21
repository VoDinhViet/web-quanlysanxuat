import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { purchaseRequestQueryOptions } from "@/features/purchase-requests/api/options"
import { PurchaseRequestDetailPage } from "@/features/purchase-requests/pages/PurchaseRequestDetailPage"

// No `validateSearch` — the page has a single always-visible section (no `?tab=`) and its items
// table isn't paginated (a request's line count is small and comes back in one response).
export const Route = createFileRoute(
  "/(authed)/manage_/purchase-requests_/$purchaseRequestId"
)({
  loader: ({ context, params }) =>
    context.queryClient.query({
      ...purchaseRequestQueryOptions(params.purchaseRequestId),
      staleTime: "static",
    }),
  component: PurchaseRequestDetailPage,
  pendingComponent: LayoutPagePending,
})
