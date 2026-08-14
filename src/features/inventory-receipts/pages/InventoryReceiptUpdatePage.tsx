import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { InventoryReceiptUpdateForm } from "@/features/inventory-receipts/components/update/InventoryReceiptUpdateForm"
import { inventoryReceiptQueryOptions } from "@/features/inventory-receipts/api/options"

export function InventoryReceiptUpdatePage() {
  const { inventoryReceiptId } = useParams({
    from: "/(authed)/manage_/inventory-receipts_/$inventoryReceiptId_/update",
  })
  const { data: detail } = useSuspenseQuery(
    inventoryReceiptQueryOptions(inventoryReceiptId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Cập nhật phiếu nhập kho"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Nhập kho", href: "/manage/inventory-receipts" },
          { label: detail.code },
          { label: "Cập nhật" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <InventoryReceiptUpdateForm detail={detail} />
      </div>
    </main>
  )
}
