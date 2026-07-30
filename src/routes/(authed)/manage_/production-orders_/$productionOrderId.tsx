import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { orderQueryOptions } from "@/features/orders/api"
import {
  productionOrderLogsQueryOptions,
  productionOrderQueryOptions,
} from "@/features/production-orders/api/production-orders.options"
import { ProductionOrderDetailPage } from "@/features/production-orders/pages/ProductionOrderDetailPage"

// `params.productionOrderId` is the production order's own id, not the order's id — the backend
// detail lookup key changed 2026-07-30 (see production-order.type.ts). The order fetch has to
// wait for the production detail response and read `order.id` off of it, so it can't run in
// parallel off the route param — but the logs fetch only needs `params.productionOrderId`
// (already known), so it runs alongside the order fetch instead of chaining after it too.
export const Route = createFileRoute(
  "/(authed)/manage_/production-orders_/$productionOrderId"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "production:read"),
  loader: async ({ context, params }) => {
    const production = await context.queryClient.ensureQueryData(
      productionOrderQueryOptions(params.productionOrderId)
    )
    await Promise.all([
      context.queryClient.ensureQueryData(
        orderQueryOptions(production.order.id)
      ),
      context.queryClient.ensureQueryData(
        productionOrderLogsQueryOptions(params.productionOrderId, 1)
      ),
    ])
  },
  component: ProductionOrderDetailPage,
})
