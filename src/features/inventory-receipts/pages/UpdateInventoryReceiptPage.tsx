import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { UpdateInventoryReceiptForm } from "@/features/inventory-receipts/components/sections/UpdateInventoryReceiptForm"
import { inventoryReceiptQueryOptions } from "@/features/inventory-receipts/api/options"

export function UpdateInventoryReceiptPage() {
  const { inventoryReceiptId } = useParams({
    from: "/(authed)/manage_/inventory-receipts_/$inventoryReceiptId_/update",
  })
  const { data: inventoryReceipt } = useSuspenseQuery(
    inventoryReceiptQueryOptions(inventoryReceiptId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Cập nhật phiếu nhập kho"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Nhập kho", href: "/manage/inventory-receipts" },
          { label: inventoryReceipt.code },
          { label: "Cập nhật" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <UpdateInventoryReceiptForm inventoryReceipt={inventoryReceipt} />
      </div>
    </main>
  )
}
