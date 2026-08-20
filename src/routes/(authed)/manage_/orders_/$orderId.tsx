import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { OrderDetailPage } from "@/features/orders/pages/OrderDetailPage"
import {
  orderItemsQueryOptions,
  orderPaymentsQueryOptions,
  orderQueryOptions,
} from "@/features/orders/api/options"

// No `validateSearch`: the page is a single continuous scroll of cards (no
// tabs), so there's no shareable UI state left to keep in the URL.
export const Route = createFileRoute("/(authed)/manage_/orders_/$orderId")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(orderQueryOptions(params.orderId)),
      context.queryClient.ensureQueryData(
        orderItemsQueryOptions(params.orderId)
      ),
      context.queryClient.ensureQueryData(
        orderPaymentsQueryOptions(params.orderId)
      ),
    ]),
  component: OrderDetailPage,
  pendingComponent: PageLoading,
})
