import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { StandaloneOutsourcingOrderForm } from "@/features/outsourcing-orders/components/sections/StandaloneOutsourcingOrderForm"

export function CreateStandaloneOutsourcingOrderPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo phiếu gia công ngoài thủ công"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Gia công ngoài", href: "/manage/outsourcing-orders" },
          {
            label: "Xuất đi gia công (OS-OUT)",
            href: "/manage/outsourcing-orders",
          },
          { label: "Tạo thủ công" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <StandaloneOutsourcingOrderForm />
      </div>
    </main>
  )
}
