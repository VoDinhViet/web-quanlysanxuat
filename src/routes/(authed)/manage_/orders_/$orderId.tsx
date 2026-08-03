import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { OrderDetailPage } from "@/features/orders/pages/OrderDetailPage"
import { orderQueryOptions } from "@/features/orders/api/options"

// Guarded on `orders:read`, not `orders:update`: a read-only viewer should
// reach this screen. The write action gates itself (OrderDetailActions'
// "Chỉnh sửa" is wrapped in `PermissionGate permission="orders:update"`).
// No `validateSearch`: the page is a single continuous scroll of cards (no
// tabs), so there's no shareable UI state left to keep in the URL.
export const Route = createFileRoute("/(authed)/manage_/orders_/$orderId")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "orders:read"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(orderQueryOptions(params.orderId)),
  component: OrderDetailPage,
  pendingComponent: PageLoading,
})
