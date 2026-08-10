import { useState } from "react"
import { Check } from "lucide-react"
import { NumericFormat } from "react-number-format"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ComboboxField } from "@/components/shared/ComboboxField"
import { useAppForm } from "@/hooks/use-app-form"
import { useGetItemOptions } from "@/features/orders/hooks/use-get-item-options"
import {
  orderItemDefaultValue,
  orderItemFormSchema,
} from "@/features/orders/schemas/order-item-form.schema"
import type { OrderItemFormValue } from "@/features/orders/schemas/order-item-form.schema"
import { vndFormatter } from "@/lib/currency"
import {
  Currency,
  orderItemStatusLabels,
  OrderItemStatus,
} from "@/lib/types/order.type"
import { roundMoney } from "@/lib/utils"

const orderItemStatusOptions = Object.values(OrderItemStatus).map((status) => ({
  value: status,
  label: orderItemStatusLabels[status],
}))

type OrderItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // `null` = add mode; a row value = edit mode.
  initialValue: OrderItemFormValue | null
  onSubmit: (value: OrderItemFormValue) => void
  // The order's own currency/exchangeRate — a line has no currency of its own,
  // `unitPrice` is always entered in the order's currency (see order-item.req.dto.ts
  // on the backend: no per-line currency column).
  currency: Currency
  exchangeRate: string
}

export function OrderItemDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  currency,
  exchangeRate,
}: OrderItemDialogProps) {
  // The product combobox must portal its popup inside this dialog's own DOM
  // subtree (see ComboboxField's `container` doc), same pattern as
  // BomItemFormDialog.tsx.
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContentNode}
        className="shadow-lg ring-0 sm:max-w-lg"
      >
        {/* Radix unmounts content while closed, so this form re-mounts on each
            open and its state seeds fresh from `initialValue`. */}
        <OrderItemDialogForm
          container={contentNode}
          initialValue={initialValue}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          currency={currency}
          exchangeRate={exchangeRate}
        />
      </DialogContent>
    </Dialog>
  )
}

type OrderItemDialogFormProps = {
  container: HTMLDivElement | null
  initialValue: OrderItemFormValue | null
  onSubmit: (value: OrderItemFormValue) => void
  onCancel: () => void
  currency: Currency
  exchangeRate: string
}

function OrderItemDialogForm({
  container,
  initialValue,
  onSubmit,
  onCancel,
  currency,
  exchangeRate,
}: OrderItemDialogFormProps) {
  const isEditing = initialValue !== null
  const item = useGetItemOptions()

  const form = useAppForm({
    defaultValues: initialValue ?? orderItemDefaultValue,
    validators: {
      onSubmit: orderItemFormSchema,
    },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          {isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Thông tin dòng sản phẩm trong đơn hàng
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <form.Field name="itemId">
            {(field) => (
              <ComboboxField
                id="order-item-product"
                label="Sản phẩm"
                required
                placeholder="Tìm mã hoặc tên sản phẩm..."
                value={field.state.value || undefined}
                onValueChange={(next) => {
                  field.handleChange(next ?? "")
                  const selected = item.items.find((p) => p.id === next)
                  form.setFieldValue("itemLabel", selected?.name ?? "")
                  form.setFieldValue("itemUnit", selected?.unit.name ?? "")
                }}
                onBlur={field.handleBlur}
                isInvalid={
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                }
                errors={field.state.meta.errors}
                options={item.options}
                onSearchChange={item.onSearchChange}
                isPending={item.isFetching}
                initialOption={
                  initialValue
                    ? {
                        value: initialValue.itemId,
                        label: initialValue.itemLabel,
                      }
                    : undefined
                }
                emptyMessage="Không tìm thấy sản phẩm"
                container={container}
              />
            )}
          </form.Field>
        </div>

        <form.AppField name="quantity">
          {(field) => (
            <field.NumberField
              id="order-item-quantity"
              label="Số lượng"
              required
              placeholder="0"
            />
          )}
        </form.AppField>

        {/* Built manually (not `field.NumberField`) to fit the live "≈ ... VND"
            conversion hint below the input — the shared NumberField has no slot
            for it. Label/input/error otherwise mirror NumberField exactly. */}
        <form.AppField name="unitPrice">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && field.state.meta.errors.length > 0
            const vndAmount = roundMoney(
              (Number(field.state.value) || 0) * (Number(exchangeRate) || 0)
            )

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor="order-item-unit-price"
                  className="text-xs font-medium text-foreground"
                >
                  {`Đơn giá (${currency})`}
                </FieldLabel>
                <NumericFormat
                  customInput={Input}
                  id="order-item-unit-price"
                  name={field.name}
                  placeholder="0"
                  className="h-9 bg-background text-xs"
                  value={field.state.value}
                  thousandSeparator="."
                  decimalSeparator=","
                  allowNegative={false}
                  onBlur={field.handleBlur}
                  onValueChange={(values) => field.handleChange(values.value)}
                  aria-invalid={isInvalid}
                />
                {currency !== Currency.VND && (
                  <FieldDescription className="text-[11px] tabular-nums">
                    ≈ {vndFormatter.format(vndAmount)} VND
                  </FieldDescription>
                )}
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )
          }}
        </form.AppField>

        <form.AppField name="discountPercent">
          {(field) => (
            <field.NumberField
              id="order-item-discount"
              label="Chiết khấu (%)"
              placeholder="0"
              thousandSeparator={false}
            />
          )}
        </form.AppField>

        <form.AppField name="status">
          {(field) => (
            <field.SelectField
              label="Trạng thái dòng"
              options={orderItemStatusOptions}
            />
          )}
        </form.AppField>

        <div className="sm:col-span-2">
          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                id="order-item-note"
                label="Ghi chú"
                placeholder="Nhập ghi chú (nếu có)"
              />
            )}
          </form.AppField>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          <Check className="size-4" />
          Lưu
        </Button>
      </DialogFooter>
    </form>
  )
}
