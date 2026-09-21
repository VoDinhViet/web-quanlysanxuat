import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { purchaseQuotationsQueryOptions } from "@/features/purchase-quotations/api/options"
import { PurchaseQuotationsPage } from "@/features/purchase-quotations/pages/PurchaseQuotationsPage"
import { purchaseQuotationsSearchSchema } from "@/features/purchase-quotations/schemas/purchase-quotations-search.schema"

export const Route = createFileRoute("/(authed)/manage_/purchase-quotations/")({
  validateSearch: purchaseQuotationsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which would
  // re-trigger this loader and blank the outlet. The list itself is read client-side in
  // PurchaseQuotationsPage via useQuery instead.
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...purchaseQuotationsQueryOptions(
        purchaseQuotationsSearchSchema.parse(location.search)
      ),
      staleTime: "static",
    }),
  component: PurchaseQuotationsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
