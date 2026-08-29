import { useSearch } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { CreateOutsourcingOrderForm } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderForm"

export function CreateOutsourcingOrderPage() {
  const search = useSearch({
    from: "/(authed)/manage_/outsourcing-orders_/create",
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo phiếu xuất đi gia công ngoài (OS-OUT)"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Gia công ngoài", href: "/manage/outsourcing-orders" },
          {
            label: "Xuất đi gia công (OS-OUT)",
            href: "/manage/outsourcing-orders",
          },
          { label: "Tạo phiếu" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateOutsourcingOrderForm
          initialProductionJobId={search.productionJobId}
          initialOperationId={search.operationId}
        />
      </div>
    </main>
  )
}
