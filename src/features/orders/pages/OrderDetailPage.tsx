import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { OrderDetailAddressCard } from "@/features/orders/components/detail/OrderDetailAddressCard"
import { OrderDetailAttachmentsCard } from "@/features/orders/components/detail/OrderDetailAttachmentsCard"
import { OrderDetailDeliveryHistoryCard } from "@/features/orders/components/detail/OrderDetailDeliveryHistoryCard"
import { OrderDetailInfoCard } from "@/features/orders/components/detail/OrderDetailInfoCard"
import { OrderDetailItemsCard } from "@/features/orders/components/detail/OrderDetailItemsCard"
import { OrderDetailNotesCard } from "@/features/orders/components/detail/OrderDetailNotesCard"
import { OrderDetailPaymentHistoryCard } from "@/features/orders/components/detail/OrderDetailPaymentHistoryCard"
import { OrderRejectionNotice } from "@/features/orders/components/detail/OrderRejectionNotice"
import { OrderDetailSummaryCard } from "@/features/orders/components/detail/OrderDetailSummaryCard"
import { OrderDetailTimelineCard } from "@/features/orders/components/detail/OrderDetailTimelineCard"
import { orderQueryOptions } from "@/features/orders/api/orders.options"

export function OrderDetailPage() {
  const { orderId } = useParams({
    from: "/(authed)/manage_/orders_/$orderId",
  })

  const { data: order } = useSuspenseQuery(orderQueryOptions(orderId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết đơn hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Đơn hàng (SO)", href: "/manage/orders" },
          { label: order.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <OrderDetailSummaryCard order={order} />
        <OrderRejectionNotice order={order} />

        {/* minmax(0,1fr) (not 1fr) so the items table scrolls inside its own
            column instead of blowing the grid out horizontally. */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-4">
            <OrderDetailInfoCard order={order} />
            <OrderDetailItemsCard order={order} />
            <OrderDetailPaymentHistoryCard order={order} />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <OrderDetailAddressCard order={order} />
            <OrderDetailTimelineCard order={order} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <OrderDetailDeliveryHistoryCard order={order} />
          <OrderDetailNotesCard order={order} />
          <OrderDetailAttachmentsCard order={order} />
        </div>
      </div>
    </main>
  )
}
