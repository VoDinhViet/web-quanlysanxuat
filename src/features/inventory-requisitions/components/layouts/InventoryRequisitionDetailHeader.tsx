import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DetailHeader } from "@/components/shared/layouts/DetailHeader"
import { MetaField } from "@/components/shared/primitives/InfoFields"
import { InventoryRequisitionStatusBadge } from "@/features/inventory-requisitions/components/primitives/InventoryRequisitionBadges"
import { InventoryRequisitionSourceCell } from "@/features/inventory-requisitions/components/primitives/InventoryRequisitionsTableCells"
import { InventoryRequisitionDetailActions } from "@/features/inventory-requisitions/components/layouts/InventoryRequisitionDetailActions"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type InventoryRequisitionDetailHeaderProps = {
  detail: InventoryRequisitionDetail
}

export function InventoryRequisitionDetailHeader({
  detail,
}: InventoryRequisitionDetailHeaderProps) {
  return (
    <DetailHeader
      back={
        <Button
          variant="ghost"
          className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Quay lại danh sách lãnh vật tư"
          asChild
        >
          <Link
            to="/manage/inventory-requisitions"
            search={{ page: 1, limit: 10 }}
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>
        </Button>
      }
      code={detail.code}
      badge={<InventoryRequisitionStatusBadge status={detail.status} />}
      meta={
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <MetaField
              label="PO / Lý do"
              value={
                <InventoryRequisitionSourceCell
                  productionOrder={detail.productionOrder}
                  reason={detail.reason}
                />
              }
            />
            <MetaField label="Kho lãnh" value={detail.warehouse.name} />
            <MetaField label="Bộ phận" value={detail.department?.name ?? "—"} />
          </div>

          <div className="flex flex-col gap-4">
            <MetaField label="Job" value={detail.productionJob?.code ?? "—"} />
            <MetaField
              label="Ngày lãnh"
              value={DateTime.fromISO(detail.requisitionDate).toFormat(
                "dd/MM/yyyy HH:mm"
              )}
            />
            <MetaField
              label="Người tạo"
              value={detail.creatorBy?.fullName ?? "—"}
            />
          </div>

          <div className="flex flex-col gap-4">
            <MetaField
              label="Ghi chú"
              value={detail.note ?? "Không có ghi chú"}
            />
          </div>
        </div>
      }
      actions={<InventoryRequisitionDetailActions detail={detail} />}
    />
  )
}
