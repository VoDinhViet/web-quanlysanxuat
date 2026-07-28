import { currencyFormatter, vndFormatter } from "@/lib/currency"
import { formatSignedAmount } from "@/features/orders/order-totals"
import {
  CURRENCY_LABELS,
  Currency,
  PAYMENT_TERM_LABELS,
} from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailInfoTabProps = {
  order: OrderDetail
}

// Everything here is real, server-computed data (payment terms, currency, the
// price breakdown) — the facts already shown in the header/stat row/sidebar
// (client, dates, totals) aren't repeated a second time in this tab.
export function OrderDetailInfoTab({ order }: OrderDetailInfoTabProps) {
  return (
    <div className="space-y-6 p-4 sm:p-5">
      <section>
        <h3 className="text-sm font-semibold text-foreground">
          Điều khoản đơn hàng
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoField
            label="Điều khoản thanh toán"
            value={
              order.paymentTerm ? PAYMENT_TERM_LABELS[order.paymentTerm] : "—"
            }
          />
          <InfoField label="Tiền tệ" value={CURRENCY_LABELS[order.currency]} />
          {order.currency !== Currency.VND ? (
            <InfoField
              label="Tỷ giá quy đổi (VND)"
              value={currencyFormatter.format(order.exchangeRate)}
            />
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-muted/20 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-foreground">Thanh toán</h3>

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
      </section>
    </div>
  )
}

type InfoFieldProps = {
  label: string
  value: string
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
