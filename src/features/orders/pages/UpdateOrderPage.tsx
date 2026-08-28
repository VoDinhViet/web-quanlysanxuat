import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { UpdateOrderForm } from "@/features/orders/components/update/UpdateOrderForm"
import {
  orderItemsQueryOptions,
  orderQueryOptions,
} from "@/features/orders/api/options"

export function UpdateOrderPage() {
  const { orderId } = useParams({
    from: "/(authed)/manage_/orders_/$orderId_/update",
  })
  const { data: order } = useSuspenseQuery(orderQueryOptions(orderId))
  const { data: items } = useSuspenseQuery(orderItemsQueryOptions(orderId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Cập nhật đơn hàng"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Bán hàng" },
          { label: "Đơn hàng (SO)", href: "/manage/orders" },
          { label: order.code },
          { label: "Cập nhật" },
        ]}
        notificationCount={5}
      />

      <div className="order-drafting w-full p-4 sm:p-5 lg:p-6">
        <UpdateOrderForm order={order} items={items} />
      </div>
    </main>
  )
}
