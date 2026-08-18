import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { paymentRequestQueryOptions } from "@/features/payment-requests/api/options"
import { PaymentRequestDetailPage } from "@/features/payment-requests/pages/PaymentRequestDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/payment-requests_/$paymentRequestId"
)({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      paymentRequestQueryOptions(params.paymentRequestId)
    ),
  component: PaymentRequestDetailPage,
  pendingComponent: PageLoading,
})
