import { PageBody } from "@/components/shared/layouts/PageBody"
import { PageShell } from "@/components/shared/layouts/PageShell"
import { CreateOrderForm } from "@/features/orders/components/sections/CreateOrderForm"

export function CreateOrderPage() {
  return (
    <PageShell
      title="Tạo đơn hàng"
      breadcrumbs={[
        { label: "Bán hàng" },
        { label: "Đơn hàng (SO)", href: "/manage/orders" },
        { label: "Tạo đơn hàng" },
      ]}
    >
      <PageBody className="order-drafting">
        <CreateOrderForm />
      </PageBody>
    </PageShell>
  )
}
