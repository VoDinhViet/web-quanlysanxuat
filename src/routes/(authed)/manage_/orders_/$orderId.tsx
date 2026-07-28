import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { OrderDetailPage } from "@/features/orders/pages/OrderDetailPage"
import { orderDetailSearchSchema } from "@/features/orders/schemas/order-detail-search.schema"
import { orderQueryOptions } from "@/features/orders/api/orders.options"

// Guarded on `orders:read`, not `orders:update`: a read-only viewer should
// reach this screen. The write actions gate themselves (Chỉnh sửa stays
// disabled — there's no update-order screen yet).
export const Route = createFileRoute("/(authed)/manage_/orders_/$orderId")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "orders:read"),
  validateSearch: orderDetailSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(orderQueryOptions(params.orderId)),
  component: OrderDetailPage,
})
