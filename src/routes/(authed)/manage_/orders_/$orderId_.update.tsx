import { createFileRoute, redirect } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { UpdateOrderPage } from "@/features/orders/pages/UpdateOrderPage"
import {
  orderItemsQueryOptions,
  orderQueryOptions,
} from "@/features/orders/api/options"
import { canUpdateOrder } from "@/lib/types/order.type"

// The trailing underscore on `$orderId_` opts this route out of nesting under
// `orders_/$orderId.tsx` (the detail page, which renders no <Outlet/>) while keeping the
// same URL segment — see "Layer boundaries" in architecture.md.
export const Route = createFileRoute(
  "/(authed)/manage_/orders_/$orderId_/update"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "orders:update"),
  loader: async ({ context, params }) => {
    const [order] = await Promise.all([
      context.queryClient.ensureQueryData(orderQueryOptions(params.orderId)),
      context.queryClient.ensureQueryData(
        orderItemsQueryOptions(params.orderId)
      ),
    ])

    // Backend rejects a PATCH on a finished order (order.error.not_editable); PENDING_CONFIRMATION
    // and everything from AWAITING_PRODUCTION onward are blocked here too, but those are a
    // front-end-only rule (the backend still accepts the PATCH) — see canUpdateOrder. Either way,
    // bounce to the detail page instead of showing a form that can never save (or that could be
    // used to bypass the approval flow via the status select). The loader still doesn't `return`
    // anything (see "Loaders prefetch, don't return"); it only awaits to both prefetch the cache
    // and read the status.
    if (!canUpdateOrder(order.status)) {
      throw redirect({
        to: "/manage/orders/$orderId",
        params: { orderId: params.orderId },
      })
    }
  },
  component: UpdateOrderPage,
  pendingComponent: PageLoading,
})
