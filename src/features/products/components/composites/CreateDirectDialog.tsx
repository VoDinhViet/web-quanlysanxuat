import { useState } from "react"
import { ArrowLeft, ArrowRight, CheckCircle, Box } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { DirectsPickerTable } from "@/features/products/components/composites/DirectsPickerTable"
import type { DirectPickerRow } from "@/features/products/components/composites/DirectPickerColumns"
import { CreateDirectDetailsTable } from "@/features/products/components/composites/CreateDirectDetailsTable"
import type { DirectDraftItem } from "@/features/products/components/composites/CreateDirectDetailsTable"
import {
  CreateDirectStepsTabs,
  createDirectStepItems,
} from "@/features/products/components/composites/CreateDirectStepsTabs"
import type { CreateDirectWizardStep } from "@/features/products/components/composites/CreateDirectStepsTabs"
import { getStepNav } from "@/lib/wizard-steps"
import type { CreateDirectItemSchema } from "@/features/products/schemas/create-bom-item.schema"

type CreateDirectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateDirectItemSchema[]) => void
  isSaving: boolean
}

// Cùng khuôn với CreateComponentItemDialog (dialog thuần, mutation gọi ở nơi render nó) — thêm vật
// tư (DIRECT) giờ tách 2 bước: ① chọn từ danh sách (DirectsPickerTable), ② nhập số
// lượng/ghi chú cho từng dòng đã chọn (CreateDirectDetailsTable), thay vì nhập ngay tại dòng
// trong cùng một bảng như trước. Sửa vật tư vẫn ở lại dạng dòng mở tại chỗ (EditDirectRow) —
// chỉ hành động Thêm chuyển sang đây.
export function CreateDirectDialog({
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}: CreateDirectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto shadow-lg ring-0 sm:max-w-4xl">
        {/* `key` buộc remount mỗi lần dialog mở lại — reset cả bước đang đứng lẫn lựa chọn/
            số lượng/ghi chú còn dở của lượt mở trước. */}
        <CreateDirectWizard
          key={open ? "open" : "closed"}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSaving={isSaving}
        />
      </DialogContent>
    </Dialog>
  )
}

type CreateDirectWizardProps = {
  onSubmit: (values: CreateDirectItemSchema[]) => void
  onCancel: () => void
  isSaving: boolean
}

function CreateDirectWizard({
  onSubmit,
  onCancel,
  isSaving,
}: CreateDirectWizardProps) {
  const [step, setStep] = useState<CreateDirectWizardStep>("select")
  // Nguồn duy nhất cho cả lựa chọn lẫn số lượng/ghi chú — bước 1 (tích/bỏ tích) và bước 2 (sửa số
  // lượng/ghi chú, hoặc bỏ chọn ngay tại dòng) đều đọc/ghi chung Map này, khoá theo itemId.
  const [picked, setPicked] = useState<Map<string, DirectDraftItem>>(new Map())

  const canGoToDetails = picked.size > 0
  const canSubmit =
    picked.size > 0 &&
    Array.from(picked.values()).every(
      (item) => item.quantity !== undefined && item.quantity > 0
    )

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    createDirectStepItems,
    step
  )

  function toggleRow(row: DirectPickerRow) {
    setPicked((prev) => {
      const next = new Map(prev)
      if (next.has(row.id)) {
        next.delete(row.id)
      } else {
        next.set(row.id, { row, quantity: 1, note: "" })
      }
      return next
    })
  }

  function toggleAllRows(rows: DirectPickerRow[], checked: boolean) {
    setPicked((prev) => {
      const next = new Map(prev)
      rows.forEach((row) => {
        if (checked) {
          if (!next.has(row.id))
            next.set(row.id, { row, quantity: 1, note: "" })
        } else {
          next.delete(row.id)
        }
      })
      return next
    })
  }

  function removeRow(itemId: string) {
    setPicked((prev) => {
      const next = new Map(prev)
      next.delete(itemId)
      return next
    })
  }

  function patchItem(
    itemId: string,
    patch: Partial<Pick<DirectDraftItem, "quantity" | "note">>
  ) {
    setPicked((prev) => {
      const current = prev.get(itemId)
      if (!current) return prev
      const next = new Map(prev)
      next.set(itemId, { ...current, ...patch })
      return next
    })
  }

  function handleSubmit() {
    if (isSaving || !canSubmit) return
    onSubmit(
      Array.from(picked.values())
        .filter(
          (item): item is DirectDraftItem & { quantity: number } =>
            item.quantity !== undefined && item.quantity > 0
        )
        .map((item) => ({
          type: "DIRECT",
          itemId: item.row.id,
          quantity: item.quantity,
          note: item.note,
        }))
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader className="gap-1">
        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          <Box className="size-4 text-primary" />
          Thêm vật tư
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Chọn một hoặc nhiều vật tư ở bước 1, rồi nhập số lượng định mức và ghi
          chú cho từng vật tư ở bước 2.
        </DialogDescription>
      </DialogHeader>

      <Tabs
        value={step}
        onValueChange={(value) => {
          const nextValue = createDirectStepItems.find(
            (item) => item.value === value
          )
          if (nextValue) setStep(nextValue.value)
        }}
        className="gap-0"
      >
        <CreateDirectStepsTabs
          canGoToDetails={canGoToDetails}
          pickedCount={picked.size}
        />

        {/* keepMounted: bước 1 tự giữ state trang/tìm kiếm riêng (DirectsPickerTable) — không
            liên quan tới lựa chọn (đã nâng lên `picked` ở đây), nhưng vẫn cần sống qua lại bước 2
            để không phải tìm/lật trang lại từ đầu mỗi lần quay lại. */}
        <TabsContent
          value="select"
          keepMounted
          className="m-0 pt-4 outline-none data-hidden:hidden"
        >
          <DirectsPickerTable
            disabled={isSaving}
            pickedIds={new Set(picked.keys())}
            onToggleRow={toggleRow}
            onToggleAllRows={toggleAllRows}
          />
        </TabsContent>

        <TabsContent value="details" className="m-0 pt-4 outline-none">
          <CreateDirectDetailsTable
            items={Array.from(picked.values())}
            disabled={isSaving}
            onQuantityChange={(itemId, quantity) =>
              patchItem(itemId, { quantity })
            }
            onNoteChange={(itemId, note) => patchItem(itemId, { note })}
            onRemove={removeRow}
          />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between gap-2 pt-1">
        {prevStep ? (
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isSaving}
            onClick={() => setStep(prevStep)}
          >
            <ArrowLeft className="size-4" />
            {prevLabel}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Thoát
          </Button>
        )}

        {nextStep ? (
          <Button
            type="button"
            disabled={isSaving || !canGoToDetails}
            onClick={() => setStep(nextStep)}
          >
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isSaving || !canSubmit}
            onClick={handleSubmit}
          >
            <CheckCircle className="size-4" />
            {picked.size > 0 ? `Thêm ${picked.size} vật tư` : "Thêm vật tư"}
          </Button>
        )}
      </div>
    </div>
  )
}
