import { createFileRoute, redirect } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import {
  outsourcingOrderItemsQueryOptions,
  outsourcingOrderQueryOptions,
} from "@/features/outsourcing-orders/api/options"
import { unitOptionsQueryOptions } from "@/features/units/api"
import { UpdateOutsourcingOrderPage } from "@/features/outsourcing-orders/pages/UpdateOutsourcingOrderPage"
import { canUpdateOutsourcingOrder } from "@/lib/types/outsourcing-order.type"

// The trailing underscore on `$outsourcingOrderId_` opts this route out of nesting under
// `outsourcing-orders_/$outsourcingOrderId.tsx` (the detail page) while keeping the same URL
// segment — same layout as orders_/$orderId_.update.tsx.
export const Route = createFileRoute(
  "/(authed)/manage_/outsourcing-orders_/$outsourcingOrderId_/update"
)({
  loader: async ({ context, params }) => {
    const [order] = await Promise.all([
      context.queryClient.query({
        ...outsourcingOrderQueryOptions(params.outsourcingOrderId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...outsourcingOrderItemsQueryOptions(params.outsourcingOrderId),
        staleTime: "static",
      }),
      // Form phiếu thủ công cần tên đơn vị ngay khi mở, tránh hiện UUID trong lúc chờ tải.
      context.queryClient.query(unitOptionsQueryOptions()),
    ])

    // Backend chỉ nhận PATCH khi phiếu còn DRAFT/REJECTED — quay về trang chi tiết thay vì hiện
    // form không thể lưu.
    if (!canUpdateOutsourcingOrder(order.status)) {
      throw redirect({
        to: "/manage/outsourcing-orders/$outsourcingOrderId",
        params: { outsourcingOrderId: params.outsourcingOrderId },
      })
    }
  },
  component: UpdateOutsourcingOrderPage,
  pendingComponent: LayoutPagePending,
})
