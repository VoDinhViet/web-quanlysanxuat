import { useState } from "react"
import { CheckCircle, Box } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConsumablesPickerTable } from "@/features/products/components/composites/ConsumablesPickerTable"
import type { PickedConsumableSubmission } from "@/features/products/components/composites/ConsumablesPickerTable"
import type { CreateConsumableItemSchema } from "@/features/products/schemas/create-bom-item.schema"

type CreateConsumableDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateConsumableItemSchema[]) => void
  isSaving: boolean
}

// Cùng khuôn với CreateComponentItemDialog (dialog thuần, mutation gọi ở nơi render nó) — thêm vật tư
// (CONSUMABLE) giờ chọn được nhiều dòng cùng lúc, Số lượng/Ghi chú nhập ngay tại dòng trong
// ConsumablesPickerTable (không còn form riêng bên dưới); không có bản vẽ — mỗi dòng là một item
// riêng nên một bản vẽ chung không có nghĩa cho cả lượt thêm. Sửa vật tư vẫn ở lại dạng dòng mở
// tại chỗ (EditConsumableRow) — chỉ hành động Thêm chuyển sang đây.
export function CreateConsumableDialog({
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}: CreateConsumableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto shadow-lg ring-0 sm:max-w-3xl">
        <CreateConsumableForm
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSaving={isSaving}
        />
      </DialogContent>
    </Dialog>
  )
}

type CreateConsumableFormProps = {
  onSubmit: (values: CreateConsumableItemSchema[]) => void
  onCancel: () => void
  isSaving: boolean
}

function CreateConsumableForm({
  onSubmit,
  onCancel,
  isSaving,
}: CreateConsumableFormProps) {
  const [picked, setPicked] = useState<PickedConsumableSubmission[]>([])

  const canSubmit =
    picked.length > 0 && picked.every((value) => Number(value.quantity) > 0)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (isSaving || !canSubmit) return

        onSubmit(
          picked.map((value) => ({
            type: "CONSUMABLE",
            itemId: value.itemId,
            quantity: Number(value.quantity),
            note: value.note,
            drawing: null,
          }))
        )
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          <Box className="size-4 text-primary" />
          Thêm vật tư
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Tích chọn một hoặc nhiều vật tư, nhập số lượng định mức và ghi chú
          ngay tại từng dòng.
        </DialogDescription>
      </DialogHeader>

      <ConsumablesPickerTable disabled={isSaving} onPickedChange={setPicked} />

      <DialogFooter className="gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSaving || !canSubmit}>
          <CheckCircle className="size-4" />
          {picked.length > 0 ? `Thêm ${picked.length} vật tư` : "Thêm vật tư"}
        </Button>
      </DialogFooter>
    </form>
  )
}
