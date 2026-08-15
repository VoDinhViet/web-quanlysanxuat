import { Calculator } from "lucide-react"

import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderSummaryCardProps = {
  purchaseOrder: PurchaseOrderDetail
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const amountFormatter = new Intl.NumberFormat("vi-VN")

// PurchaseOrderDetail (detail DTO) không có sẵn totalAmount (khác PurchaseOrder của màn danh
// sách, DTO riêng có aggregate) — tính thẳng từ items[] ở đây, bỏ qua dòng chưa có unitPrice khi
// cộng tiền nhưng vẫn báo rõ số dòng thiếu để không đánh lừa người dùng là tổng đã đầy đủ.
export function PurchaseOrderSummaryCard({
  purchaseOrder,
}: PurchaseOrderSummaryCardProps) {
  const totalQuantity = purchaseOrder.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )
  const totalAmount = purchaseOrder.items.reduce(
    (sum, item) => sum + item.quantity * (item.unitPrice ?? 0),
    0
  )
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

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Tổng giá trị (VNĐ)
          </p>
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {amountFormatter.format(totalAmount)}
          </p>
          {missingUnitPriceCount > 0 && (
            <p className="text-[11px] text-warning">
              Có {missingUnitPriceCount} dòng chưa nhập đơn giá
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
