import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ClipboardText } from "@solar-icons/react"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { InventoryProductDetailHeader } from "@/features/inventory-products/components/layouts/InventoryProductDetailHeader"
import { InventoryProductInfoCard } from "@/features/inventory-products/components/composites/InventoryProductInfoCard"
import { InventoryProductLedgerDateFilter } from "@/features/inventory-products/components/sections/InventoryProductLedgerDateFilter"
import { InventoryProductLedgerTab } from "@/features/inventory-products/components/sections/InventoryProductLedgerTab"
import { InventoryProductRecentActivityCards } from "@/features/inventory-products/components/composites/InventoryProductRecentActivityCards"
import { InventoryProductStatTiles } from "@/features/inventory-products/components/composites/InventoryProductStatTiles"
import { itemInventoryQueryOptions } from "@/features/inventory-products/api/options"
import { itemQueryOptions } from "@/features/products/api"

export function InventoryProductDetailPage() {
  const { itemId } = useParams({
    from: "/(authed)/manage_/inventory-products_/$itemId",
  })

  const { data: item } = useSuspenseQuery(itemQueryOptions(itemId))
  const inventoryQuery = useSuspenseQuery(itemInventoryQueryOptions(itemId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết thành phẩm tồn kho"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý kho", href: "/manage/inventory-products" },
          { label: "Tồn kho thành phẩm", href: "/manage/inventory-products" },
          { label: item.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface>
          <div className="px-4 pt-4 sm:px-5">
            <InventoryProductDetailHeader item={item} />
          </div>

          <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="flex flex-col gap-4">
              <InventoryProductInfoCard item={item} />
              <InventoryProductRecentActivityCards itemId={itemId} />
            </div>

            <div>
              {inventoryQuery.data ? (
                <InventoryProductStatTiles
                  inventory={inventoryQuery.data}
                  query={inventoryQuery}
                />
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Chưa có dữ liệu tồn kho cho thành phẩm này.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 sm:px-5">
            <div className="flex h-12 items-center gap-2 text-sm font-medium text-foreground">
              <ClipboardText className="size-4 text-muted-foreground" />
              Thẻ kho thành phẩm
            </div>

            <InventoryProductLedgerDateFilter />
          </div>

          <InventoryProductLedgerTab itemId={itemId} />
        </Surface>
      </div>
    </main>
  )
}
