import { DateTime } from "luxon"
import { InfoCircle } from "@solar-icons/react"
import type { ReactNode } from "react"

import { OrderDetailSectionCard } from "@/features/orders/components/detail/OrderDetailSectionCard"
import { OrderStatusBadge } from "@/features/orders/components/OrderBadges"
import { buildMockClientProfile } from "@/features/orders/mock/order-detail.mock"
import { paymentTermLabels } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

type OrderDetailInfoCardProps = {
  order: OrderDetail
}

// A dense 2-column record of order facts, matching the reference layout —
// "Địa chỉ"/"Mã số thuế"/"Điều khoản giao hàng" have no backing field on
// `OrderClientRef`/`OrderDetail` yet, so they're built from
// buildMockClientProfile (order-detail-mock.ts) and flagged individually.
export function OrderDetailInfoCard({ order }: OrderDetailInfoCardProps) {
  const clientProfile = buildMockClientProfile(order)

  return (
    <OrderDetailSectionCard icon={InfoCircle} title="Thông tin đơn hàng">
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        <div className="space-y-3">
          <InfoRow label="Mã đơn hàng" value={order.code} />
          <InfoRow label="Khách hàng" value={order.client.name} />
          <InfoRow label="Địa chỉ" value={clientProfile.address} isMock />
          <InfoRow label="Mã số thuế" value={clientProfile.taxCode} isMock />
          <InfoRow label="Người liên hệ" value={order.contactName ?? "—"} />
          <InfoRow label="Điện thoại" value={order.contactPhone ?? "—"} />
          <InfoRow label="Email" value={order.contactEmail ?? "—"} />
        </div>

        <div className="space-y-3">
          <InfoRow
            label="Ngày đặt hàng"
            value={DateTime.fromISO(order.orderDate).toFormat("dd/MM/yyyy")}
          />
          <InfoRow
            label="Ngày giao hàng"
            value={
              order.dueDate
                ? DateTime.fromISO(order.dueDate).toFormat("dd/MM/yyyy")
                : "Chưa xác định"
            }
          />
          <InfoRow
            label="Điều khoản giao hàng"
            value={clientProfile.deliveryTerm}
            isMock
          />
          <InfoRow
            label="Điều khoản thanh toán"
            value={
              order.paymentTerm ? paymentTermLabels[order.paymentTerm] : "—"
            }
          />
          <InfoRow
            label="Nhân viên kinh doanh"
            value={order.staff?.fullName ?? "—"}
          />
          <InfoRow
            label="Trạng thái"
            value={<OrderStatusBadge tone={order.status} />}
          />
          <InfoRow label="Ghi chú" value={order.note || "Chưa có ghi chú"} />
        </div>
      </div>

      <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="border-b border-dashed border-warning text-warning">
          Gạch dưới
        </span>{" "}
        — dữ liệu mẫu, chờ bổ sung trường tương ứng.
      </p>
    </OrderDetailSectionCard>
  )
}

type InfoRowProps = {
  label: string
  value: ReactNode
  isMock?: boolean
}

function InfoRow({ label, value, isMock }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] items-baseline gap-2 text-sm">
      <dt className="truncate text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 truncate font-medium text-foreground",
          isMock && "w-fit border-b border-dashed border-warning text-warning"
        )}
      >
        {value}
      </dd>
    </div>
  )
}
