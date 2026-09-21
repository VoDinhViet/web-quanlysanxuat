import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageBody } from "@/components/shared/layouts/PageBody"
import { PageShell } from "@/components/shared/layouts/PageShell"
import { UpdateOrderForm } from "@/features/orders/components/sections/UpdateOrderForm"
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
    <PageShell
      title="Cập nhật đơn hàng"
      breadcrumbs={[
        { label: "Bán hàng" },
        { label: "Đơn hàng (SO)", href: "/manage/orders" },
        { label: order.code },
        { label: "Cập nhật" },
      ]}
    >
      <PageBody className="order-drafting">
        <UpdateOrderForm order={order} items={items} />
      </PageBody>
    </PageShell>
  )
}
