import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { revalidateLogic } from "@tanstack/react-form"
import { Radio } from "@base-ui/react/radio"
import {
  ArrowRightDown,
  CheckCircle,
  Layers,
  LayersMinimalistic,
} from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup } from "@/components/ui/radio-group"
import { ProductImageField } from "@/features/products/components/composites/ProductImageField"
import { useAppForm } from "@/hooks/use-app-form"
import {
  createComponentItemDefaultValues,
  createComponentItemSchema,
} from "@/features/products/schemas/create-bom-item.schema"
import { unitOptionsQueryOptions } from "@/features/units/api"
import type { BomCreateTarget } from "@/features/products/utils/bom-rows.util"
import { UploadType } from "@/lib/types/file.type"
import { buildSelectOptions, cn } from "@/lib/utils"
import type { CreateComponentItemSchema } from "@/features/products/schemas/create-bom-item.schema"

type CreateComponentItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  childTarget: BomCreateTarget
  // null với dòng Cấp 0 — chỉ có đúng 1 dòng Cấp 0 nên không có "cùng cấp";
  // dialog bỏ qua bước chọn vị trí khi null.
  siblingTarget: BomCreateTarget | null
  onSubmit: (value: CreateComponentItemSchema, target: BomCreateTarget) => void
  isSaving: boolean
}

// Chỉ còn tạo item COMPONENT (Part) — vật tư (CONSUMABLE) giờ thêm bằng dòng mở
// tại chỗ ngay trong BomItemConsumablesTable, không qua dialog nữa. Dialog này
// chỉ mở được từ hàng trong ProductBomTable (BomItemDetailPage là một trang
// riêng, không phải dialog) nên không có nguy cơ chồng dialog.
export function CreateComponentItemDialog({
  open,
  onOpenChange,
  childTarget,
  siblingTarget,
  onSubmit,
  isSaving,
}: CreateComponentItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto shadow-lg ring-0 sm:max-w-3xl">
        {/* `key` buộc remount mỗi lần dialog mở lại — reset cả lựa chọn vị
            trí (placement) lẫn các field còn dở của lượt mở trước, kể cả khi
            mở lại từ một dòng khác. */}
        <CreatePartItemForm
          key={open ? "open" : "closed"}
          childTarget={childTarget}
          siblingTarget={siblingTarget}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSaving={isSaving}
        />
      </DialogContent>
    </Dialog>
  )
}

type PlacementValue = "child" | "sibling"

type CreatePartItemFormProps = {
  childTarget: BomCreateTarget
  siblingTarget: BomCreateTarget | null
  onSubmit: (value: CreateComponentItemSchema, target: BomCreateTarget) => void
  onCancel: () => void
  isSaving: boolean
}

// COMPONENT: item Part — không có item liên kết để chọn, người dùng nhập thẳng mã/tên riêng
// cho vị trí này trong cây (docs/decisions/wip-removal.md). "Thêm Part con" và "Thêm Part
// cùng cấp" trước đây là 2 nút riêng ở bảng, giờ hợp nhất thành 1 nút "Thêm Part" mở đúng
// dialog này — chọn vị trí (`placement`) bằng 2 thẻ trực quan thay vì quyết định trước khi
// mở dialog. Không dùng `RadioCardField` dùng chung (đọc `field: AnyFieldApi`) vì `placement`
// không phải dữ liệu form — nó chỉ quyết định `target` nào được gửi lên submit.
function CreatePartItemForm({
  childTarget,
  siblingTarget,
  onSubmit,
  onCancel,
  isSaving,
}: CreatePartItemFormProps) {
  const [placement, setPlacement] = useState<PlacementValue>("child")

  const target =
    placement === "sibling" && siblingTarget ? siblingTarget : childTarget

  const placementOptions = [
    {
      value: "child" as const,
      icon: ArrowRightDown,
      title: "Thêm bên trong",
      description: `Gắn làm Part con trong "${childTarget.parentLabel ?? "Sản phẩm gốc"}"`,
    },
    {
      value: "sibling" as const,
      icon: Layers,
      title: "Thêm ngang hàng",
      description: `Gắn cùng cấp trong "${siblingTarget?.parentLabel ?? "Sản phẩm gốc"}"`,
    },
  ]

  // Không giới hạn theo unit scope — route loader (`$productId.tsx`) đã prefetch danh sách đầy đủ.
  const { data: unitOptions } = useSuspenseQuery(unitOptionsQueryOptions())
  const unitSelectOptions = buildSelectOptions(unitOptions)

  const form = useAppForm({
    defaultValues: createComponentItemDefaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: createComponentItemSchema },
    onSubmit: ({ value }) => onSubmit(value, target),
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
          Thêm Part
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Nhập mã và tên cho Part này — riêng cho vị trí trong cây, không dùng
          chung với sản phẩm khác.
        </DialogDescription>
      </DialogHeader>

      {siblingTarget !== null ? (
        <RadioGroup
          value={placement}
          onValueChange={(value) => setPlacement(value as PlacementValue)}
          disabled={isSaving}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {placementOptions.map((option) => {
            const Icon = option.icon
            const isChecked = placement === option.value

            return (
              <Radio.Root
                key={option.value}
                value={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border border-input p-3 text-start transition-colors",
                  "hover:border-primary/40 hover:bg-muted/30",
                  "data-disabled:cursor-not-allowed data-disabled:opacity-50",
                  isChecked && "border-primary bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors",
                    isChecked && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="space-y-0.5">
                  <span className="block text-sm font-semibold text-foreground">
                    {option.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </Radio.Root>
            )
          })}
        </RadioGroup>
      ) : (
        // Không có lựa chọn vị trí (dòng Cấp 0 không có "cùng cấp") — một
        // dòng chữ đơn giản, không cần thẻ như `placementOptions`.
        <p className="text-sm text-muted-foreground">
          Thêm vào:{" "}
          <span className="font-semibold text-foreground">
            {childTarget.parentLabel ?? "Sản phẩm gốc"}
          </span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <form.AppField name="code">
            {(field) => (
              <field.TextField
                label="Mã"
                required
                placeholder="Ví dụ: KHUNG-BAN"
              />
            )}
          </form.AppField>

          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Tên"
                required
                placeholder="Ví dụ: Khung bàn"
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

          <form.AppField name="unitId">
            {(field) => (
              <field.SelectField
                label="Đơn vị tính"
                placeholder="Chọn đơn vị tính"
                options={unitSelectOptions}
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú Part"
                placeholder="Ghi chú quy cách hoặc thông tin thêm (nếu có)..."
                className="sm:col-span-2"
              />
            )}
          </form.AppField>
        </div>

        <form.Field name="image">
          {(field) => (
            <ProductImageField
              value={field.state.value}
              onChange={field.handleChange}
              disabled={isSaving}
              uploadType={UploadType.BOM_ITEM_IMAGE}
            />
          )}
        </form.Field>
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
