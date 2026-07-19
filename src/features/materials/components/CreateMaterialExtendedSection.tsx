import { SlidersHorizontal } from "lucide-react"

import { withForm } from "@/hooks/use-app-form"
import { MaterialAttachmentsField } from "@/features/materials/components/MaterialAttachmentsField"
import { CREATE_MATERIAL_DEFAULT_VALUES } from "@/features/materials/schemas/create-material.schema"
import type { MaterialRef } from "@/features/materials/types/material.type"

export const CreateMaterialExtendedSection = withForm({
  defaultValues: CREATE_MATERIAL_DEFAULT_VALUES,
  props: {
    disabled: false,
    supplierOptions: [] as MaterialRef[],
  },
  render: function Render({ form, disabled, supplierOptions }) {
    const supplierSelectOptions = supplierOptions.map((option) => ({
      value: option.id,
      label: option.name,
    }))

    return (
      <div>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <SlidersHorizontal className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Thông tin mở rộng
            </h2>
            <p className="text-sm text-muted-foreground">
              Thông tin kỹ thuật bổ sung — không bắt buộc, có thể cập nhật sau
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:px-5">
          <form.AppField name="materialGrade">
            {(field) => (
              <field.TextField
                label="Vật liệu / Mác thép"
                placeholder="VD: SS400, SUS304..."
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="technicalStandard">
            {(field) => (
              <field.TextField
                label="Tiêu chuẩn kỹ thuật"
                placeholder="Nhập tiêu chuẩn áp dụng"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="dimensions">
            {(field) => (
              <field.TextField
                label="Kích thước / Độ dày"
                placeholder="VD: 3x1500x3000 mm"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="specificWeight">
            {(field) => (
              <field.TextField
                label="Trọng lượng riêng (kg/m³)"
                type="number"
                placeholder="0"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="colorSurface">
            {(field) => (
              <field.TextField
                label="Màu sắc / Bề mặt"
                placeholder="Nhập màu sắc, bề mặt"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="origin">
            {(field) => (
              <field.TextField
                label="Xuất xứ"
                placeholder="Nhập xuất xứ"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="preferredSupplierId">
            {(field) => (
              <field.SelectField
                label="Nhà cung cấp ưu tiên"
                placeholder="Chọn nhà cung cấp"
                options={supplierSelectOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="leadTime">
            {(field) => (
              <field.TextField
                label="Thời gian giao hàng"
                placeholder="VD: 7 ngày"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.TextareaField
                label="Mô tả chi tiết"
                placeholder="Nhập mô tả chi tiết về vật tư"
                disabled={disabled}
                className="sm:col-span-2"
              />
            )}
          </form.AppField>

          <form.Field name="attachments">
            {(field) => (
              <MaterialAttachmentsField
                value={field.state.value}
                onChange={field.handleChange}
                disabled={disabled}
              />
            )}
          </form.Field>
        </div>
      </div>
    )
  },
})
