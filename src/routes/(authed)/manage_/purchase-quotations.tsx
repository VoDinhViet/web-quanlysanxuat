import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { purchaseQuotationsQueryOptions } from "@/features/purchase-quotations/api/options"
import { PurchaseQuotationsPage } from "@/features/purchase-quotations/pages/PurchaseQuotationsPage"
import { purchaseQuotationsSearchSchema } from "@/features/purchase-quotations/schemas/purchase-quotations-search.schema"

export const Route = createFileRoute("/(authed)/manage_/purchase-quotations")({
  validateSearch: purchaseQuotationsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which would
  // re-trigger this loader and blank the whole page. The list itself is read client-side in
  // PurchaseQuotationsPage via useQuery instead.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      purchaseQuotationsQueryOptions(
        purchaseQuotationsSearchSchema.parse(location.search)
      )
    ),
  component: PurchaseQuotationsPage,
  pendingComponent: PageLoading,
})
