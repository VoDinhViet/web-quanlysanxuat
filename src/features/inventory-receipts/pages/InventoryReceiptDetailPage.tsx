import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { inventoryReceiptQueryOptions } from "@/features/inventory-receipts/api/options"
import { InventoryReceiptDetailHeader } from "@/features/inventory-receipts/components/layouts/InventoryReceiptDetailHeader"
import { InventoryReceiptDetailItemsSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptDetailItemsSection"
import { InventoryReceiptDetailInfoCard } from "@/features/inventory-receipts/components/composites/InventoryReceiptDetailInfoCard"
import { InventoryReceiptFilesCard } from "@/features/inventory-receipts/components/composites/InventoryReceiptFilesCard"
import { InventoryReceiptRelatedNotesCard } from "@/features/inventory-receipts/components/composites/InventoryReceiptRelatedNotesCard"

export function InventoryReceiptDetailPage() {
  const { inventoryReceiptId } = useParams({
    from: "/(authed)/manage_/inventory-receipts_/$inventoryReceiptId",
  })

  const { data: inventoryReceipt } = useSuspenseQuery(
    inventoryReceiptQueryOptions(inventoryReceiptId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết phiếu nhập kho"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý kho" },
          {
            label: "Nhập kho",
            href: "/manage/inventory-receipts",
          },
          { label: inventoryReceipt.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        {/* Main content */}
        <Surface>
          <InventoryReceiptDetailHeader inventoryReceipt={inventoryReceipt} />
          <InventoryReceiptDetailItemsSection
            inventoryReceipt={inventoryReceipt}
          />
        </Surface>

        {/* Thông tin phụ: Nhật ký phiếu, Ghi chú liên quan và File đính kèm */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <div className="flex flex-col gap-4">
            <InventoryReceiptDetailInfoCard
              inventoryReceipt={inventoryReceipt}
            />
            <InventoryReceiptRelatedNotesCard receiptId={inventoryReceipt.id} />
          </div>
          <InventoryReceiptFilesCard inventoryReceipt={inventoryReceipt} />
        </div>
      </div>
    </main>
  )
}
