import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ComboboxField } from "@/components/shared/inputs/ComboboxField"
import { useAppForm } from "@/hooks/use-app-form"
import { BomItemDrawingField } from "@/features/products/components/BomItemDrawingField"
import { useGetBomProductOptions } from "@/features/products/hooks/use-get-bom-product-options"
import {
  createBomItemDefaultValues,
  createBomItemSchema,
} from "@/features/products/schemas/create-bom-item.schema"
import { updateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import type { CreateBomItemSchema } from "@/features/products/schemas/create-bom-item.schema"
import type { UpdateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import { bomItemTypeLabels } from "@/lib/types/bom-item.type"
import type {
  BomItem,
  BomItemDialogState,
  BomItemType,
} from "@/lib/types/bom-item.type"

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
  // The product-picker combobox portals its popup into this node instead of
  // `<body>` — see ComboboxField's `container` doc for why.
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null)

  return (
    <Dialog open={dialog.mode !== "closed"} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContentNode}
        className="shadow-lg ring-0 sm:max-w-lg"
      >
        {dialog.mode === "create" ? (
          <CreateBomItemForm
            container={contentNode}
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
  container: HTMLDivElement | null
  onSubmit: (value: CreateBomItemSchema) => void
  onCancel: () => void
  isSaving: boolean
}

function CreateBomItemForm({
  container,
  onSubmit,
  onCancel,
  isSaving,
}: CreateBomItemFormProps) {
  const form = useAppForm({
    defaultValues: createBomItemDefaultValues,
    validators: { onSubmit: createBomItemSchema },
    onSubmit: ({ value }) => onSubmit(value),
  })
  const [nodeType, setNodeType] = useState<BomItemType>("WIP")
  const productOptions = useGetBomProductOptions(nodeType)

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
          Thêm thành phần BOM
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Thêm bán thành phẩm (WIP) hoặc vật tư (RM) vào cấu trúc sản phẩm.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4.5">
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-foreground">
            Loại thành phần
          </span>
          <Select
            value={nodeType}
            onValueChange={(next) => {
              const nextType = next as BomItemType
              setNodeType(nextType)
              // The previously picked item no longer matches the new type's
              // option list — clear the selection instead of leaving a stale id.
              form.setFieldValue("itemId", "")
            }}
          >
            <SelectTrigger className="w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WIP">{bomItemTypeLabels.WIP}</SelectItem>
              <SelectItem value="RM">{bomItemTypeLabels.RM}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <form.AppField name="itemId">
          {(field) => (
            <ComboboxField
              label={
                nodeType === "WIP"
                  ? "Chọn bán thành phẩm (WIP)"
                  : "Chọn vật tư (RM)"
              }
              required
              placeholder="Tìm mã hoặc tên..."
              value={field.state.value || undefined}
              onValueChange={(next) => field.handleChange(next ?? "")}
              onBlur={field.handleBlur}
              options={productOptions.options}
              onSearchChange={productOptions.onSearchChange}
              isPending={productOptions.isFetching}
              isInvalid={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
              }
              errors={field.state.meta.errors}
              // Rendered inside BomItemFormDialog's Radix Dialog — portal the
              // popup into the dialog's own DOM subtree (see ComboboxField's
              // `container` doc) so the option click commits instead of
              // being swallowed.
              container={container}
            />
          )}
        </form.AppField>

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
