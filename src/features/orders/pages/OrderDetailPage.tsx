import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { OrderDetailAddressCard } from "@/features/orders/components/composites/OrderDetailAddressCard"
import { OrderDetailFilesCard } from "@/features/orders/components/composites/OrderDetailFilesCard"
import { OrderDetailDeliveryHistoryCard } from "@/features/orders/components/composites/OrderDetailDeliveryHistoryCard"
import { OrderDetailInfoCard } from "@/features/orders/components/composites/OrderDetailInfoCard"
import { OrderDetailItemsCard } from "@/features/orders/components/composites/OrderDetailItemsCard"
import { OrderDetailNotesCard } from "@/features/orders/components/composites/OrderDetailNotesCard"
import { OrderRejectionNotice } from "@/features/orders/components/composites/OrderRejectionNotice"
import { OrderDetailSummaryCard } from "@/features/orders/components/composites/OrderDetailSummaryCard"
import { OrderDetailTimelineCard } from "@/features/orders/components/composites/OrderDetailTimelineCard"
import {
  orderItemsQueryOptions,
  orderQueryOptions,
} from "@/features/orders/api/options"

export function OrderDetailPage() {
  const { orderId } = useParams({
    from: "/(authed)/manage_/orders_/$orderId",
  })

  const { data: order } = useSuspenseQuery(orderQueryOptions(orderId))
  const { data: items } = useSuspenseQuery(orderItemsQueryOptions(orderId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết đơn hàng"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Đơn hàng (SO)", href: "/manage/orders" },
          { label: order.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <OrderDetailSummaryCard order={order} items={items} />
        <OrderRejectionNotice order={order} />

        {/* minmax(0,1fr) (not 1fr) so the items table scrolls inside its own
            column instead of blowing the grid out horizontally. */}
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-4">
            <OrderDetailInfoCard order={order} />
            <OrderDetailItemsCard order={order} items={items} />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <OrderDetailAddressCard order={order} />
            <OrderDetailTimelineCard order={order} />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          <OrderDetailDeliveryHistoryCard order={order} items={items} />
          <OrderDetailNotesCard order={order} />
          <OrderDetailFilesCard order={order} />
        </div>
      </div>
    </main>
  )
}
