import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import {
  outsourcingOrderItemsQueryOptions,
  outsourcingOrderQueryOptions,
} from "@/features/outsourcing-orders/api/options"
import { OutsourcingOrderDetailPage } from "@/features/outsourcing-orders/pages/OutsourcingOrderDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/outsourcing-orders_/$outsourcingOrderId"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "outsourcing:read"),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        outsourcingOrderQueryOptions(params.outsourcingOrderId)
      ),
      context.queryClient.ensureQueryData(
        outsourcingOrderItemsQueryOptions(params.outsourcingOrderId)
      ),
    ]),
  component: OutsourcingOrderDetailPage,
  pendingComponent: PageLoading,
})
