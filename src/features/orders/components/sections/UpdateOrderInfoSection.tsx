import { useEffect, useRef } from "react"
import { Controller, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { NumericFormat } from "react-number-format"
import type { UseFormReturn } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import type { ComboboxOption } from "@/components/shared/composites/ComboboxField"
import { DatePicker } from "@/components/shared/composites/DatePicker"
import { useGetClientOptions } from "@/features/clients/api"
import { exchangeRateQueryOptions } from "@/features/orders/api/options"
import { resolveExchangeRatePlaceholder } from "@/features/orders/logic/resolve-exchange-rate-placeholder"
import type { UpdateOrderSchema } from "@/features/orders/schemas/update-order.schema"
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

type ExchangeRateFieldProps = {
  form: UseFormReturn<UpdateOrderSchema>
  disabled: boolean
}

// Auto-fills a starting rate on a non-VND currency pick (GET open.er-api.com via
// get-exchange-rate.api.ts), but the field stays editable — this only seeds it. Guards against
// clobbering a value that isn't its own: `appliedRef` tracks the {currency, rate} this component
// itself last wrote, and a fill only ever fires when the field's live value still equals that —
// so the order's own saved rate (which seeds the ref on mount) is never overwritten by a fetch,
// and neither is a value the user is mid-typing when a fetch resolves. Plain function (not
// `withForm`) under react-hook-form — `form`/`useWatch` work the same in any component that has
// the shared `control`, no bound-type wrapper needed.
function ExchangeRateField({ form, disabled }: ExchangeRateFieldProps) {
  const currency = useWatch({
    control: form.control,
    name: "currency",
    defaultValue: Currency.VND,
  })
  const { data: rate, isFetching } = useQuery({
    ...exchangeRateQueryOptions(currency),
    enabled: currency !== Currency.VND,
  })

  const appliedRef = useRef({
    currency,
    rate: form.getValues("exchangeRate"),
  })

  useEffect(() => {
    if (currency === appliedRef.current.currency) return

    const current = form.getValues("exchangeRate")

    // Field no longer holds what we last wrote — someone else (the order's
    // own saved rate, a manual edit) owns it now. Adopt it and stop
    // auto-filling until the currency changes again.
    if (current !== appliedRef.current.rate) {
      appliedRef.current = { currency, rate: current }
      return
    }

    if (currency === Currency.VND) {
      form.setValue("exchangeRate", 1, { shouldDirty: true })
      appliedRef.current = { currency, rate: 1 }
      return
    }

    // Clear while the fetch is in flight: lets the placeholder show, and
    // stops the previous currency's rate from sitting under the new
    // currency's label if this fetch fails.
    if (current !== undefined) {
      form.setValue("exchangeRate", undefined, { shouldDirty: true })
      appliedRef.current = { ...appliedRef.current, rate: undefined }
    }

    if (rate) {
      form.setValue("exchangeRate", rate, { shouldDirty: true })
      appliedRef.current = { currency, rate }
    }
  }, [currency, rate, form])

  const placeholder = resolveExchangeRatePlaceholder(isFetching, rate)

  return (
    <Controller
      control={form.control}
      name="exchangeRate"
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel
            htmlFor={field.name}
            className="text-xs font-medium text-foreground"
          >
            {`Tỷ giá quy đổi (${currency === Currency.VND ? "so với VND" : "1 " + currency + " = ? VND"})`}
          </FieldLabel>
          <NumericFormat
            customInput={Input}
            id={field.name}
            name={field.name}
            placeholder={placeholder}
            className="h-9 bg-background text-xs"
            value={field.value ?? ""}
            thousandSeparator="."
            decimalSeparator=","
            allowNegative={false}
            onBlur={field.onBlur}
            onValueChange={(values) => field.onChange(values.floatValue)}
            aria-invalid={!!fieldState.error}
            disabled={disabled}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}

type UpdateOrderInfoSectionProps = {
  form: UseFormReturn<UpdateOrderSchema>
  disabled: boolean
  orderCode: string
  initialClientOption: ComboboxOption | undefined
  initialAssigneeOption: ComboboxOption | undefined
}

// Bước ① của wizard. Mỗi field là 1 <Controller> viết tại chỗ — không có shared RHF field kit,
// xem forms-and-ui.md. `assignedUserId` đổi từ Select (trước đây options={[]} hardcode rỗng,
// không bao giờ có dữ liệu) sang Combobox tìm-server, giống `clientId` bên cạnh — cùng bug đã sửa
// bên CreateOrderInfoSection.tsx. So với bước ① Tạo: thêm subtitle mã đơn hàng thật, thêm field
// `status`, và 2 combobox cần `initialOption` (đơn đã tồn tại, không phải form rỗng).
export function UpdateOrderInfoSection({
  form,
  disabled,
  orderCode,
  initialClientOption,
  initialAssigneeOption,
}: UpdateOrderInfoSectionProps) {
  const client = useGetClientOptions()
  const user = useGetUserOptions()

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

      {/* Khách hàng & phụ trách tách riêng khỏi lưới 4 cột bên dưới — cùng hình dạng đã chốt ở
          CreateOrderInfoSection.tsx (không viền, không nền). */}
      <div className="px-4 py-4 sm:px-5">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="clientId"
            render={({ field, fieldState }) => (
              <ComboboxField
                id={field.name}
                label="Khách hàng"
                required
                placeholder="Chọn khách hàng"
                value={field.value || undefined}
                onValueChange={(next) => field.onChange(next ?? "")}
                onBlur={field.onBlur}
                isInvalid={!!fieldState.error}
                errors={[fieldState.error]}
                options={client.options}
                onSearchChange={client.onSearchChange}
                isPending={client.isFetching}
                initialOption={initialClientOption}
                emptyMessage="Không tìm thấy khách hàng"
                disabled={disabled}
              />
            )}
          />

          <Controller
            control={form.control}
            name="assignedUserId"
            render={({ field, fieldState }) => (
              <ComboboxField
                id={field.name}
                label="Nhân viên kinh doanh"
                placeholder="Chọn nhân viên kinh doanh"
                value={field.value || undefined}
                onValueChange={(next) => field.onChange(next ?? "")}
                onBlur={field.onBlur}
                isInvalid={!!fieldState.error}
                errors={[fieldState.error]}
                options={user.options}
                onSearchChange={user.onSearchChange}
                isPending={user.isFetching}
                initialOption={initialAssigneeOption}
                emptyMessage="Không tìm thấy nhân viên"
                disabled={disabled}
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
        <Controller
          control={form.control}
          name="orderDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel className="text-xs font-medium text-foreground">
                Ngày đặt hàng <span className="text-destructive">*</span>
              </FieldLabel>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="dueDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel className="text-xs font-medium text-foreground">
                Ngày giao hàng yêu cầu{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="consigneeAddress"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error} className="sm:col-span-2">
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Địa chỉ giao hàng
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Nhập địa chỉ giao hàng"
                aria-invalid={!!fieldState.error}
                disabled={disabled}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="paymentTerm"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Điều khoản thanh toán
              </FieldLabel>
              <Select
                value={field.value}
                onChange={(key) => field.onChange(String(key))}
                isDisabled={disabled}
                placeholder="Chọn điều khoản"
              >
                <SelectTrigger
                  id={field.name}
                  onBlur={field.onBlur}
                  aria-invalid={!!fieldState.error}
                  className="h-9 w-full bg-background text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTermOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      id={option.value}
                      className="text-xs"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="currency"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Tiền tệ <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.value}
                onChange={(key) => field.onChange(String(key))}
                isDisabled={disabled}
              >
                <SelectTrigger
                  id={field.name}
                  onBlur={field.onBlur}
                  aria-invalid={!!fieldState.error}
                  className="h-9 w-full bg-background text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      id={option.value}
                      className="text-xs"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <ExchangeRateField form={form} disabled={disabled} />

        <Controller
          control={form.control}
          name="status"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Trạng thái đơn hàng <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.value}
                onChange={(key) => field.onChange(String(key))}
                isDisabled={disabled}
              >
                <SelectTrigger
                  id={field.name}
                  onBlur={field.onBlur}
                  aria-invalid={!!fieldState.error}
                  className="h-9 w-full bg-background text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      id={option.value}
                      className="text-xs"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="note"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={!!fieldState.error}
              className="sm:col-span-2 lg:col-span-4"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Ghi chú
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Ghi chú hiển thị trên đơn hàng"
                aria-invalid={!!fieldState.error}
                disabled={disabled}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="internalNote"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={!!fieldState.error}
              className="sm:col-span-2 lg:col-span-4"
            >
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Ghi chú nội bộ
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Ghi chú nội bộ (không hiển thị cho khách hàng)"
                aria-invalid={!!fieldState.error}
                disabled={disabled}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
    </div>
  )
}
