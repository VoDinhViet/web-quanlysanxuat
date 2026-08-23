import { withForm } from "@/hooks/use-app-form"
import { updateSupplierFormDefaultValues } from "@/features/suppliers/schemas/update-supplier.schema"
import { SupplierDocumentsField } from "@/features/suppliers/components/SupplierDocumentsField"
import { supplierStatusLabels } from "@/lib/types/supplier.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const statusOptions = buildOptionsFromLabels(supplierStatusLabels)

export const UpdateSupplierOtherSection = withForm({
  defaultValues: updateSupplierFormDefaultValues,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    return (
      <div>
        <div className="px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin khác
          </h2>
          <p className="text-sm text-muted-foreground">
            Trạng thái hợp tác, ghi chú nội bộ và tài liệu đính kèm
          </p>
        </div>

        <div className="space-y-5 px-4 pb-5 sm:px-5">
          <form.AppField name="status">
            {(field) => (
              <field.RadioPillField
                label="Trạng thái"
                required
                options={statusOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="internalNote">
            {(field) => (
              <field.TextareaField
                label="Ghi chú nội bộ"
                placeholder="Nhập ghi chú nội bộ (không hiển thị ra bên ngoài)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.Field name="files">
            {(field) => (
              <SupplierDocumentsField
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
