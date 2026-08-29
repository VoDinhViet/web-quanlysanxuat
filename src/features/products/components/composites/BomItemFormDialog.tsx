import { CheckCircle } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppForm } from "@/hooks/use-app-form"
import { BomItemDrawingField } from "@/features/products/components/composites/BomItemDrawingField"
import { BomItemPickerField } from "@/features/products/components/composites/BomItemPickerField"
import {
  createBomItemDefaultValues,
  createBomItemSchema,
} from "@/features/products/schemas/create-bom-item.schema"
import { updateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import type { CreateBomItemSchema } from "@/features/products/schemas/create-bom-item.schema"
import type { UpdateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import type {
  BomItem,
  BomItemDialogState,
  BomItemType,
} from "@/lib/types/bom-item.type"
import { cn } from "@/lib/utils"

type BomItemFormDialogProps = {
  dialog: BomItemDialogState
  onOpenChange: (open: boolean) => void
  onCreate: (value: CreateBomItemSchema, parentId: string | null) => void
  onUpdate: (value: UpdateBomItemSchema, itemId: string) => void
  isSaving: boolean
}

export function BomItemFormDialog({
  dialog,
  onOpenChange,
  onCreate,
  onUpdate,
  isSaving,
}: BomItemFormDialogProps) {
  return (
    <Dialog open={dialog.mode !== "closed"} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "shadow-lg ring-0",
          dialog.mode === "create"
            ? "max-h-[90vh] overflow-y-auto sm:max-w-4xl"
            : "sm:max-w-lg"
        )}
      >
        {dialog.mode === "create" ? (
          <CreateBomItemForm
            itemType={dialog.itemType}
            onSubmit={(value) => onCreate(value, dialog.parentId)}
            onCancel={() => onOpenChange(false)}
            isSaving={isSaving}
          />
        ) : dialog.mode === "update" ? (
          <UpdateBomItemForm
            node={dialog.node}
            onSubmit={(value) => onUpdate(value, dialog.node.id)}
            onCancel={() => onOpenChange(false)}
            isSaving={isSaving}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type CreateBomItemFormProps = {
  itemType: BomItemType
  onSubmit: (value: CreateBomItemSchema) => void
  onCancel: () => void
  isSaving: boolean
}

function CreateBomItemForm({
  itemType,
  onSubmit,
  onCancel,
  isSaving,
}: CreateBomItemFormProps) {
  const form = useAppForm({
    defaultValues: createBomItemDefaultValues,
    validators: { onSubmit: createBomItemSchema },
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
      className="flex flex-col gap-6"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          Thêm thành phần BOM
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          {itemType === "WIP"
            ? "Chọn bán thành phẩm lắp vào thành phẩm này."
            : "Chọn vật tư tiêu hao cho hạng mục này."}
        </DialogDescription>
      </DialogHeader>

      {/* Picker on the left (needs the room for search + table + pagination),
          this node's own details stacked in a narrower column on the right —
          picking and describing happen side by side instead of one long
          vertical scroll. */}
      <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <form.AppField name="itemId">
          {(field) => (
            <BomItemPickerField
              itemType={itemType}
              value={field.state.value}
              onValueChange={field.handleChange}
              onBlur={field.handleBlur}
              isInvalid={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
              }
              errors={field.state.meta.errors}
            />
          )}
        </form.AppField>

        <div className="flex flex-col gap-4.5">
          <form.AppField name="quantity">
            {(field) => (
              <field.NumberField
                label="Số lượng định mức"
                required
                placeholder="Ví dụ: 1"
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú thành phần"
                placeholder="Ghi chú quy cách hoặc thông tin thêm (nếu có)..."
              />
            )}
          </form.AppField>

          <form.AppField name="drawing">
            {(field) => (
              <BomItemDrawingField
                value={field.state.value}
                onChange={field.handleChange}
                disabled={isSaving}
              />
            )}
          </form.AppField>
        </div>
      </div>

      <DialogFooter className="gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSaving}>
          <CheckCircle className="size-4" />
          Thêm vào BOM
        </Button>
      </DialogFooter>
    </form>
  )
}

type UpdateBomItemFormProps = {
  node: BomItem
  onSubmit: (value: UpdateBomItemSchema) => void
  onCancel: () => void
  isSaving: boolean
}

function getBomItemDefaultValues(node: BomItem): UpdateBomItemSchema {
  return {
    quantity: node.quantity,
    sortOrder: node.sortOrder,
    note: node.note ?? "",
    drawing: node.drawing,
  }
}

function UpdateBomItemForm({
  node,
  onSubmit,
  onCancel,
  isSaving,
}: UpdateBomItemFormProps) {
  const form = useAppForm({
    defaultValues: getBomItemDefaultValues(node),
    validators: { onSubmit: updateBomItemSchema },
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
          Sửa thành phần BOM
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          <strong className="font-mono text-foreground">{node.code}</strong> —{" "}
          {node.name}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="quantity">
          {(field) => <field.NumberField label="Số lượng" required />}
        </form.AppField>

        <form.AppField name="sortOrder">
          {(field) => (
            <field.NumberField
              label="Thứ tự sắp xếp"
              thousandSeparator={false}
            />
          )}
        </form.AppField>
      </div>

      <form.AppField name="note">
        {(field) => (
          <field.TextareaField
            label="Ghi chú"
            placeholder="Ghi chú (nếu có)..."
          />
        )}
      </form.AppField>

      <form.AppField name="drawing">
        {(field) => (
          <BomItemDrawingField
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isSaving}
          />
        )}
      </form.AppField>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSaving}>
          <CheckCircle className="size-4" />
          Lưu thay đổi
        </Button>
      </DialogFooter>
    </form>
  )
}
