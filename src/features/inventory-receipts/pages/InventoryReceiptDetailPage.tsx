import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { inventoryReceiptQueryOptions } from "@/features/inventory-receipts/api/options"
import { InventoryReceiptDetailHeader } from "@/features/inventory-receipts/components/detail/InventoryReceiptDetailHeader"
import { InventoryReceiptItemsSection } from "@/features/inventory-receipts/components/detail/InventoryReceiptItemsSection"
import { InventoryReceiptInfoCard } from "@/features/inventory-receipts/components/detail/InventoryReceiptInfoCard"

export function InventoryReceiptDetailPage() {
  const { inventoryReceiptId } = useParams({
    from: "/(authed)/manage_/inventory-receipts_/$inventoryReceiptId",
  })

  const { data: detail } = useSuspenseQuery(
    inventoryReceiptQueryOptions(inventoryReceiptId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết phiếu nhập kho"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý kho" },
          {
            label: "Nhập kho",
            href: "/manage/inventory-receipts",
          },
          { label: detail.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
          <Surface>
            <InventoryReceiptDetailHeader detail={detail} />
            <InventoryReceiptItemsSection detail={detail} />
          </Surface>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <InventoryReceiptInfoCard detail={detail} />
          </div>
        </div>
      </div>
    </main>
  )
}
