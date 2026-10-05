import { Calculator } from "lucide-react"

import { currencyFormatter } from "@/lib/currency"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderSummaryCardProps = {
  purchaseOrder: PurchaseOrderDetail
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

// Tiền hàng/VAT/tổng tiền do BE tính (cùng công thức với số yêu cầu thanh toán chốt); dòng chưa có
// unitPrice tính 0 nên vẫn báo số dòng thiếu để không đánh lừa người dùng là tổng đã đầy đủ.
export function PurchaseOrderSummaryCard({
  purchaseOrder,
}: PurchaseOrderSummaryCardProps) {
  const totalQuantity = purchaseOrder.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )
  const totalReceived = purchaseOrder.items.reduce(
    (sum, item) => sum + item.receivedQuantity,
    0
  )
  const totalRemaining = Math.max(totalQuantity - totalReceived, 0)
  const missingUnitPriceCount = purchaseOrder.items.filter(
    (item) => item.unitPrice === null
  ).length

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Calculator className="size-4 text-muted-foreground" />
        Tóm tắt giá trị đơn
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Tổng SL đặt
          </p>
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {quantityFormatter.format(totalQuantity)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2">
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Đã nhận
            </p>
            <p className="text-sm font-semibold text-success tabular-nums">
              {quantityFormatter.format(totalReceived)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Còn lại
            </p>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {quantityFormatter.format(totalRemaining)}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 border-t border-border/50 pt-2">
          <SummaryRow
            label="Thành tiền (chưa thuế)"
            value={currencyFormatter.format(purchaseOrder.subtotal)}
          />
          <SummaryRow
            label={`Thuế VAT (${currencyFormatter.format(purchaseOrder.vatPercent)}%)`}
            value={currencyFormatter.format(purchaseOrder.vatAmount)}
          />
          <SummaryRow
            label="Chi phí khác"
            value={currencyFormatter.format(purchaseOrder.otherCost)}
          />
          {missingUnitPriceCount > 0 && (
            <p className="text-[11px] text-warning">
              Có {missingUnitPriceCount} dòng chưa nhập đơn giá
            </p>
          )}
        </div>

        <div className="space-y-1 border-t border-border/50 pt-2">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Tổng tiền (VNĐ)
          </p>
          <p className="text-base font-semibold text-foreground tabular-nums">
            {currencyFormatter.format(purchaseOrder.totalAmount)}
          </p>
        </div>
      </div>
    </section>
  )
}
