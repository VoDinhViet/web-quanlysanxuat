import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { purchaseLedgerQueryOptions } from "@/features/purchase-ledger/api/options"
import { PurchaseLedgerPage } from "@/features/purchase-ledger/pages/PurchaseLedgerPage"
import { purchaseLedgerSearchSchema } from "@/features/purchase-ledger/schemas/purchase-ledger-search.schema"

export const Route = createFileRoute("/(authed)/manage_/purchase-ledger/")({
  validateSearch: purchaseLedgerSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which
  // would re-trigger this loader and blank the outlet. The list itself is read
  // client-side in PurchaseLedgerPage via useQuery instead.
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...purchaseLedgerQueryOptions(
        purchaseLedgerSearchSchema.parse(location.search)
      ),
      staleTime: "static",
    }),
  component: PurchaseLedgerPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
