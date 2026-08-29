import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { CreateOrderForm } from "@/features/orders/components/create/CreateOrderForm"

export function CreateOrderPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo đơn hàng"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Bán hàng" },
          { label: "Đơn hàng (SO)", href: "/manage/orders" },
          { label: "Tạo đơn hàng" },
        ]}
      />

      <div className="order-drafting w-full p-4 sm:p-5 lg:p-6">
        <CreateOrderForm />
      </div>
    </main>
  )
}
