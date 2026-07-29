import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { orderQueryOptions } from "@/features/orders/api"
import { productionOrderQueryOptions } from "@/features/production-orders/api/production-orders.options"
import { ProductionOrderDetailPage } from "@/features/production-orders/pages/ProductionOrderDetailPage"

// Also loads the underlying order's own detail (via the orders barrel) — the LSX-specific
// response has no `note`/`approvedAt`/`approver`, and the page's "Ghi chú" tab + "Lịch sử thay
// đổi" section both read those off the order instead.
export const Route = createFileRoute(
  "/(authed)/manage_/production-orders_/$orderId"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "production:read"),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        productionOrderQueryOptions(params.orderId)
      ),
      context.queryClient.ensureQueryData(orderQueryOptions(params.orderId)),
    ]),
  component: ProductionOrderDetailPage,
})
