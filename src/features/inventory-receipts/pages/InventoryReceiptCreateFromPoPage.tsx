import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { InventoryReceiptCreateFromPoForm } from "@/features/inventory-receipts/components/create-from-po/InventoryReceiptCreateFromPoForm"

export function InventoryReceiptCreateFromPoPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Nhập kho từ PO"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Nhập kho", href: "/manage/inventory-receipts" },
          { label: "Nhập kho từ PO" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <InventoryReceiptCreateFromPoForm />
      </div>
    </main>
  )
}
