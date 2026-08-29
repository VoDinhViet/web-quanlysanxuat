import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { inventoryReceiptQueryOptions } from "@/features/inventory-receipts/api/options"
import { InventoryReceiptDetailHeader } from "@/features/inventory-receipts/components/layouts/InventoryReceiptDetailHeader"
import { InventoryReceiptDetailItemsSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptDetailItemsSection"
import { InventoryReceiptDetailInfoCard } from "@/features/inventory-receipts/components/composites/InventoryReceiptDetailInfoCard"

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
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
          <Surface>
            <InventoryReceiptDetailHeader inventoryReceipt={inventoryReceipt} />
            <InventoryReceiptDetailItemsSection
              inventoryReceipt={inventoryReceipt}
            />
          </Surface>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <InventoryReceiptDetailInfoCard
              inventoryReceipt={inventoryReceipt}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
