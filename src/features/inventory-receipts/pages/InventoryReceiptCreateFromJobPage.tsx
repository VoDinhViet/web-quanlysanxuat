import { useSearch } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { InventoryReceiptCreateFromJobForm } from "@/features/inventory-receipts/components/create-from-job/InventoryReceiptCreateFromJobForm"

export function InventoryReceiptCreateFromJobPage() {
  const { productionJobId } = useSearch({
    from: "/(authed)/manage_/inventory-receipts_/create-from-job",
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Nhập kho thành phẩm"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Nhập kho", href: "/manage/inventory-receipts" },
          { label: "Nhập kho thành phẩm" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <InventoryReceiptCreateFromJobForm
          initialProductionJobId={productionJobId}
        />
      </div>
    </main>
  )
}
