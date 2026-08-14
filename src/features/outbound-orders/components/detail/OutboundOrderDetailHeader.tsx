import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { OutboundOrderStatusBadge } from "@/features/outbound-orders/components/OutboundOrderBadges"
import { OutboundOrderDetailActions } from "@/features/outbound-orders/components/detail/OutboundOrderDetailActions"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"
import { outboundDeliveryMethodLabels } from "@/lib/types/outbound-order.type"

type OutboundOrderDetailHeaderProps = {
  detail: OutboundOrderDetail
}

export function OutboundOrderDetailHeader({
  detail,
}: OutboundOrderDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-4">
        {/* Back + Code + Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách đơn giao hàng"
            asChild
          >
            <Link to="/manage/outbound-orders" search={{ page: 1, limit: 20 }}>
              <AltArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {detail.code}
          </span>
          <OutboundOrderStatusBadge status={detail.status} />
        </div>

        {/* 3-column MetaFields Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <MetaField label="Khách hàng" value={detail.clientName} />
            <MetaField label="PO / Lý do" value={detail.poOrReason} />
            <MetaField
              label="Địa chỉ giao"
              value={detail.deliveryAddress ?? "—"}
            />
          </div>

          <div className="flex flex-col gap-4">
            <MetaField
              label="Ngày tạo"
              value={DateTime.fromISO(detail.createdAt).toFormat(
                "dd/MM/yyyy HH:mm"
              )}
            />
            <MetaField
              label="Hình thức giao"
              value={outboundDeliveryMethodLabels[detail.deliveryMethod]}
            />
            <MetaField
              label="Tài xế / SĐT"
              value={
                detail.driverName
                  ? `${detail.driverName} (${detail.driverPhone ?? "—"})`
                  : "—"
              }
            />
          </div>

          <div className="flex flex-col gap-4">
            <MetaField
              label="Tổng SL giao"
              value={`${detail.totalQuantity} ${detail.unit}`}
            />
            <MetaField
              label="Ghi chú"
              value={detail.note ?? "Không có ghi chú"}
            />
          </div>
        </div>
      </div>

      <OutboundOrderDetailActions detail={detail} />
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
