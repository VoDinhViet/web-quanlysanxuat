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
import type { OperationDialogState } from "@/features/products/hooks/use-product-structure"
import {
  PRODUCT_OPERATION_DEFAULT_VALUES,
  productOperationSchema,
} from "@/features/products/schemas/product-structure.schema"
import type { ProductOperationSchema } from "@/features/products/schemas/product-structure.schema"
import { OPERATION_TYPE_LABELS } from "@/features/products/types/product-structure.type"
import type { ProductOperation } from "@/features/products/types/product-structure.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const OPERATION_TYPE_OPTIONS = buildOptionsFromLabels(OPERATION_TYPE_LABELS)

function operationToFormValues(
  operation: ProductOperation
): ProductOperationSchema {
  return {
    name: operation.name,
    resource: operation.resource,
    type: operation.type,
    minutes: String(operation.minutes),
    note: operation.note,
  }
}

type OperationFormDialogProps = {
  dialogState: OperationDialogState
  onOpenChange: (open: boolean) => void
  onSubmit: (value: ProductOperationSchema) => void
}

export function OperationFormDialog({
  dialogState,
  onOpenChange,
  onSubmit,
}: OperationFormDialogProps) {
  return (
    <Dialog open={dialogState.mode !== "closed"} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-lg ring-0 sm:max-w-lg">
        {/* Radix unmounts content while closed, so this form re-mounts fresh
            on each open — safe to read dialogState.operation once here. */}
        {dialogState.mode !== "closed" ? (
          <OperationForm
            dialogState={dialogState}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type OperationFormProps = {
  dialogState: Extract<OperationDialogState, { mode: "add" | "edit" }>
  onSubmit: (value: ProductOperationSchema) => void
  onCancel: () => void
}

function OperationForm({
  dialogState,
  onSubmit,
  onCancel,
}: OperationFormProps) {
  const isEdit = dialogState.mode === "edit"

  const form = useAppForm({
    defaultValues: isEdit
      ? operationToFormValues(dialogState.operation)
      : PRODUCT_OPERATION_DEFAULT_VALUES,
    validators: { onSubmit: productOperationSchema },
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
          {isEdit ? "Sửa công đoạn" : "Thêm công đoạn"}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          {isEdit
            ? "Cập nhật thông tin công đoạn gia công"
            : "Thêm một bước công đoạn gia công cho hạng mục này"}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label="Tên công đoạn"
              required
              placeholder="VD: Tiện CNC"
            />
          )}
        </form.AppField>

        <form.AppField name="type">
          {(field) => (
            <field.SelectField
              label="Loại"
              required
              placeholder="Chọn loại"
              options={OPERATION_TYPE_OPTIONS}
            />
          )}
        </form.AppField>

        <form.AppField name="resource">
          {(field) => (
            <field.TextField label="Máy · Tổ" placeholder="VD: T-01" />
          )}
        </form.AppField>

        <form.AppField name="minutes">
          {(field) => (
            <field.TextField
              label="Định mức (phút)"
              required
              type="number"
              placeholder="0"
            />
          )}
        </form.AppField>

        <form.AppField name="note">
          {(field) => (
            <field.TextareaField
              label="Ghi chú"
              placeholder="Ghi chú thêm cho công đoạn (nếu có)"
              className="sm:col-span-2"
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
          {isEdit ? "Lưu thay đổi" : "Thêm công đoạn"}
        </Button>
      </DialogFooter>
    </form>
  )
}
