import { useState } from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ComboboxField } from "@/components/shared/ComboboxField"
import { useAppForm } from "@/hooks/use-app-form"
import { useGetMaterialOptions } from "@/features/purchase-requests/hooks/use-get-material-options"
import {
  purchaseRequestItemDefaultValue,
  purchaseRequestItemFormSchema,
} from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"
import type { PurchaseRequestItemFormValue } from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"

type PurchaseRequestItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // `null` = add mode; a row value = edit mode.
  initialValue: PurchaseRequestItemFormValue | null
  onSubmit: (value: PurchaseRequestItemFormValue) => void
}

export function PurchaseRequestItemDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: PurchaseRequestItemDialogProps) {
  // Combobox vật tư phải portal popup vào bên trong DOM subtree của dialog này — cùng lý do
  // ComboboxField.tsx đã ghi (Radix FocusScope nuốt click bên ngoài dialog).
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContentNode}
        className="shadow-lg ring-0 sm:max-w-lg"
      >
        {/* Radix unmounts content while closed, so this form re-mounts on each
            open and its state seeds fresh from `initialValue`. */}
        <PurchaseRequestItemDialogForm
          container={contentNode}
          initialValue={initialValue}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type PurchaseRequestItemDialogFormProps = {
  container: HTMLDivElement | null
  initialValue: PurchaseRequestItemFormValue | null
  onSubmit: (value: PurchaseRequestItemFormValue) => void
  onCancel: () => void
}

function PurchaseRequestItemDialogForm({
  container,
  initialValue,
  onSubmit,
  onCancel,
}: PurchaseRequestItemDialogFormProps) {
  const isEditing = initialValue !== null
  const material = useGetMaterialOptions()

  const form = useAppForm({
    defaultValues: initialValue ?? purchaseRequestItemDefaultValue,
    validators: {
      onSubmit: purchaseRequestItemFormSchema,
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
          {isEditing ? "Sửa dòng vật tư" : "Thêm dòng vật tư"}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Thông tin dòng vật tư trong đề xuất mua hàng
        </DialogDescription>
      </DialogHeader>

      {/* Xếp dọc, không dùng grid 2 cột: chỉ 3 field và không có field nào ghép cặp tự
          nhiên với Số lượng, một lưới 2 cột sẽ để lại 1 ô trống — trái với nguyên tắc
          tránh trống trải của toàn bộ màn hình tạo đề xuất. */}
      <div className="flex flex-col gap-4">
        <form.Field name="itemId">
          {(field) => (
            <ComboboxField
              id="purchase-request-item-material"
              label="Vật tư"
              required
              placeholder="Tìm mã hoặc tên vật tư..."
              value={field.state.value || undefined}
              onValueChange={(next) => {
                field.handleChange(next ?? "")
                const selected = material.items.find(
                  (item) => item.id === next
                )
                form.setFieldValue(
                  "itemLabel",
                  selected ? `${selected.code} — ${selected.name}` : ""
                )
              }}
              onBlur={field.handleBlur}
              isInvalid={
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0
              }
              errors={field.state.meta.errors}
              options={material.options}
              onSearchChange={material.onSearchChange}
              isPending={material.isFetching}
              initialOption={
                initialValue
                  ? {
                      value: initialValue.itemId,
                      label: initialValue.itemLabel,
                    }
                  : undefined
              }
              emptyMessage="Không tìm thấy vật tư"
              container={container}
            />
          )}
        </form.Field>

        <form.AppField name="quantity">
          {(field) => (
            <field.NumberField
              id="purchase-request-item-quantity"
              label="Số lượng"
              required
              placeholder="0"
            />
          )}
        </form.AppField>

        <form.AppField name="note">
          {(field) => (
            <field.TextareaField
              id="purchase-request-item-note"
              label="Ghi chú"
              placeholder="Nhập ghi chú (nếu có)"
            />
          )}
        </form.AppField>
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
