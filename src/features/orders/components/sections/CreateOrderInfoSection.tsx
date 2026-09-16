import { useEffect, useRef } from "react"
import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import { exchangeRateQueryOptions } from "@/features/orders/api/options"
import { ClientPicker } from "@/features/orders/components/composites/ClientPicker"
import { resolveExchangeRatePlaceholder } from "@/features/orders/constants/resolve-exchange-rate-placeholder"
import { createOrderFormDefaultValues } from "@/features/orders/schemas/create-order.schema"
import { withForm } from "@/hooks/use-app-form"
import { useGetUserOptions } from "@/features/users/api"
import { currencyLabels, Currency } from "@/lib/types/order.type"
import { paymentTermShortLabels } from "@/lib/types/payment-term.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const currencyOptions = buildOptionsFromLabels(currencyLabels)
const paymentTermOptions = buildOptionsFromLabels(paymentTermShortLabels)

// Bước ① của wizard. `clientId`/`assignedUserId` chưa có trong AppFormFields.tsx's kit →
// `form.Field` render-prop trần bọc `ComboboxField`, đúng idiom UpdateProductInfoSection.tsx. Tỷ
// giá auto-fill theo tiền tệ nằm trực tiếp trong Render (không tách hàm riêng): `form` ở đây có
// kiểu `AppFieldExtendedReactFormApi<...>` do `withForm` gán — tách thành 1 function riêng sẽ
// phải viết tay lại generic đó, không dùng `AnyFormApi` được (kiểu đó không mang theo
// `.AppField`, xem UnitScopesField.tsx).
export const CreateOrderInfoSection = withForm({
  defaultValues: createOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const user = useGetUserOptions()

    // Auto-fills a starting rate on a non-VND currency pick (GET open.er-api.com via
    // get-exchange-rate.api.ts), but the field stays editable — this only seeds it. Guards
    // against clobbering a value that isn't its own: `appliedRef` tracks the {currency, rate}
    // this component itself last wrote, and a fill only ever fires when the field's live value
    // still equals that — so a rate restored from a saved draft, or one the user is mid-typing
    // when a fetch resolves, is adopted as-is instead of overwritten.
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

      // Field no longer holds what we last wrote — someone else (a restored
      // draft, a manual edit) owns it now. Adopt it and stop auto-filling
      // until the currency changes again.
      if (current !== appliedRef.current.rate) {
        appliedRef.current = { currency, rate: current }
        return
      }

      if (currency === Currency.VND) {
        form.setFieldValue("exchangeRate", 1)
        appliedRef.current = { currency, rate: 1 }
        return
      }

      // Clear while the fetch is in flight: lets the placeholder show, and
      // stops the previous currency's rate from sitting under the new
      // currency's label if this fetch fails.
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
            Mã đơn hàng: sẽ cấp sau khi lưu
          </p>
        </div>

        {/* Khách hàng & phụ trách tách riêng khỏi lưới 4 cột bên dưới — đây là 2 quyết định "ai"
            quan trọng nhất của đơn, làm trước khi điền chi tiết ngày/thanh toán/tiền tệ. */}
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
                      onClientSelect={(client) => {
                        if (
                          client?.address &&
                          !consigneeAddressField.state.value
                        ) {
                          consigneeAddressField.handleChange(client.address)
                          toast.info(
                            "Đã tự động điền địa chỉ của khách hàng vào Địa chỉ giao hàng"
                          )
                        }
                      }}
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
