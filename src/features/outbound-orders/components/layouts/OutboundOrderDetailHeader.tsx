import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { OutboundOrderStatusBadge } from "@/features/outbound-orders/components/primitives/OutboundOrderBadges"
import { OutboundOrderDetailActions } from "@/features/outbound-orders/components/layouts/OutboundOrderDetailActions"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"
import { fulfillmentTypeLabels } from "@/lib/types/outbound-order.type"

type OutboundOrderDetailHeaderProps = {
  order: OutboundOrderDetail
  // Khi đang Sửa (BUG-090, edit-inline): ẩn meta grid tĩnh (form OutboundOrderEditForm.tsx thay
  // thế bằng field editable) và ẩn hàng nút thao tác (Gửi duyệt/Duyệt/Hủy... không hợp lý khi
  // đang sửa dở) — chỉ back/mã phiếu/badge còn hiển thị.
  isEditing: boolean
}

// Meta grid giữ field BE thật sự trả — client/fulfillmentDate/fulfillmentType (gốc) +
// deliveryAddress/receiverName/receiverPhone/vehicle (BUG-090, mở rộng theo UI Spec, đều
// nullable). Không có kho xuất — BE bỏ warehouseId khỏi outbound_orders.
export function OutboundOrderDetailHeader({
  order,
  isEditing,
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
            {order.code}
          </span>
          <OutboundOrderStatusBadge status={order.status} />
        </div>

        {!isEditing && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
            <MetaField label="Khách hàng" value={order.client.name} />
            <MetaField
              label="Ngày giao"
              value={DateTime.fromISO(order.fulfillmentDate).toFormat(
                "dd/MM/yyyy"
              )}
            />
            <MetaField
              label="Hình thức giao"
              value={fulfillmentTypeLabels[order.fulfillmentType]}
            />
            <MetaField
              label="Địa chỉ giao hàng"
              value={order.deliveryAddress ?? "—"}
            />
            <MetaField label="Người nhận" value={order.receiverName ?? "—"} />
            <MetaField label="Điện thoại" value={order.receiverPhone ?? "—"} />
            <MetaField label="Phương tiện" value={order.vehicle ?? "—"} />
          </div>
        )}
      </div>

      {!isEditing && <OutboundOrderDetailActions order={order} />}
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
