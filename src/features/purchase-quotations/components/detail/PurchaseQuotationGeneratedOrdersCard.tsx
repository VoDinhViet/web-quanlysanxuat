import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"
import { Bill } from "@solar-icons/react"

import { purchaseOrdersByQuotationOptions } from "@/features/purchase-orders/api"
import { purchaseOrderStatusLabels } from "@/lib/types/purchase-order.type"
import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationGeneratedOrdersCardProps = {
  detail: PurchaseQuotationDetail
}

// Chỉ có ý nghĩa sau khi RFQ đã APPROVED (approve mới sinh PO nháp) — client-interactive read
// (không loader-prefetch, mirror use-get-client-options.ts idiom cho reads bật theo điều kiện).
// Mã đơn giờ link được sang trang chi tiết đơn mua thật. Vẫn đọc trạng thái bằng text (labels
// từ purchase-order.type.ts) chứ không phải PurchaseOrderStatusBadge — badge đó sống trong
// components/ của feature purchase-orders, import cross-feature qua đó là phạm "Layer
// boundaries" (chỉ được đọc chéo qua api/index.ts barrel).
export function PurchaseQuotationGeneratedOrdersCard({
  detail,
}: PurchaseQuotationGeneratedOrdersCardProps) {
  const isApproved = detail.status === PurchaseQuotationStatus.APPROVED

  const ordersQuery = useQuery({
    ...purchaseOrdersByQuotationOptions(detail.id),
    enabled: isApproved,
  })

  const orders = ordersQuery.data ?? []

  if (!isApproved || orders.length === 0) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Bill className="size-4 text-muted-foreground" />
        Đơn mua đã sinh
      </div>
      <ul className="divide-y divide-border/60">
        {orders.map((order) => (
          <li key={order.id} className="flex flex-col gap-1 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-2">
              <Link
                to="/manage/purchase-orders/$purchaseOrderId"
                params={{ purchaseOrderId: order.id }}
                className="font-mono text-sm font-semibold text-primary hover:underline"
              >
                {order.code}
              </Link>
              <span className="text-xs text-muted-foreground">
                {purchaseOrderStatusLabels[order.status]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {order.supplier.name} · {order.itemCount} dòng ·{" "}
              {DateTime.fromISO(order.orderDate).toFormat("dd/MM/yyyy")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
