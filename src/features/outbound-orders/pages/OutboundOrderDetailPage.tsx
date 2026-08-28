import { useParams, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import {
  outboundOrderItemsQueryOptions,
  outboundOrderQueryOptions,
} from "@/features/outbound-orders/api/options"
import { OutboundOrderDetailHeader } from "@/features/outbound-orders/components/detail/OutboundOrderDetailHeader"
import { OutboundOrderEditForm } from "@/features/outbound-orders/components/detail/OutboundOrderEditForm"
import { OutboundOrderItemsSection } from "@/features/outbound-orders/components/detail/OutboundOrderItemsSection"
import { OutboundOrderInfoCard } from "@/features/outbound-orders/components/detail/OutboundOrderInfoCard"
import { OutboundOrderRejectionNotice } from "@/features/outbound-orders/components/detail/OutboundOrderRejectionNotice"
import { canUpdateOutboundOrder } from "@/lib/types/outbound-order.type"

export function OutboundOrderDetailPage() {
  const { outboundOrderId } = useParams({
    from: "/(authed)/manage_/outbound-orders_/$outboundOrderId",
  })
  const { mode } = useSearch({
    from: "/(authed)/manage_/outbound-orders_/$outboundOrderId",
  })

  const { data: order } = useSuspenseQuery(
    outboundOrderQueryOptions(outboundOrderId)
  )
  const { data: items } = useSuspenseQuery(
    outboundOrderItemsQueryOptions(outboundOrderId)
  )

  // `?mode=edit` rơi về xem nếu phiếu không còn DRAFT (đã gửi duyệt/hủy/xóa ở tab khác) — BUG-090.
  const isEditing = mode === "edit" && canUpdateOutboundOrder(order.status)

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết đơn giao hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý bán hàng" },
          {
            label: "Giao hàng (DO)",
            href: "/manage/outbound-orders",
          },
          { label: order.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <OutboundOrderRejectionNotice order={order} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
          <Surface>
            <OutboundOrderDetailHeader order={order} isEditing={isEditing} />
            {isEditing ? (
              <OutboundOrderEditForm order={order} items={items} />
            ) : (
              <OutboundOrderItemsSection items={items} />
            )}
          </Surface>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <OutboundOrderInfoCard order={order} />
          </div>
        </div>
      </div>
    </main>
  )
}
