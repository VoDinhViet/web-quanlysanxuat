import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { InventoryRequisitionStatusBadge } from "@/features/inventory-requisitions/components/InventoryRequisitionBadges"
import { InventoryRequisitionSourceCell } from "@/features/inventory-requisitions/components/InventoryRequisitionsTableCells"
import { InventoryRequisitionDetailActions } from "@/features/inventory-requisitions/components/detail/InventoryRequisitionDetailActions"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type InventoryRequisitionDetailHeaderProps = {
  detail: InventoryRequisitionDetail
}

export function InventoryRequisitionDetailHeader({
  detail,
}: InventoryRequisitionDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-4">
        {/* Back + Code + Badge */}
        <div className="flex flex-wrap items-center gap-3">
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

          <span className="font-mono text-lg font-bold text-foreground">
            {detail.code}
          </span>
          <InventoryRequisitionStatusBadge status={detail.status} />
        </div>

        {/* 3-column MetaFields Grid */}
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
      </div>

      <InventoryRequisitionDetailActions detail={detail} />
    </div>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
}

function MetaField({ label, value }: MetaFieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
