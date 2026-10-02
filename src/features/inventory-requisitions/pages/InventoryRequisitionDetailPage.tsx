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

  const isRejected = detail.status === InventoryRequisitionStatus.REJECTED
  // Cancelled after a rejection keeps the rejection reason on the record.
  const isRejectedOrCancelled =
    (detail.status === InventoryRequisitionStatus.CANCELLED || isRejected) &&
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
            title={
              isRejected
                ? "Phiếu lãnh vật tư bị từ chối"
                : "Phiếu lãnh vật tư đã bị từ chối và hủy"
            }
            reason={detail.rejectionReason!}
            actorName={detail.rejecterBy?.fullName}
            timestamp={detail.rejectedAt}
            extra={
              <p className="text-xs text-muted-foreground">
                {isRejected
                  ? "Bạn có thể gửi duyệt lại hoặc hủy phiếu."
                  : "Phiếu đã bị hủy. Vui lòng tạo phiếu mới nếu cần lãnh vật tư."}
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
