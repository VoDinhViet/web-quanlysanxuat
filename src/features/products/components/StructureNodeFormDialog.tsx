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
import { useAppForm } from "@/hooks/use-app-form"
import type { NodeDialogState } from "@/features/products/hooks/use-product-structure"
import {
  STRUCTURE_NODE_DEFAULT_VALUES,
  structureNodeSchema,
} from "@/features/products/schemas/product-structure.schema"
import type { StructureNodeSchema } from "@/features/products/schemas/product-structure.schema"
import { STRUCTURE_NODE_TYPE_LABELS } from "@/features/products/types/product-structure.type"
import type { ProductStructureNode } from "@/features/products/types/product-structure.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const NODE_TYPE_OPTIONS = buildOptionsFromLabels(STRUCTURE_NODE_TYPE_LABELS)

function nodeToFormValues(node: ProductStructureNode): StructureNodeSchema {
  return {
    type: node.type,
    code: node.code,
    name: node.name,
    quantity: String(node.quantity),
    unit: node.unit,
    material: node.material,
  }
}

type StructureNodeFormDialogProps = {
  dialogState: NodeDialogState
  onOpenChange: (open: boolean) => void
  onSubmit: (value: StructureNodeSchema) => void
}

export function StructureNodeFormDialog({
  dialogState,
  onOpenChange,
  onSubmit,
}: StructureNodeFormDialogProps) {
  return (
    <Dialog open={dialogState.mode !== "closed"} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-lg ring-0 sm:max-w-lg">
        {/* Radix unmounts content while closed, so this form re-mounts fresh
            on each open — safe to read dialogState.node once here. */}
        {dialogState.mode !== "closed" ? (
          <StructureNodeForm
            dialogState={dialogState}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type StructureNodeFormProps = {
  dialogState: Extract<NodeDialogState, { mode: "add" | "edit" }>
  onSubmit: (value: StructureNodeSchema) => void
  onCancel: () => void
}

function StructureNodeForm({
  dialogState,
  onSubmit,
  onCancel,
}: StructureNodeFormProps) {
  const isEdit = dialogState.mode === "edit"

  const form = useAppForm({
    defaultValues: isEdit
      ? nodeToFormValues(dialogState.node)
      : STRUCTURE_NODE_DEFAULT_VALUES,
    validators: { onSubmit: structureNodeSchema },
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
          {isEdit ? "Sửa hạng mục" : "Thêm hạng mục"}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          {isEdit
            ? "Cập nhật thông tin hạng mục trong cấu trúc sản phẩm"
            : "Thêm một cụm, chi tiết hoặc vật tư vào cấu trúc sản phẩm"}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="type">
          {(field) => (
            <field.SelectField
              label="Loại"
              required
              placeholder="Chọn loại"
              options={NODE_TYPE_OPTIONS}
            />
          )}
        </form.AppField>

        <form.AppField name="code">
          {(field) => (
            <field.TextField label="Mã" required placeholder="VD: CT-004" />
          )}
        </form.AppField>

        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label="Tên"
              required
              placeholder="Nhập tên hạng mục"
            />
          )}
        </form.AppField>

        <form.AppField name="unit">
          {(field) => <field.TextField label="ĐVT" placeholder="VD: Cái" />}
        </form.AppField>

        <form.AppField name="quantity">
          {(field) => (
            <field.TextField
              label="Số lượng"
              required
              type="number"
              placeholder="1"
            />
          )}
        </form.AppField>

        <form.AppField name="material">
          {(field) => (
            <field.TextField
              label="Vật liệu"
              placeholder="VD: Thép C45 (chỉ áp dụng cho Chi tiết)"
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
          {isEdit ? "Lưu thay đổi" : "Thêm hạng mục"}
        </Button>
      </DialogFooter>
    </form>
  )
}
