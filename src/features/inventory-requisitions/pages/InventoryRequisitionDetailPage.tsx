import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageBody } from "@/components/shared/layouts/PageBody"
import { PageShell } from "@/components/shared/layouts/PageShell"
import { Surface } from "@/components/shared/layouts/Surface"
import { StatusNotice } from "@/components/shared/composites/StatusNotice"
import { inventoryRequisitionQueryOptions } from "@/features/inventory-requisitions/api/options"
import { InventoryRequisitionDetailHeader } from "@/features/inventory-requisitions/components/layouts/InventoryRequisitionDetailHeader"
import { InventoryRequisitionInfoCard } from "@/features/inventory-requisitions/components/composites/InventoryRequisitionInfoCard"
import { InventoryRequisitionItemsSection } from "@/features/inventory-requisitions/components/sections/InventoryRequisitionItemsSection"
import { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"

export function InventoryRequisitionDetailPage() {
  const { requisitionId } = useParams({
    from: "/(authed)/manage_/inventory-requisitions_/$requisitionId",
  })

  const { data: detail } = useSuspenseQuery(
    inventoryRequisitionQueryOptions(requisitionId)
  )

  const isRejectedOrCancelled =
    (detail.status === InventoryRequisitionStatus.CANCELLED ||
      detail.status === InventoryRequisitionStatus.REJECTED) &&
    Boolean(detail.rejectionReason)

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
        {isRejectedOrCancelled && (
          <StatusNotice
            title="Phiếu lãnh vật tư đã bị từ chối (Đã hủy)"
            reason={detail.rejectionReason!}
            actorName={detail.rejecterBy?.fullName}
            timestamp={detail.rejectedAt}
            extra={
              <p className="text-xs text-muted-foreground">
                Phiếu đã bị hủy. Vui lòng tạo phiếu mới nếu cần lãnh vật tư.
              </p>
            }
          />
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content: Thông tin header + Bảng danh sách vật tư lãnh */}
          <Surface>
            <InventoryRequisitionDetailHeader detail={detail} />
            <InventoryRequisitionItemsSection detail={detail} />
          </Surface>

          {/* Sidebar: Nhật ký mốc thời gian & phiếu xuất kho liên quan */}
          <div className="flex flex-col gap-4">
            <InventoryRequisitionInfoCard detail={detail} />
          </div>
        </div>
      </PageBody>
    </PageShell>
  )
}
