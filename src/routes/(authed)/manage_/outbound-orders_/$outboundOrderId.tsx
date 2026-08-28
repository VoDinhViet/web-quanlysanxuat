import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/feedback/LayoutPagePending"
import {
  outboundOrderItemsQueryOptions,
  outboundOrderQueryOptions,
} from "@/features/outbound-orders/api/options"
import { OutboundOrderDetailPage } from "@/features/outbound-orders/pages/OutboundOrderDetailPage"
import { outboundOrderDetailSearchSchema } from "@/features/outbound-orders/schemas/outbound-order-detail-search.schema"

// `?mode=edit` (BUG-090) — sửa là edit-inline ngay trên trang này, không phải route `/update`
// riêng. `OutboundOrderDetailPage` tự rơi về "view" nếu phiếu không còn DRAFT dù URL mang
// `mode=edit`.
export const Route = createFileRoute(
  "/(authed)/manage_/outbound-orders_/$outboundOrderId"
)({
  validateSearch: outboundOrderDetailSearchSchema,
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
  pendingComponent: LayoutPagePending,
})
