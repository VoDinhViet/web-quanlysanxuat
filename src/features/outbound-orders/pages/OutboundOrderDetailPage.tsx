import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { outboundOrderQueryOptions } from "@/features/outbound-orders/api/options"
import { OutboundOrderDetailHeader } from "@/features/outbound-orders/components/detail/OutboundOrderDetailHeader"
import { OutboundOrderItemsSection } from "@/features/outbound-orders/components/detail/OutboundOrderItemsSection"
import { OutboundOrderInfoCard } from "@/features/outbound-orders/components/detail/OutboundOrderInfoCard"
import { OutboundOrderStatusHistoryCard } from "@/features/outbound-orders/components/detail/OutboundOrderStatusHistoryCard"

export function OutboundOrderDetailPage() {
  const { outboundOrderId } = useParams({
    from: "/(authed)/manage_/outbound-orders_/$outboundOrderId",
  })

  const { data: detail } = useSuspenseQuery(
    outboundOrderQueryOptions(outboundOrderId)
  )

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
          { label: detail.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
          <Surface>
            <OutboundOrderDetailHeader detail={detail} />
            <OutboundOrderItemsSection detail={detail} />
          </Surface>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <OutboundOrderInfoCard detail={detail} />
            <OutboundOrderStatusHistoryCard detail={detail} />
          </div>
        </div>
      </div>
    </main>
  )
}
