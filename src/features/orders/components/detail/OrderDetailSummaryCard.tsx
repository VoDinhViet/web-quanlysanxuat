import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { OrderDetailActions } from "@/features/orders/components/detail/OrderDetailActions"
import { OrderDetailStatTiles } from "@/features/orders/components/detail/OrderDetailStatTiles"
import { OrderStatusBadge } from "@/features/orders/components/OrderBadges"
import { resolveMockPaymentStatus } from "@/features/orders/mock/order-detail.mock"
import {
  ORDER_MOCK_PAYMENT_STATUS_LABELS,
  OVERDUE_FILTER_VALUE,
  OrderStatus,
  PAYMENT_TERM_LABELS,
  resolveDeliveryTone,
} from "@/lib/types/order.type"
import type { DeliveryTone, OrderDetail } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

const DELIVERY_TONE_CLASSNAME: Record<DeliveryTone, string> = {
  overdue: "text-destructive",
  "near-due": "text-warning",
  normal: "text-foreground",
}

const PAYMENT_STATUS_CLASSNAME: Record<string, string> = {
  unpaid: "border-warning/40 bg-warning/5 text-warning",
  partially_paid: "border-warning/40 bg-warning/5 text-warning",
  paid: "border-success/40 bg-success/5 text-success",
}

function formatDueDateNote(order: OrderDetail): string | null {
  if (
    order.dueDate === null ||
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED
  ) {
    return null
  }

  const daysLeft = Math.ceil(
    DateTime.fromISO(order.dueDate)
      .startOf("day")
      .diff(DateTime.now().startOf("day"), "days").days
  )

  if (daysLeft < 0) {
    return `Trễ ${Math.abs(daysLeft)} ngày`
  }

  return daysLeft === 0 ? "Hôm nay" : `Còn ${daysLeft} ngày`
}

type OrderDetailSummaryCardProps = {
  order: OrderDetail
}

// Identity + action buttons + a 2x3 meta grid beside the 4 stat tiles — the
// block a reader scans first. A plain <section> (same shell as
// ProductDetailPage's own top section) rather than the shadcn Card
// component — its padding lives on this inner wrapper instead of Card's
// own --card-spacing, same idiom as the old OrderDetailHeader.
export function OrderDetailSummaryCard({ order }: OrderDetailSummaryCardProps) {
  const dueDateNote = formatDueDateNote(order)
  const deliveryTone = resolveDeliveryTone(order)
  // Not a real payment ledger yet — see order-detail-mock.ts. Rendered with a
  // dashed border (not MockDataBadge's own chip) so a single mixed-in field
  // reads as illustrative without repeating "Dữ liệu mẫu" across the grid.
  const paymentStatus = resolveMockPaymentStatus(order)

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <Link
              to="/manage/orders"
              search={{ page: 1, limit: 10 }}
              className="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground print:hidden"
              aria-label="Quay lại danh sách đơn hàng"
            >
              <AltArrowLeft className="size-4" />
            </Link>

            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="min-w-0 truncate font-mono text-lg leading-snug font-semibold text-foreground sm:text-xl">
                  {order.code}
                </h2>
                <OrderStatusBadge tone={order.status} />
                {order.expired ? (
                  <OrderStatusBadge tone={OVERDUE_FILTER_VALUE} />
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Tạo bởi{" "}
                <span className="font-medium text-foreground">
                  {order.creator?.username ?? "Hệ thống"}
                </span>{" "}
                ·{" "}
                {DateTime.fromISO(order.createdAt).toFormat("dd/MM/yyyy HH:mm")}
              </p>
            </div>
          </div>

          <OrderDetailActions order={order} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetaField label="Khách hàng" value={order.client.name} />
            <MetaField
              label="Người liên hệ"
              value={
                order.contactName ? (
                  <>
                    {order.contactName}
                    {order.contactPhone ? (
                      <>
                        {" "}
                        <span className="text-muted-foreground">
                          · {order.contactPhone}
                        </span>
                      </>
                    ) : null}
                  </>
                ) : (
                  "—"
                )
              }
            />
            <MetaField
              label="Ngày đặt hàng"
              value={DateTime.fromISO(order.orderDate).toFormat("dd/MM/yyyy")}
            />
            <MetaField
              label="Ngày giao hàng"
              value={
                order.dueDate ? (
                  <span className={DELIVERY_TONE_CLASSNAME[deliveryTone]}>
                    {DateTime.fromISO(order.dueDate).toFormat("dd/MM/yyyy")}
                    {dueDateNote ? ` (${dueDateNote})` : ""}
                  </span>
                ) : (
                  "Chưa xác định"
                )
              }
            />
            <MetaField
              label="Điều khoản thanh toán"
              value={
                order.paymentTerm ? PAYMENT_TERM_LABELS[order.paymentTerm] : "—"
              }
            />
            <MetaField
              label="Trạng thái thanh toán"
              value={
                <Badge
                  variant="outline"
                  className={cn(
                    "border-dashed",
                    PAYMENT_STATUS_CLASSNAME[paymentStatus]
                  )}
                >
                  {ORDER_MOCK_PAYMENT_STATUS_LABELS[paymentStatus]}
                </Badge>
              }
            />
          </div>

          <OrderDetailStatTiles order={order} />
        </div>
      </div>
    </section>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
}

function MetaField({ label, value }: MetaFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
