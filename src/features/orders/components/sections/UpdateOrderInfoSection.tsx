import { useEffect, useRef } from "react"
import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import type { ComboboxOption } from "@/components/shared/composites/ComboboxField"
import { exchangeRateQueryOptions } from "@/features/orders/api/options"
import { ClientPicker } from "@/features/orders/components/composites/ClientPicker"
import { resolveExchangeRatePlaceholder } from "@/features/orders/constants/resolve-exchange-rate-placeholder"
import { updateOrderFormDefaultValues } from "@/features/orders/schemas/update-order.schema"
import { withForm } from "@/hooks/use-app-form"
import { useGetUserOptions } from "@/features/users/api"
import {
  currencyLabels,
  Currency,
  orderStatusLabels,
  OrderStatus,
} from "@/lib/types/order.type"
import { paymentTermShortLabels } from "@/lib/types/payment-term.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const currencyOptions = buildOptionsFromLabels(currencyLabels)
const paymentTermOptions = buildOptionsFromLabels(paymentTermShortLabels)
// AWAITING_PRODUCTION/REJECTED excluded: only reachable via the "Duyệt"/"Từ chối" actions
// (approve-order.api.ts/reject-order.api.ts), never settable directly through this form
// (order.error.status_not_settable_directly) — see the matching drop in update-order.api.ts.
const orderStatusOptions = buildOptionsFromLabels(orderStatusLabels).filter(
  (option) =>
    option.value !== OrderStatus.AWAITING_PRODUCTION &&
    option.value !== OrderStatus.REJECTED
)

// Bước ① của wizard. Cùng khuôn CreateOrderInfoSection.tsx (TanStack Form), thêm subtitle mã
// đơn hàng thật và field `status` mà form Tạo không có. Tỷ giá auto-fill giữ inline trong
// Render, cùng lý do đã ghi ở CreateOrderInfoSection.tsx (AnyFormApi không mang `.AppField`).
export const UpdateOrderInfoSection = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: {
    disabled: false,
    orderCode: "",
    initialAssigneeOption: undefined as ComboboxOption | undefined,
  },
  render: function Render({
    form,
    disabled,
    orderCode,
    initialAssigneeOption,
  }) {
    const user = useGetUserOptions()

    const currency = useField({ form, name: "currency" }).state.value
    const consigneeAddressField = useField({ form, name: "consigneeAddress" })
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

      // Field no longer holds what we last wrote — someone else (the order's own saved
      // rate, a manual edit) owns it now. Adopt it and stop auto-filling until the
      // currency changes again.
      if (current !== appliedRef.current.rate) {
        appliedRef.current = { currency, rate: current }
        return
      }

      if (currency === Currency.VND) {
        form.setFieldValue("exchangeRate", 1)
        appliedRef.current = { currency, rate: 1 }
        return
      }

      if (current !== undefined) {
        form.setFieldValue("exchangeRate", undefined)
        appliedRef.current = { ...appliedRef.current, rate: undefined }
      }

      if (rate) {
        form.setFieldValue("exchangeRate", rate)
        appliedRef.current = { currency, rate }
      }
    }, [currency, rate, form])

    const exchangeRatePlaceholder = resolveExchangeRatePlaceholder(
      isFetching,
      rate
    )

    return (
      <div>
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold tracking-wide text-foreground uppercase">
            Đơn hàng
          </h2>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Mã đơn hàng: {orderCode}
          </p>
        </div>

        <div className="px-4 py-4 sm:px-5">
          <div className="grid grid-cols-1 items-start gap-x-6 gap-y-5 sm:grid-cols-2">
            <form.Field name="clientId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0

                return (
                  <Field data-invalid={isInvalid} className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium text-foreground">
                      Khách hàng <span className="text-destructive">*</span>
                    </FieldLabel>
                    <ClientPicker
                      value={field.state.value || undefined}
                      onValueChange={(next) => field.handleChange(next ?? "")}
                      onApplyAddress={(address) => {
                        consigneeAddressField.handleChange(address)
                        toast.success(
                          "Đã cập nhật Địa chỉ giao hàng theo khách hàng"
                        )
                      }}
                      onBlur={field.handleBlur}
                      isInvalid={isInvalid}
                      disabled={disabled}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="assignedUserId">
              {(field) => (
                <ComboboxField
                  id={field.name}
                  label="Nhân viên kinh doanh"
                  placeholder="Chọn nhân viên kinh doanh"
                  value={field.state.value || undefined}
                  onValueChange={(next) => field.handleChange(next ?? "")}
                  onBlur={field.handleBlur}
                  isInvalid={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                  }
                  errors={field.state.meta.errors}
                  options={user.options}
                  onSearchChange={user.onSearchChange}
                  isPending={user.isFetching}
                  initialOption={initialAssigneeOption}
                  emptyMessage="Không tìm thấy nhân viên"
                  disabled={disabled}
                />
              )}
            </form.Field>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
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

          <form.AppField name="consigneeAddress">
            {(field) => (
              <field.TextareaField
                label="Địa chỉ giao hàng"
                placeholder="Nhập địa chỉ giao hàng"
                disabled={disabled}
                className="sm:col-span-2"
                maxLength={500}
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

          <form.AppField name="exchangeRate">
            {(field) => (
              <field.NumberField
                label={`Tỷ giá quy đổi (${currency === Currency.VND ? "so với VND" : "1 " + currency + " = ? VND"})`}
                required
                placeholder={exchangeRatePlaceholder}
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

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Ghi chú hiển thị trên đơn hàng"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-4"
                maxLength={1000}
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
                maxLength={1000}
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
