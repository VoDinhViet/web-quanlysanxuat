import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
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
      context.queryClient.query({
        ...outboundOrderQueryOptions(params.outboundOrderId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...outboundOrderItemsQueryOptions(params.outboundOrderId),
        staleTime: "static",
      }),
    ]),
  component: OutboundOrderDetailPage,
  pendingComponent: LayoutPagePending,
})
