import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import { InventoryRequisitionStatusBadge } from "@/features/inventory-requisitions/components/primitives/InventoryRequisitionBadges"
import { InventoryRequisitionDetailActions } from "@/features/inventory-requisitions/components/layouts/InventoryRequisitionDetailActions"
import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

type InventoryRequisitionDetailHeaderProps = {
  detail: InventoryRequisitionDetail
}

export function InventoryRequisitionDetailHeader({
  detail,
}: InventoryRequisitionDetailHeaderProps) {
  const isProductionType = detail.type === InventoryRequisitionType.PRODUCTION

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* Back + Code + Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton
            to="/manage/inventory-requisitions"
            search={{ page: 1, limit: 10 }}
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách lãnh vật tư"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </LinkButton>

          <span className="font-mono text-lg font-bold text-foreground">
            {detail.code}
          </span>
          <InventoryRequisitionStatusBadge status={detail.status} />
        </div>

        {/* 3-column MetaFields Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <MetaField
              label="Loại lãnh"
              value={isProductionType ? "Lãnh theo LSX" : "Lãnh khác"}
            />
            {detail.productionOrder ? (
              <>
                <MetaField
                  label="Đơn hàng (PO)"
                  value={
                    <Link
                      to="/manage/orders/$orderId"
                      params={{ orderId: detail.productionOrder.order.id }}
                      className="font-mono font-semibold text-primary hover:underline"
                    >
                      {detail.productionOrder.order.code}
                    </Link>
                  }
                />
                {detail.productionOrder.code && (
                  <MetaField
                    label="Mã LSX"
                    value={
                      <Link
                        to="/manage/production-orders/$productionOrderId"
                        params={{
                          productionOrderId: detail.productionOrder.id,
                        }}
                        className="font-mono font-semibold text-primary hover:underline"
                      >
                        {detail.productionOrder.code}
                      </Link>
                    }
                  />
                )}
              </>
            ) : null}
            {detail.reason && (
              <MetaField label="Lý do lãnh" value={detail.reason} />
            )}
          </div>

          <div className="flex flex-col gap-3">
            {detail.productionJob ? (
              <MetaField
                label="Job sản xuất"
                value={
                  <Link
                    to="/manage/production-jobs/$productionJobId"
                    params={{ productionJobId: detail.productionJob.id }}
                    search={{ tab: "info" }}
                    className="font-mono font-semibold text-primary hover:underline"
                  >
                    {detail.productionJob.code}
                  </Link>
                }
              />
            ) : null}
            <MetaField label="Bộ phận" value={detail.department?.name ?? "—"} />
            <MetaField
              label="Ngày lãnh"
              value={DateTime.fromISO(detail.requisitionDate).toFormat(
                "dd/MM/yyyy HH:mm"
              )}
            />
          </div>

          <div className="flex flex-col gap-3">
            <MetaField
              label="Người tạo"
              value={detail.creatorBy?.fullName ?? "—"}
            />
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
