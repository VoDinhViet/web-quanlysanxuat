import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import {
  outboundOrderItemsQueryOptions,
  outboundOrderQueryOptions,
} from "@/features/outbound-orders/api/options"
import { OutboundOrderDetailPage } from "@/features/outbound-orders/pages/OutboundOrderDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/outbound-orders_/$outboundOrderId"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "outbound:read"),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        outboundOrderQueryOptions(params.outboundOrderId)
      ),
      context.queryClient.ensureQueryData(
        outboundOrderItemsQueryOptions(params.outboundOrderId)
      ),
    ]),
  component: OutboundOrderDetailPage,
  pendingComponent: PageLoading,
})
