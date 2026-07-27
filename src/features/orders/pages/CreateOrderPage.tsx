import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateOrderForm } from "@/features/orders/components/CreateOrderForm"

export function CreateOrderPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo đơn hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Bán hàng" },
          { label: "Đơn hàng (SO)", href: "/manage/orders" },
          { label: "Tạo đơn hàng" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateOrderForm />
      </div>
    </main>
  )
}
