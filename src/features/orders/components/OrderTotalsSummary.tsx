import { withForm } from "@/hooks/use-app-form"
import { ORDER_FORM_DEFAULT_VALUES } from "@/features/orders/schemas/order-form.schema"
import type { OrderItemFormValue } from "@/features/orders/schemas/order-form.schema"
import {
  ORDER_DISCOUNT_TYPE_LABELS,
  OrderDiscountType,
  OrderItemStatus,
} from "@/lib/types/order.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { Currency } from "@/lib/types/order.type"

const currencyFormatter = new Intl.NumberFormat("vi-VN")
const DISCOUNT_TYPE_OPTIONS = buildOptionsFromLabels(ORDER_DISCOUNT_TYPE_LABELS)

// Mirrors OrdersService.recalculateTotals exactly (be-quanlysanxuat) so the
// preview matches what the server will compute — this is still only an
// estimate, the authoritative numbers come back on the created order.
function computeTotals(
  items: OrderItemFormValue[],
  discountType: OrderDiscountType,
  discountValue: number,
  vatPercent: number,
  shippingFee: number
) {
  const subtotal = items
    .filter((item) => item.status !== OrderItemStatus.CANCELLED)
    .reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0
      const unitPrice = Number(item.unitPrice) || 0
      const discountPercent = Number(item.discountPercent) || 0

      return sum + quantity * unitPrice * (1 - discountPercent / 100)
    }, 0)

  const discountAmount =
    discountType === OrderDiscountType.PERCENT
      ? (subtotal * discountValue) / 100
      : discountValue

  const vatAmount = ((subtotal - discountAmount) * vatPercent) / 100
  const total = subtotal - discountAmount + vatAmount + shippingFee

  return { subtotal, discountAmount, vatAmount, total }
}

// Renders "" for a zero amount instead of a bare "+0"/"−0" — a sign in front
// of nothing reads as a rendering glitch, not as information.
function formatSignedAmount(amount: number, sign: "+" | "−"): string {
  return amount > 0
    ? `${sign}${currencyFormatter.format(amount)}`
    : currencyFormatter.format(0)
}

export const OrderTotalsSummary = withForm({
  defaultValues: ORDER_FORM_DEFAULT_VALUES,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    return (
      <div className="space-y-3">
        <div>
          <span className="block text-sm font-semibold text-foreground">
            Chiết khấu & thanh toán
          </span>
          <p className="text-[11px] text-muted-foreground">
            Áp dụng cho toàn bộ đơn hàng
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
          <form.AppField name="discountType">
            {(field) => (
              <field.SelectField
                label="Loại chiết khấu"
                options={DISCOUNT_TYPE_OPTIONS}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="discountValue">
            {(field) => (
              <field.TextField
                label="Giá trị chiết khấu"
                type="number"
                placeholder="0"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="vatPercent">
            {(field) => (
              <field.TextField
                label="Thuế VAT (%)"
                type="number"
                placeholder="0"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.Subscribe selector={(state) => state.values.currency}>
            {(currency) => (
              <form.AppField name="shippingFee">
                {(field) => (
                  <field.TextField
                    label={`Phí vận chuyển (${currency})`}
                    type="number"
                    placeholder="0"
                    disabled={disabled}
                  />
                )}
              </form.AppField>
            )}
          </form.Subscribe>
        </div>

        <OrderTotalsPreview form={form} />
      </div>
    )
  },
})

const OrderTotalsPreview = withForm({
  defaultValues: ORDER_FORM_DEFAULT_VALUES,
  render: function Render({ form }) {
    return (
      <form.Subscribe
        selector={(state) => [
          state.values.items,
          state.values.discountType,
          state.values.discountValue,
          state.values.vatPercent,
          state.values.shippingFee,
          state.values.currency,
        ]}
      >
        {([
          items,
          discountType,
          discountValue,
          vatPercent,
          shippingFee,
          currency,
        ]) => {
          const totals = computeTotals(
            items as OrderItemFormValue[],
            discountType as OrderDiscountType,
            Number(discountValue) || 0,
            Number(vatPercent) || 0,
            Number(shippingFee) || 0
          )

          return (
            <div className="rounded-lg border border-border/60 bg-card p-4 shadow-card">
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Tổng tiền hàng</dt>
                  <dd className="text-foreground tabular-nums">
                    {currencyFormatter.format(totals.subtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Chiết khấu</dt>
                  <dd className="text-foreground tabular-nums">
                    {formatSignedAmount(totals.discountAmount, "−")}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Thuế VAT</dt>
                  <dd className="text-foreground tabular-nums">
                    {formatSignedAmount(totals.vatAmount, "+")}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Phí vận chuyển</dt>
                  <dd className="text-foreground tabular-nums">
                    {formatSignedAmount(Number(shippingFee) || 0, "+")}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 flex items-end justify-between border-t border-dashed border-border pt-3">
                <span className="font-heading text-sm text-foreground">
                  Tổng thanh toán
                </span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-primary tabular-nums">
                    {currencyFormatter.format(totals.total)}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {currency as Currency}
                  </span>
                </span>
              </div>

              <p className="mt-3 text-[11px] text-muted-foreground">
                Số liệu tạm tính, số cuối cùng lấy sau khi lưu đơn hàng.
              </p>
            </div>
          )
        }}
      </form.Subscribe>
    )
  },
})
