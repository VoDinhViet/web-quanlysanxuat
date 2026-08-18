import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import {
  outsourcingOrderItemsQueryOptions,
  outsourcingOrderQueryOptions,
} from "@/features/outsourcing-orders/api/options"
import { OutsourcingOrderDetailHeader } from "@/features/outsourcing-orders/components/detail/OutsourcingOrderDetailHeader"
import { OutsourcingOrderInfoCard } from "@/features/outsourcing-orders/components/detail/OutsourcingOrderInfoCard"
import { OutsourcingOrderItemsCard } from "@/features/outsourcing-orders/components/detail/OutsourcingOrderItemsCard"

export function OutsourcingOrderDetailPage() {
  const { outsourcingOrderId } = useParams({
    from: "/(authed)/manage_/outsourcing-orders_/$outsourcingOrderId",
  })

  const { data: order } = useSuspenseQuery(
    outsourcingOrderQueryOptions(outsourcingOrderId)
  )
  const { data: items } = useSuspenseQuery(
    outsourcingOrderItemsQueryOptions(outsourcingOrderId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết phiếu gửi gia công ngoài"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Gia công ngoài" },
          {
            label: "Xuất đi gia công (OS-OUT)",
            href: "/manage/outsourcing-orders",
          },
          { label: order.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface>
          <OutsourcingOrderDetailHeader order={order} />
        </Surface>

        <OutsourcingOrderInfoCard order={order} />
        <OutsourcingOrderItemsCard items={items} />
      </div>
    </main>
  )
}
