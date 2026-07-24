import { withForm } from "@/hooks/use-app-form"
import { SupplierAttachmentsField } from "@/features/suppliers/components/SupplierAttachmentsField"
import { SUPPLIER_FORM_DEFAULT_VALUES } from "@/features/suppliers/schemas/supplier-form.schema"
import { SUPPLIER_STATUS_LABELS } from "@/features/suppliers/types/supplier.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const STATUS_OPTIONS = buildOptionsFromLabels(SUPPLIER_STATUS_LABELS)

export const SupplierOtherSection = withForm({
  defaultValues: SUPPLIER_FORM_DEFAULT_VALUES,
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
                options={STATUS_OPTIONS}
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

          <form.Field name="attachments">
            {(field) => (
              <SupplierAttachmentsField
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
