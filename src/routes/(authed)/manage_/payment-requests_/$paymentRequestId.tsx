import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { paymentRequestQueryOptions } from "@/features/payment-requests/api/options"
import { PaymentRequestDetailPage } from "@/features/payment-requests/pages/PaymentRequestDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/payment-requests_/$paymentRequestId"
)({
  loader: ({ context, params }) =>
    context.queryClient.query({
      ...paymentRequestQueryOptions(params.paymentRequestId),
      staleTime: "static",
    }),
  component: PaymentRequestDetailPage,
  pendingComponent: LayoutPagePending,
})
