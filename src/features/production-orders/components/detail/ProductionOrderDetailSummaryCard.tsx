import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { ProductionOrderDetailActions } from "@/features/production-orders/components/detail/ProductionOrderDetailActions"
import { ProductionOrderStatusBadge } from "@/features/production-orders/components/ProductionOrderBadges"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

type ProductionOrderDetailSummaryCardProps = {
  production: ProductionOrderDetail
  hasUnsavedChanges: boolean
  isSaving: boolean
  onSave: () => void
}

// Identity + action buttons + a meta fact grid — same shell idiom as
// OrderDetailSummaryCard (a plain <section>, not the shadcn Card component).
export function ProductionOrderDetailSummaryCard({
  production,
  hasUnsavedChanges,
  isSaving,
  onSave,
}: ProductionOrderDetailSummaryCardProps) {
  const { order } = production

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <Link
              to="/manage/production-orders"
              search={{
                page: 1,
                limit: 10,
              }}
              className="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground print:hidden"
              aria-label="Quay lại danh sách LSX"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="min-w-0 truncate font-mono text-lg leading-snug font-semibold text-foreground sm:text-xl">
                  {order.code}
                </h2>
                <ProductionOrderStatusBadge tone={production.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                Lệnh sản xuất{" "}
                {production.code ? (
                  <span className="font-mono">{production.code}</span>
                ) : (
                  "(chưa cấp mã)"
                )}{" "}
                cho đơn hàng {order.code}
              </p>
            </div>
          </div>

          <ProductionOrderDetailActions
            production={production}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            onSave={onSave}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetaField label="Số đơn hàng (SO)" value={order.code} />
          <MetaField label="Khách hàng" value={order.client?.name ?? "—"} />
          <MetaField
            label="Ngày đặt đơn"
            value={DateTime.fromISO(order.orderDate).toFormat("dd/MM/yyyy")}
          />
          <MetaField
            label="Ngày giao"
            value={
              order.dueDate
                ? DateTime.fromISO(order.dueDate).toFormat("dd/MM/yyyy")
                : "Chưa xác định"
            }
          />
          <MetaField
            label="Ngày duyệt LSX"
            value={
              production.approvedAt
                ? DateTime.fromISO(production.approvedAt).toFormat(
                    "dd/MM/yyyy HH:mm"
                  )
                : "Chưa duyệt"
            }
          />
          <MetaField label="Ghi chú SO" value={order.note || "—"} />
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
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
