import { LayersMinimalistic } from "@solar-icons/react"

import { withForm } from "@/hooks/use-app-form"
import { BomItemDrawingField } from "@/features/products/components/composites/BomItemDrawingField"
import { updateBomItemFormDefaultValues } from "@/features/products/schemas/update-bom-item.schema"
import type { BomItemType } from "@/lib/types/bom-item.type"

// The form instance is owned by BomItemDetailPage, because the header's "Lưu"
// button sits outside this panel and submits the same form — same split as
// ProductInfoTab/UpdateProductInfoSection. `disabled` folds both "no
// items:bom-manage permission" and "a save is in flight" — the caller decides,
// this component just renders.
export const BomItemInfoTab = withForm({
  defaultValues: updateBomItemFormDefaultValues,
  props: {
    bomItemType: "COMPONENT" as BomItemType,
    disabled: false,
  },
  render: function Render({ form, bomItemType, disabled }) {
    return (
      <div>
        <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayersMinimalistic className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Thông tin hạng mục
            </h2>
            <p className="text-sm text-muted-foreground">
              Thông tin định danh, số lượng và bản vẽ của hạng mục này trong cấu
              trúc BOM
            </p>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {bomItemType === "COMPONENT" ? (
              <>
                <form.AppField name="code">
                  {(field) => (
                    <field.TextField label="Mã" required disabled={disabled} />
                  )}
                </form.AppField>
                <form.AppField name="name">
                  {(field) => (
                    <field.TextField label="Tên" required disabled={disabled} />
                  )}
                </form.AppField>
              </>
            ) : null}

            {/* Thứ tự sắp xếp (sortOrder) không có ô sửa ở đây — backend cũng chưa có field gán ĐVT
                cho node COMPONENT (unit chỉ đọc được từ item liên kết ở CONSUMABLE/ROOT), nên không có gì để
                thay vào chỗ đó. `sortOrder` không nằm trong defaultValues (xem
                getBomItemDefaultValues), nên form không gửi key này lên PATCH — giữ nguyên thứ tự
                hiện tại theo đúng ngữ nghĩa "thiếu key = không đổi" của update-bom-item.schema.ts. */}
            {bomItemType !== "ROOT" ? (
              <form.AppField name="quantity">
                {(field) => (
                  <field.NumberField
                    label="Số lượng"
                    required
                    disabled={disabled}
                  />
                )}
              </form.AppField>
            ) : null}

            <form.AppField name="note">
              {(field) => (
                <field.TextareaField
                  label="Ghi chú"
                  placeholder="Ghi chú (nếu có)..."
                  disabled={disabled}
                  className="sm:col-span-2"
                />
              )}
            </form.AppField>

            <div className="sm:col-span-2">
              <form.AppField name="drawing">
                {(field) => (
                  <BomItemDrawingField
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={disabled}
                  />
                )}
              </form.AppField>
            </div>
          </div>
        </div>
      </div>
    )
  },
})
