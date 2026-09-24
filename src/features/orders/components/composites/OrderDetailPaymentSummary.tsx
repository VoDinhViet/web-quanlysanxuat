import { FileText } from "lucide-react"

import { formatSignedAmount } from "@/features/orders/constants/order-totals"
import { currencyFormatter, vndFormatter } from "@/lib/currency"
import { Currency, OrderDiscountType } from "@/lib/types/order.type"
import { paymentTermLabels } from "@/lib/types/payment-term.type"
import { toVietnameseCurrencyWords } from "@/lib/vietnamese-number-words"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailPaymentSummaryProps = {
  order: OrderDetail
}

export function OrderDetailPaymentSummary({
  order,
}: OrderDetailPaymentSummaryProps) {
  return (
    <div className="pt-2">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Cột trái: Ghi chú & Điều khoản đơn hàng */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="size-4" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Ghi chú & Điều khoản
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Ghi chú đơn hàng:</p>
              <p className="mt-0.5 leading-relaxed whitespace-pre-line">
                {order.note ? order.note : "Không có ghi chú kèm theo."}
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t border-border/40 pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Điều khoản thanh toán:
              </span>
              <span className="font-medium text-foreground">
                {order.paymentTerm
                  ? paymentTermLabels[order.paymentTerm]
                  : "Chưa xác định"}
              </span>
            </div>

            {order.currency !== Currency.VND && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tỷ giá quy đổi:</span>
                <span className="font-mono font-medium text-foreground tabular-nums">
                  1 {order.currency} = {vndFormatter.format(order.exchangeRate)}{" "}
                  VND
                </span>
              </div>
            )}

            <div className="pt-1">
              <span className="text-muted-foreground">
                Số tiền viết bằng chữ:{" "}
              </span>
              <span className="font-medium text-foreground italic">
                {toVietnameseCurrencyWords(order.totalVnd)}
              </span>
            </div>
          </div>
        </div>

        {/* Cột phải: Bảng chi tiết chi phí & Tổng thanh toán */}
        <div className="flex flex-col justify-between space-y-4 lg:border-l lg:border-border/60 lg:pl-10">
          <dl className="space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <dt>Tổng tiền hàng</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {currencyFormatter.format(order.subtotal)} {order.currency}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>
                Chiết khấu
                {order.discountType === OrderDiscountType.PERCENT &&
                order.discountValue > 0
                  ? ` (${currencyFormatter.format(order.discountValue)}%)`
                  : ""}
              </dt>
              <dd className="font-medium text-foreground tabular-nums">
                {formatSignedAmount(order.discountAmount, "−")} {order.currency}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Thuế VAT ({currencyFormatter.format(order.vatPercent)}%)</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {formatSignedAmount(order.vatAmount, "+")} {order.currency}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Phí vận chuyển</dt>
              <dd className="font-medium text-foreground tabular-nums">
                {formatSignedAmount(order.shippingFee, "+")} {order.currency}
              </dd>
            </div>
          </dl>

          <div className="border-t border-border/60 pt-3">
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-sm font-semibold text-foreground">
                Tổng thanh toán
              </span>
              <div className="text-right">
                <span className="font-mono text-2xl font-bold tracking-tight text-primary tabular-nums">
                  {currencyFormatter.format(order.total)}
                </span>
                <span className="ml-1 text-xs font-semibold text-primary">
                  {order.currency}
                </span>
                {order.currency !== Currency.VND && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                    ≈ {vndFormatter.format(order.totalVnd)} VND
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
