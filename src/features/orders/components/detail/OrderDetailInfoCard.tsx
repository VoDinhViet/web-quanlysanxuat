import { DateTime } from "luxon"
import { InfoCircle } from "@solar-icons/react"
import type { ReactNode } from "react"

import { OrderDetailSectionCard } from "@/features/orders/components/detail/OrderDetailSectionCard"
import { OrderStatusBadge } from "@/features/orders/components/OrderBadges"
import { currencyFormatter } from "@/lib/currency"
import { OrderDiscountType } from "@/lib/types/order.type"
import { paymentTermShortLabels } from "@/lib/types/payment-term.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailInfoCardProps = {
  order: OrderDetail
}

// A dense 2-column record of order facts, matching the reference layout —
// "Điều khoản giao hàng" has no backing field on `OrderDetail` yet, so it
// falls back to "--" like every other field the API hasn't populated.
// "Địa chỉ"/"Mã số thuế"/"Điện thoại"/"Email" read off `order.client` — the
// order itself no longer snapshots a contact (see order.type.ts's `Order`).
export function OrderDetailInfoCard({ order }: OrderDetailInfoCardProps) {
  return (
    <OrderDetailSectionCard icon={InfoCircle} title="Thông tin đơn hàng">
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        <div className="space-y-3">
          <InfoRow label="Mã đơn hàng" value={order.code} />
          <InfoRow label="Khách hàng" value={order.client?.name ?? "--"} />
          <InfoRow label="Địa chỉ" value={order.client?.address ?? "--"} />
          <InfoRow label="Mã số thuế" value={order.client?.taxCode ?? "--"} />
          <InfoRow
            label="Điện thoại"
            value={order.client?.phoneNumber ?? "--"}
          />
          <InfoRow label="Email" value={order.client?.email ?? "--"} />
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
                : "--"
            }
          />
          <InfoRow label="Điều khoản giao hàng" value="--" />
          <InfoRow
            label="Điều khoản thanh toán"
            value={
              order.paymentTerm
                ? paymentTermShortLabels[order.paymentTerm]
                : "--"
            }
          />
          <InfoRow
            label="Chiết khấu"
            value={
              order.discountType === OrderDiscountType.PERCENT
                ? `${currencyFormatter.format(order.discountValue)}% (${currencyFormatter.format(order.discountAmount)} ${order.currency})`
                : `${currencyFormatter.format(order.discountAmount)} ${order.currency}`
            }
          />
          <InfoRow
            label="Phí vận chuyển"
            value={`${currencyFormatter.format(order.shippingFee)} ${order.currency}`}
          />
          <InfoRow
            label="Nhân viên kinh doanh"
            value={order.assignedUser?.fullName ?? "--"}
          />
          <InfoRow
            label="Trạng thái"
            value={<OrderStatusBadge tone={order.status} />}
          />
          <InfoRow label="Ghi chú" value={order.note || "--"} />
        </div>
      </div>
    </OrderDetailSectionCard>
  )
}

type InfoRowProps = {
  label: string
  value: ReactNode
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] items-baseline gap-2 text-sm">
      <dt className="truncate text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-medium text-foreground">{value}</dd>
    </div>
  )
}
