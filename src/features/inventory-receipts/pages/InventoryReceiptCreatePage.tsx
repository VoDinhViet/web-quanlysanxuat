import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { InventoryReceiptCreateForm } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateForm"

export function InventoryReceiptCreatePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo phiếu nhập kho"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Nhập kho", href: "/manage/inventory-receipts" },
          { label: "Tạo phiếu nhập kho" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <InventoryReceiptCreateForm />
      </div>
    </main>
  )
}
