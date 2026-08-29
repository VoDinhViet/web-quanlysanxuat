import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { inventoryRequisitionQueryOptions } from "@/features/inventory-requisitions/api/options"
import { InventoryRequisitionDetailHeader } from "@/features/inventory-requisitions/components/detail/InventoryRequisitionDetailHeader"
import { InventoryRequisitionInfoCard } from "@/features/inventory-requisitions/components/detail/InventoryRequisitionInfoCard"
import { InventoryRequisitionItemsSection } from "@/features/inventory-requisitions/components/detail/InventoryRequisitionItemsSection"

export function InventoryRequisitionDetailPage() {
  const { requisitionId } = useParams({
    from: "/(authed)/manage_/inventory-requisitions_/$requisitionId",
  })

  const { data: detail } = useSuspenseQuery(
    inventoryRequisitionQueryOptions(requisitionId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết phiếu lãnh vật tư"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý sản xuất" },
          { label: "Lãnh vật tư", href: "/manage/inventory-requisitions" },
          { label: detail.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
          <Surface>
            <InventoryRequisitionDetailHeader detail={detail} />
            <InventoryRequisitionItemsSection detail={detail} />
          </Surface>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <InventoryRequisitionInfoCard detail={detail} />
          </div>
        </div>
      </div>
    </main>
  )
}
