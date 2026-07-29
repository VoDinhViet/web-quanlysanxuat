import { withForm } from "@/hooks/use-app-form"
import {
  computeOrderTotals,
  formatSignedAmount,
} from "@/features/orders/order-totals"
import { updateOrderFormDefaultValues } from "@/features/orders/schemas/update-order.schema"
import type { OrderItemFormValue } from "@/features/orders/schemas/order-item-form.schema"
import { currencyFormatter, vndFormatter } from "@/lib/currency"
import { Currency, ORDER_DISCOUNT_TYPE_LABELS } from "@/lib/types/order.type"
import type { OrderDiscountType } from "@/lib/types/order.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const DISCOUNT_TYPE_OPTIONS = buildOptionsFromLabels(ORDER_DISCOUNT_TYPE_LABELS)

export const UpdateOrderTotalsSummary = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    return (
      <div className="space-y-3">
        <div>
          <span className="block text-sm font-semibold text-foreground">
            Thanh toán
          </span>
          <p className="text-[11px] text-muted-foreground">
            Áp dụng cho toàn bộ đơn hàng
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
  defaultValues: updateOrderFormDefaultValues,
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
          state.values.exchangeRate,
        ]}
      >
        {([
          items,
          discountType,
          discountValue,
          vatPercent,
          shippingFee,
          currency,
          exchangeRate,
        ]) => {
          const totals = computeOrderTotals(
            items as OrderItemFormValue[],
            discountType as OrderDiscountType,
            Number(discountValue) || 0,
            Number(vatPercent) || 0,
            Number(shippingFee) || 0,
            Number(exchangeRate) || 0
          )

          return (
            <div className="border-t border-dashed border-border pt-4">
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

              {currency !== Currency.VND && (
                <p className="mt-1 text-right text-xs text-muted-foreground tabular-nums">
                  ≈ {vndFormatter.format(totals.totalVnd)} VND
                </p>
              )}

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
