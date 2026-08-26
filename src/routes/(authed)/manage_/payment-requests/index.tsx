import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { paymentRequestsQueryOptions } from "@/features/payment-requests/api/options"
import { PaymentRequestsPage } from "@/features/payment-requests/pages/PaymentRequestsPage"
import { paymentRequestsSearchSchema } from "@/features/payment-requests/schemas/payment-requests-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/payment-requests/")({
  validateSearch: paymentRequestsSearchSchema,
  // No loaderDeps: filter/pagination changes update only the table via useQuery,
  // not the whole outlet — same pattern as purchase-ledger/index.tsx / purchase-orders/index.tsx.
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
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
