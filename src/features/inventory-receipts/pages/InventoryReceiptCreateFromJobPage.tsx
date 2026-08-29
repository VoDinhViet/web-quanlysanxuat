import { useSearch } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { InventoryReceiptCreateFromJobForm } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateFromJobForm"

export function InventoryReceiptCreateFromJobPage() {
  const { productionJobId } = useSearch({
    from: "/(authed)/manage_/inventory-receipts_/create-from-job",
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Nhập kho thành phẩm"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Nhập kho", href: "/manage/inventory-receipts" },
          { label: "Nhập kho thành phẩm" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <InventoryReceiptCreateFromJobForm
          initialProductionJobId={productionJobId}
        />
      </div>
    </main>
  )
}
