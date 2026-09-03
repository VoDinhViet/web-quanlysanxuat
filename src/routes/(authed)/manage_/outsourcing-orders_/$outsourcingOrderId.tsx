import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import {
  outsourcingOrderItemsQueryOptions,
  outsourcingOrderQueryOptions,
} from "@/features/outsourcing-orders/api/options"
import { OutsourcingOrderDetailPage } from "@/features/outsourcing-orders/pages/OutsourcingOrderDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/outsourcing-orders_/$outsourcingOrderId"
)({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.query({
        ...outsourcingOrderQueryOptions(params.outsourcingOrderId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...outsourcingOrderItemsQueryOptions(params.outsourcingOrderId),
        staleTime: "static",
      }),
    ]),
  component: OutsourcingOrderDetailPage,
  pendingComponent: LayoutPagePending,
})
