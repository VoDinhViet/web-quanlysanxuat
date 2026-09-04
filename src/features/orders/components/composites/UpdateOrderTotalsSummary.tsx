import { Controller, useWatch } from "react-hook-form"
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
import {
  computeOrderTotals,
  formatSignedAmount,
} from "@/features/orders/logic/order-totals"
import type { UpdateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import { currencyFormatter, vndFormatter } from "@/lib/currency"
import { Currency, orderDiscountTypeLabels } from "@/lib/types/order.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const discountTypeOptions = buildOptionsFromLabels(orderDiscountTypeLabels)

type UpdateOrderTotalsSummaryProps = {
  form: UseFormReturn<UpdateOrderSchema>
  disabled: boolean
}

// Bước ④ của wizard: 4 field tiền (Controller inline, không qua AppFormFields.tsx — xem
// forms-and-ui.md "no shared RHF field kit") + preview tổng tiền đọc trực tiếp từ form qua
// useWatch. Render bởi UpdateOrderConfirmSection.tsx — cùng khuôn CreateOrderTotalsSummary.tsx.
export function UpdateOrderTotalsSummary({
  form,
  disabled,
}: UpdateOrderTotalsSummaryProps) {
  const currency = useWatch({
    control: form.control,
    name: "currency",
    defaultValue: Currency.VND,
  })

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
        <Controller
          control={form.control}
          name="discountType"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Loại chiết khấu
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
                  {discountTypeOptions.map((option) => (
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
          name="discountValue"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Giá trị chiết khấu
              </FieldLabel>
              <NumericFormat
                customInput={Input}
                id={field.name}
                name={field.name}
                placeholder="0"
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

        <Controller
          control={form.control}
          name="vatPercent"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Thuế VAT (%)
              </FieldLabel>
              <NumericFormat
                customInput={Input}
                id={field.name}
                name={field.name}
                placeholder="0"
                className="h-9 bg-background text-xs"
                value={field.value ?? ""}
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

        <Controller
          control={form.control}
          name="shippingFee"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                {`Phí vận chuyển (${currency})`}
              </FieldLabel>
              <NumericFormat
                customInput={Input}
                id={field.name}
                name={field.name}
                placeholder="0"
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
      </div>

      <OrderTotalsPreview form={form} />
    </div>
  )
}

type OrderTotalsPreviewProps = {
  form: UseFormReturn<UpdateOrderSchema>
}

// 7 useWatch riêng lẻ (không gộp mảng `name: [...]`) — giữ đúng kiểu từng field, tránh phải cast
// lại như tuple sẽ ép. Cả 7 cùng subscribe 1 store nên React vẫn gộp 1 lần re-render.
function OrderTotalsPreview({ form }: OrderTotalsPreviewProps) {
  const items = useWatch({ control: form.control, name: "items" })
  const discountType = useWatch({ control: form.control, name: "discountType" })
  const discountValue = useWatch({
    control: form.control,
    name: "discountValue",
  })
  const vatPercent = useWatch({ control: form.control, name: "vatPercent" })
  const shippingFee = useWatch({ control: form.control, name: "shippingFee" })
  const currency = useWatch({
    control: form.control,
    name: "currency",
    defaultValue: Currency.VND,
  })
  const exchangeRate = useWatch({ control: form.control, name: "exchangeRate" })

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
}
