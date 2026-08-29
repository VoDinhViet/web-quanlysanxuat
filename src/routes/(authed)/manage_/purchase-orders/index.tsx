import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { purchaseOrdersQueryOptions } from "@/features/purchase-orders/api/options"
import { PurchaseOrdersPage } from "@/features/purchase-orders/pages/PurchaseOrdersPage"
import { purchaseOrdersSearchSchema } from "@/features/purchase-orders/schemas/purchase-orders-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/purchase-orders/")({
  validateSearch: purchaseOrdersSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which would
  // re-trigger this loader and blank the outlet. The list itself is read client-side in
  // PurchaseOrdersPage via useQuery instead.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        purchaseOrdersQueryOptions(
          purchaseOrdersSearchSchema.parse(location.search)
        )
      ),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: PurchaseOrdersPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
