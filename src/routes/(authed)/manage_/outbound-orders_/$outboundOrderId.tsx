import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { outboundOrderQueryOptions } from "@/features/outbound-orders/api/options"
import { OutboundOrderDetailPage } from "@/features/outbound-orders/pages/OutboundOrderDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/outbound-orders_/$outboundOrderId"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "orders:read"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      outboundOrderQueryOptions(params.outboundOrderId)
    ),
  component: OutboundOrderDetailPage,
  pendingComponent: PageLoading,
})
