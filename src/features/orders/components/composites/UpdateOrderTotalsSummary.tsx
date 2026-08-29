import { useField } from "@tanstack/react-form"

import { withForm } from "@/hooks/use-app-form"
import {
  computeOrderTotals,
  formatSignedAmount,
} from "@/features/orders/logic/order-totals"
import { updateOrderFormDefaultValues } from "@/features/orders/schemas/update-order.schema"
import { currencyFormatter, vndFormatter } from "@/lib/currency"
import { Currency, orderDiscountTypeLabels } from "@/lib/types/order.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const discountTypeOptions = buildOptionsFromLabels(orderDiscountTypeLabels)

export const UpdateOrderTotalsSummary = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const currencyField = useField({ form, name: "currency" })

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
                options={discountTypeOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="discountValue">
            {(field) => (
              <field.NumberField
                label="Giá trị chiết khấu"
                placeholder="0"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="vatPercent">
            {(field) => (
              <field.NumberField
                label="Thuế VAT (%)"
                placeholder="0"
                thousandSeparator={false}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="shippingFee">
            {(field) => (
              <field.NumberField
                label={`Phí vận chuyển (${currencyField.state.value})`}
                placeholder="0"
                disabled={disabled}
              />
            )}
          </form.AppField>
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
        selector={(state) => ({
          items: state.values.items,
          discountType: state.values.discountType,
          discountValue: state.values.discountValue,
          vatPercent: state.values.vatPercent,
          shippingFee: state.values.shippingFee,
          currency: state.values.currency,
          exchangeRate: state.values.exchangeRate,
        })}
      >
        {({
          items,
          discountType,
          discountValue,
          vatPercent,
          shippingFee,
          currency,
          exchangeRate,
        }) => {
          const totals = computeOrderTotals(
            items,
            discountType,
            discountValue ?? 0,
            vatPercent ?? 0,
            shippingFee ?? 0,
            exchangeRate ?? 0
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
                    {formatSignedAmount(shippingFee ?? 0, "+")}
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
                    {currency}
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
