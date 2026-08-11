import { useEffect, useRef } from "react"
import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import { ComboboxField } from "@/components/shared/ComboboxField"
import type { ComboboxOption } from "@/components/shared/ComboboxField"
import { withForm } from "@/hooks/use-app-form"
import { useGetClientOptions } from "@/features/clients/api"
import { exchangeRateQueryOptions } from "@/features/orders/api/options"
import { resolveExchangeRatePlaceholder } from "@/features/orders/resolve-exchange-rate-placeholder"
import { updateOrderFormDefaultValues } from "@/features/orders/schemas/update-order.schema"
import {
  currencyLabels,
  Currency,
  orderStatusLabels,
  OrderStatus,
  paymentTermLabels,
} from "@/lib/types/order.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const currencyOptions = buildOptionsFromLabels(currencyLabels)
const paymentTermOptions = buildOptionsFromLabels(paymentTermLabels)
// AWAITING_PRODUCTION/REJECTED excluded: only reachable via the "Duyệt"/"Từ chối" actions
// (approve-order.api.ts/reject-order.api.ts), never settable directly through this form
// (order.error.status_not_settable_directly) — see the matching drop in update-order.api.ts.
const orderStatusOptions = buildOptionsFromLabels(orderStatusLabels).filter(
  (option) =>
    option.value !== OrderStatus.AWAITING_PRODUCTION &&
    option.value !== OrderStatus.REJECTED
)

// Auto-fills a starting rate on a non-VND currency pick (GET open.er-api.com
// via get-exchange-rate.api.ts), but the field stays editable — this only
// seeds it. Guards against clobbering a value that isn't its own: `appliedRef`
// tracks the {currency, rate} this component itself last wrote, and a fill
// only ever fires when the field's live value still equals that — so the
// order's own saved rate (which seeds the ref on mount) is never overwritten
// by a fetch, and neither is a value the user is mid-typing when a fetch
// resolves. Built with `withForm` (not a plain component taking `form:
// AnyFormApi`) because it needs `form.AppField`, only available on the
// form's own bound type.
const ExchangeRateField = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const currency = useField({ form, name: "currency" }).state.value
    const { data: rate, isFetching } = useQuery({
      ...exchangeRateQueryOptions(currency),
      enabled: currency !== Currency.VND,
    })

    const appliedRef = useRef({
      currency,
      rate: form.getFieldValue("exchangeRate"),
    })

    useEffect(() => {
      if (currency === appliedRef.current.currency) return

      const current = form.getFieldValue("exchangeRate")

      // Field no longer holds what we last wrote — someone else (the order's
      // own saved rate, a manual edit) owns it now. Adopt it and stop
      // auto-filling until the currency changes again.
      if (current !== appliedRef.current.rate) {
        appliedRef.current = { currency, rate: current }
        return
      }

      if (currency === Currency.VND) {
        form.setFieldValue("exchangeRate", "1")
        appliedRef.current = { currency, rate: "1" }
        return
      }

      // Clear while the fetch is in flight: lets the placeholder show, and
      // stops the previous currency's rate from sitting under the new
      // currency's label if this fetch fails.
      if (current !== "") {
        form.setFieldValue("exchangeRate", "")
        appliedRef.current = { ...appliedRef.current, rate: "" }
      }

      if (rate) {
        form.setFieldValue("exchangeRate", String(rate))
        appliedRef.current = { currency, rate: String(rate) }
      }
    }, [currency, rate, form])

    const placeholder = resolveExchangeRatePlaceholder(isFetching, rate)

    return (
      <form.AppField name="exchangeRate">
        {(field) => (
          <field.NumberField
            label={`Tỷ giá quy đổi (${currency === Currency.VND ? "so với VND" : "1 " + currency + " = ? VND"})`}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      </form.AppField>
    )
  },
})

export const UpdateOrderInfoSection = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: {
    disabled: false,
    orderCode: "",
    selectedClient: undefined as ComboboxOption | undefined,
  },
  render: function Render({ form, disabled, orderCode, selectedClient }) {
    const client = useGetClientOptions()

    return (
      <div className="drafting-title-block">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold tracking-wide text-foreground uppercase">
            Đơn hàng
          </h2>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Mã đơn hàng: {orderCode}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
          <form.Field name="clientId">
            {(field) => (
              <ComboboxField
                id={field.name}
                label="Khách hàng"
                required
                placeholder="Chọn khách hàng"
                value={field.state.value || undefined}
                onValueChange={(next) => field.handleChange(next ?? "")}
                onBlur={field.handleBlur}
                isInvalid={
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                }
                errors={field.state.meta.errors}
                options={client.options}
                onSearchChange={client.onSearchChange}
                isPending={client.isFetching}
                initialOption={selectedClient}
                emptyMessage="Không tìm thấy khách hàng"
                disabled={disabled}
              />
            )}
          </form.Field>

          <form.AppField name="assignedUserId">
            {(field) => (
              <field.SelectField
                label="Nhân viên kinh doanh"
                placeholder="Chọn nhân viên kinh doanh"
                options={[]}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="status">
            {(field) => (
              <field.SelectField
                label="Trạng thái đơn hàng"
                required
                options={orderStatusOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="orderDate">
            {(field) => (
              <field.DateField
                label="Ngày đặt hàng"
                required
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="dueDate">
            {(field) => (
              <field.DateField
                label="Ngày giao hàng yêu cầu"
                required
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="deliveryAddress">
            {(field) => (
              <field.TextareaField
                label="Địa chỉ giao hàng"
                placeholder="Nhập địa chỉ giao hàng"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
              />
            )}
          </form.AppField>

          <form.AppField name="paymentTerm">
            {(field) => (
              <field.SelectField
                label="Điều khoản thanh toán"
                placeholder="Chọn điều khoản"
                options={paymentTermOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="currency">
            {(field) => (
              <field.SelectField
                label="Tiền tệ"
                required
                options={currencyOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <ExchangeRateField form={form} disabled={disabled} />

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Ghi chú hiển thị trên đơn hàng"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-4"
              />
            )}
          </form.AppField>

          <form.AppField name="internalNote">
            {(field) => (
              <field.TextareaField
                label="Ghi chú nội bộ"
                placeholder="Ghi chú nội bộ (không hiển thị cho khách hàng)"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-4"
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
