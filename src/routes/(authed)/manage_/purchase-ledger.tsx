import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { purchaseLedgerQueryOptions } from "@/features/purchase-ledger/api/options"
import { PurchaseLedgerPage } from "@/features/purchase-ledger/pages/PurchaseLedgerPage"
import { purchaseLedgerSearchSchema } from "@/features/purchase-ledger/schemas/purchase-ledger-search.schema"

export const Route = createFileRoute("/(authed)/manage_/purchase-ledger")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "purchasing:read"),
  validateSearch: purchaseLedgerSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which
  // would re-trigger this loader and blank the whole page. The list itself is read
  // client-side in PurchaseLedgerPage via useQuery instead.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      purchaseLedgerQueryOptions(
        purchaseLedgerSearchSchema.parse(location.search)
      )
    ),
  component: PurchaseLedgerPage,
  pendingComponent: PageLoading,
})
