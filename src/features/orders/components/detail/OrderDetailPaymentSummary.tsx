import { formatSignedAmount } from "@/features/orders/order-totals"
import { currencyFormatter, vndFormatter } from "@/lib/currency"
import { Currency, OrderDiscountType } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

type OrderDetailPaymentSummaryProps = {
  order: OrderDetail
}

// The subtotal/discount/VAT/shipping/total box — real, server-computed
// (OrdersService.recalculateTotals) — sits directly under the items table it
// totals, right-aligned and styled as a torn receipt stub (see .receipt-stub
// in styles.css) so it reads like what it is: the total due on this order.
export function OrderDetailPaymentSummary({
  order,
}: OrderDetailPaymentSummaryProps) {
  const remainingAmount = order.total - order.paidAmount

  return (
    <div className="receipt-stub ml-auto w-full max-w-sm rounded-b-lg border border-border bg-muted/30 p-4 pt-6 sm:p-5 sm:pt-7">
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
          <dt className="text-muted-foreground">
            Chiết khấu
            {order.discountType === OrderDiscountType.PERCENT &&
            order.discountValue > 0
              ? ` (${currencyFormatter.format(order.discountValue)}%)`
              : ""}
          </dt>
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

      <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-primary/15 bg-primary/5 px-3 py-2.5">
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

      <dl className="mt-3 space-y-2 border-t border-dashed border-border pt-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Đã trả</dt>
          <dd className="text-foreground tabular-nums">
            {currencyFormatter.format(order.paidAmount)} {order.currency}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Còn phải trả</dt>
          <dd
            className={cn(
              "font-medium tabular-nums",
              remainingAmount > 0 ? "text-warning" : "text-success"
            )}
          >
            {currencyFormatter.format(remainingAmount)} {order.currency}
          </dd>
        </div>
      </dl>
    </div>
  )
}
