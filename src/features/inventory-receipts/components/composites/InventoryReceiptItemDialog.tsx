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
import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import { useAppForm } from "@/hooks/use-app-form"
import { useGetInventoryReceiptItemOptions } from "@/features/inventory-receipts/hooks/use-get-inventory-receipt-item-options"
import {
  inventoryReceiptItemDefaultValue,
  inventoryReceiptItemFormSchema,
} from "@/features/inventory-receipts/schemas/inventory-receipt-item-form.schema"
import type { InventoryReceiptItemFormValue } from "@/features/inventory-receipts/schemas/inventory-receipt-item-form.schema"

type InventoryReceiptItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // `null` = add mode; a row value = edit mode.
  initialValue: InventoryReceiptItemFormValue | null
  onSubmit: (value: InventoryReceiptItemFormValue) => void
  // "RM" (vật tư) hay "FG" (thành phẩm) — theo `resolveInventoryReceiptItemType(receiptType)`
  // ở nơi gọi, quyết định combobox tìm trong tập item nào.
  itemType: "RM" | "FG"
}

// Chế độ chọn vật tư/thành phẩm chung (không theo PO) — dùng chung bởi
// create/InventoryReceiptCreateGenericItemsSection.tsx và
// update/InventoryReceiptUpdateGenericItemsSection.tsx, nên đặt ở `components/` root thay vì
// dưới `create/` (xem project-and-commands.md, "anything shared across screens ... stays at
// the components/ root"). Không có currency/discountPercent/status như OrderItemDialog.tsx:
// phiếu nhập kho không có khái niệm này. `purchaseOrderItemId` không xuất hiện ở đây — dialog
// này chỉ dùng khi phiếu chưa chọn PO nguồn.
export function InventoryReceiptItemDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  itemType,
}: InventoryReceiptItemDialogProps) {
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
        <InventoryReceiptItemDialogForm
          container={contentNode}
          initialValue={initialValue}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          itemType={itemType}
        />
      </DialogContent>
    </Dialog>
  )
}

type InventoryReceiptItemDialogFormProps = {
  container: HTMLDivElement | null
  initialValue: InventoryReceiptItemFormValue | null
  onSubmit: (value: InventoryReceiptItemFormValue) => void
  onCancel: () => void
  itemType: "RM" | "FG"
}

function InventoryReceiptItemDialogForm({
  container,
  initialValue,
  onSubmit,
  onCancel,
  itemType,
}: InventoryReceiptItemDialogFormProps) {
  const isEditing = initialValue !== null
  const itemNoun = itemType === "FG" ? "thành phẩm" : "vật tư"
  const material = useGetInventoryReceiptItemOptions(itemType)

  const form = useAppForm({
    defaultValues: initialValue ?? inventoryReceiptItemDefaultValue,
    validators: {
      onSubmit: inventoryReceiptItemFormSchema,
    },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          {isEditing ? `Sửa dòng ${itemNoun}` : `Thêm dòng ${itemNoun}`}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Thông tin dòng {itemNoun} trong phiếu nhập kho
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <form.Field name="itemId">
            {(field) => (
              <ComboboxField
                id="inventory-receipt-item-material"
                label={itemType === "FG" ? "Thành phẩm" : "Vật tư"}
                required
                placeholder={`Tìm mã hoặc tên ${itemNoun}...`}
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
                emptyMessage={`Không tìm thấy ${itemNoun}`}
                container={container}
              />
            )}
          </form.Field>
        </div>

        <form.AppField name="quantity">
          {(field) => (
            <field.NumberField label="Số lượng" required placeholder="0" />
          )}
        </form.AppField>

        <form.AppField name="unitPrice">
          {(field) => <field.NumberField label="Đơn giá" placeholder="0" />}
        </form.AppField>

        <div className="sm:col-span-2">
          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
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
