import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { DetailColumns } from "@/components/shared/layouts/DetailColumns"
import { PageBody } from "@/components/shared/layouts/PageBody"
import { PageShell } from "@/components/shared/layouts/PageShell"
import { Surface } from "@/components/shared/layouts/Surface"
import { inventoryRequisitionQueryOptions } from "@/features/inventory-requisitions/api/options"
import { InventoryRequisitionDetailHeader } from "@/features/inventory-requisitions/components/layouts/InventoryRequisitionDetailHeader"
import { InventoryRequisitionInfoCard } from "@/features/inventory-requisitions/components/composites/InventoryRequisitionInfoCard"
import { InventoryRequisitionItemsSection } from "@/features/inventory-requisitions/components/sections/InventoryRequisitionItemsSection"

export function InventoryRequisitionDetailPage() {
  const { requisitionId } = useParams({
    from: "/(authed)/manage_/inventory-requisitions_/$requisitionId",
  })

  const { data: detail } = useSuspenseQuery(
    inventoryRequisitionQueryOptions(requisitionId)
  )

  return (
    <PageShell
      title="Chi tiết phiếu lãnh vật tư"
      breadcrumbs={[
        { label: "Quản lý sản xuất" },
        { label: "Lãnh vật tư", href: "/manage/inventory-requisitions" },
        { label: detail.code },
      ]}
    >
      <PageBody>
        <DetailColumns
          main={
            <Surface>
              <InventoryRequisitionDetailHeader detail={detail} />
              <InventoryRequisitionItemsSection detail={detail} />
            </Surface>
          }
          sidebar={<InventoryRequisitionInfoCard detail={detail} />}
        />
      </PageBody>
    </PageShell>
  )
}
