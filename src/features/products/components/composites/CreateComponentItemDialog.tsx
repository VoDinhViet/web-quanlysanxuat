import { revalidateLogic } from "@tanstack/react-form"
import { CheckCircle, LayersMinimalistic } from "@solar-icons/react"

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
import {
  createComponentItemDefaultValues,
  createComponentItemSchema,
} from "@/features/products/schemas/create-bom-item.schema"
import type { CreateComponentItemSchema } from "@/features/products/schemas/create-bom-item.schema"

type CreateComponentItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (value: CreateComponentItemSchema) => void
  isSaving: boolean
}

// Chỉ còn tạo item COMPONENT (cấu trúc con) — vật tư (CONSUMABLE) giờ thêm bằng dòng mở
// tại chỗ ngay trong BomItemConsumablesTable, không qua dialog nữa. Dialog này
// chỉ mở được từ hàng trong ProductBomTable (BomItemDetailPage là một trang
// riêng, không phải dialog) nên không có nguy cơ chồng dialog.
export function CreateComponentItemDialog({
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}: CreateComponentItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-lg ring-0 sm:max-w-lg">
        <CreatePartItemForm
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSaving={isSaving}
        />
      </DialogContent>
    </Dialog>
  )
}

type CreatePartItemFormProps = {
  onSubmit: (value: CreateComponentItemSchema) => void
  onCancel: () => void
  isSaving: boolean
}

// COMPONENT: item cấu trúc con — không có item liên kết để chọn, người dùng nhập thẳng mã/tên riêng
// cho vị trí này trong cây (docs/decisions/wip-removal.md).
function CreatePartItemForm({
  onSubmit,
  onCancel,
  isSaving,
}: CreatePartItemFormProps) {
  const form = useAppForm({
    defaultValues: createComponentItemDefaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: createComponentItemSchema },
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
        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          <LayersMinimalistic className="size-4 text-primary" />
          Thêm cấu trúc con
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Nhập mã và tên cho cấu trúc con này — riêng cho vị trí trong cây,
          không dùng chung với sản phẩm khác.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Tên"
                required
                placeholder="Ví dụ: Khung bàn"
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="code">
          {(field) => (
            <field.TextField
              label="Mã"
              required
              placeholder="Ví dụ: KHUNG-BAN"
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
      </div>

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
