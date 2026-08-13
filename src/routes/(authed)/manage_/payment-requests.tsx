import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { paymentRequestsQueryOptions } from "@/features/payment-requests/api/options"
import { PaymentRequestsPage } from "@/features/payment-requests/pages/PaymentRequestsPage"
import { paymentRequestsSearchSchema } from "@/features/payment-requests/schemas/payment-requests-search.schema"

export const Route = createFileRoute("/(authed)/manage_/payment-requests")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "purchasing:read"),
  validateSearch: paymentRequestsSearchSchema,
  // No loaderDeps: filter/pagination changes update only the table via useQuery,
  // not the whole route — same pattern as purchase-ledger.tsx / purchase-orders.tsx.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      paymentRequestsQueryOptions(
        paymentRequestsSearchSchema.parse(location.search)
      )
    ),
  component: PaymentRequestsPage,
  pendingComponent: PageLoading,
})
