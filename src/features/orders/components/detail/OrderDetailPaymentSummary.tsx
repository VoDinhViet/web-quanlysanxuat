import { formatSignedAmount } from "@/features/orders/order-totals"
import { currencyFormatter, vndFormatter } from "@/lib/currency"
import { Currency } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailPaymentSummaryProps = {
  order: OrderDetail
}

// The subtotal/discount/VAT/shipping/total box — real, server-computed
// (OrdersService.recalculateTotals) — sits directly under the items table it
// totals, right-aligned so it reads like a receipt footer.
export function OrderDetailPaymentSummary({
  order,
}: OrderDetailPaymentSummaryProps) {
  return (
    <div className="ml-auto w-full max-w-sm rounded-lg border border-border bg-muted/20 p-4 sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
        Thanh toán
      </p>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Tổng tiền hàng</dt>
          <dd className="text-foreground tabular-nums">
            {currencyFormatter.format(order.subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Chiết khấu</dt>
          <dd className="text-foreground tabular-nums">
            {formatSignedAmount(order.discountAmount, "−")}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">
            Thuế VAT ({currencyFormatter.format(order.vatPercent)}%)
          </dt>
          <dd className="text-foreground tabular-nums">
            {formatSignedAmount(order.vatAmount, "+")}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Phí vận chuyển</dt>
          <dd className="text-foreground tabular-nums">
            {formatSignedAmount(order.shippingFee, "+")}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-end justify-between border-t border-dashed border-border pt-3">
        <span className="font-heading text-sm text-foreground">
          Tổng thanh toán
        </span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-primary tabular-nums">
            {currencyFormatter.format(order.total)}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {order.currency}
          </span>
        </span>
      </div>

      {order.currency !== Currency.VND ? (
        <p className="mt-1 text-right text-xs text-muted-foreground tabular-nums">
          ≈ {vndFormatter.format(order.totalVnd)} VND
        </p>
      ) : null}
    </div>
  )
}
