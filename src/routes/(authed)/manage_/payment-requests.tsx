import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { paymentRequestsQueryOptions } from "@/features/payment-requests/api/options"
import { PaymentRequestsPage } from "@/features/payment-requests/pages/PaymentRequestsPage"
import { paymentRequestsSearchSchema } from "@/features/payment-requests/schemas/payment-requests-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/payment-requests")({
  validateSearch: paymentRequestsSearchSchema,
  // No loaderDeps: filter/pagination changes update only the table via useQuery,
  // not the whole route — same pattern as purchase-ledger.tsx / purchase-orders.tsx.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        paymentRequestsQueryOptions(
          paymentRequestsSearchSchema.parse(location.search)
        )
      ),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: PaymentRequestsPage,
  pendingComponent: PageLoading,
})
