import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { withForm } from "@/hooks/use-app-form"
import { CREATE_CLIENT_DEFAULT_VALUES } from "@/features/clients/schemas/create-client.schema"
import { CLIENT_STATUS_LABELS } from "@/features/clients/types/client.type"
import type { ClientGroupRef } from "@/features/clients/types/client.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const CLIENT_STATUS_OPTIONS = buildOptionsFromLabels(CLIENT_STATUS_LABELS)

export const CreateClientInfoSection = withForm({
  defaultValues: CREATE_CLIENT_DEFAULT_VALUES,
  props: {
    disabled: false,
    clientGroupOptions: [] as ClientGroupRef[],
  },
  render: function Render({ form, disabled, clientGroupOptions }) {
    const clientGroupSelectOptions = clientGroupOptions.map((option) => ({
      value: option.id,
      label: option.name,
    }))

    return (
      <div>
        <div className="px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin chung
          </h2>
          <p className="text-sm text-muted-foreground">
            Thông tin định danh, liên hệ và phân loại khách hàng
          </p>
        </div>

        <div className="px-4 pb-5 sm:px-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
            <Field>
              <FieldLabel className="text-xs font-medium text-foreground">
                Mã khách hàng <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                readOnly
                disabled
                placeholder="Tự động"
                className="h-9 bg-background text-xs"
              />
            </Field>

            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Tên khách hàng"
                  required
                  placeholder="Nhập tên khách hàng hoặc tên công ty"
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="taxCode">
              {(field) => (
                <field.TextField
                  label="Mã số thuế (MST)"
                  placeholder="Nhập mã số thuế"
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="phoneNumber">
              {(field) => (
                <field.TextField
                  label="Điện thoại"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email"
                  type="email"
                  placeholder="Nhập email"
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="address">
              {(field) => (
                <field.TextField
                  label="Địa chỉ"
                  placeholder="Nhập địa chỉ"
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="clientGroupId">
              {(field) => (
                <field.SelectField
                  label="Nhóm khách hàng"
                  required
                  placeholder="Chọn nhóm khách hàng"
                  options={clientGroupSelectOptions}
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="status">
              {(field) => (
                <field.SelectField
                  label="Trạng thái"
                  required
                  placeholder="Chọn trạng thái"
                  options={CLIENT_STATUS_OPTIONS}
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="note">
              {(field) => (
                <field.TextareaField
                  label="Ghi chú"
                  placeholder="Nhập ghi chú (nếu có)"
                  disabled={disabled}
                  className="sm:col-span-2 xl:col-span-3"
                />
              )}
            </form.AppField>
          </div>
        </div>
      </div>
    )
  },
})
