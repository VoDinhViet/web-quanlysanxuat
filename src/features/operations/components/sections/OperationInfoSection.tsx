import { withForm } from "@/hooks/use-app-form"
import { updateOperationFormDefaultValues } from "@/features/operations/schemas/update-operation.schema"
import { operationStatusLabels } from "@/lib/types/operation.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const statusOptions = buildOptionsFromLabels(operationStatusLabels)

// The form instance is owned by OperationDetailPage, because the header's "Lưu" button sits
// outside this panel and submits the same form.
export const OperationInfoSection = withForm({
  defaultValues: updateOperationFormDefaultValues,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (form.state.isSubmitting) return
          form.handleSubmit()
        }}
        noValidate
      >
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Thông tin công đoạn
            </h2>
            <p className="text-sm text-muted-foreground">
              Mã, tên, trạng thái và ghi chú của công đoạn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:px-5">
          <form.AppField name="code">
            {(field) => (
              <field.TextField
                label="Mã công đoạn"
                required
                placeholder="Nhập mã công đoạn"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Tên công đoạn"
                required
                placeholder="Nhập tên công đoạn"
                disabled={disabled}
              />
            )}
          </form.AppField>

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

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Nhập ghi chú (không bắt buộc)"
                disabled={disabled}
                className="sm:col-span-2"
              />
            )}
          </form.AppField>
        </div>
      </form>
    )
  },
})
