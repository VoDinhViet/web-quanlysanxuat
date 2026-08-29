import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { CreateOutboundOrderForm } from "@/features/outbound-orders/components/sections/CreateOutboundOrderForm"

export function CreateOutboundOrderPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo phiếu giao hàng (DO)"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý bán hàng", href: "/manage/outbound-orders" },
          { label: "Giao hàng (DO)", href: "/manage/outbound-orders" },
          { label: "Tạo phiếu" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateOutboundOrderForm />
      </div>
    </main>
  )
}
