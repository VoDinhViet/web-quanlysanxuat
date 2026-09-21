import { useQuery } from "@tanstack/react-query"

import { withForm } from "@/hooks/use-app-form"
import { clientGroupOptionsQueryOptions } from "@/features/clients/api/options"
import { updateClientFormDefaultValues } from "@/features/clients/schemas/update-client.schema"
import { clientStatusLabels } from "@/lib/types/client.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"

const clientStatusOptions = buildOptionsFromLabels(clientStatusLabels)

export const UpdateClientInfoSection = withForm({
  defaultValues: updateClientFormDefaultValues,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    const clientGroupOptionsQuery = useQuery(clientGroupOptionsQueryOptions())
    const clientGroupSelectOptions = buildSelectOptions(
      clientGroupOptionsQuery.data ?? []
    )

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
            <form.AppField name="code">
              {(field) => (
                <field.TextField
                  label="Mã khách hàng"
                  required
                  placeholder="Nhập mã khách hàng"
                  disabled={disabled}
                />
              )}
            </form.AppField>

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
                  isPending={clientGroupOptionsQuery.isPending}
                />
              )}
            </form.AppField>

            <form.AppField name="status">
              {(field) => (
                <field.SelectField
                  label="Trạng thái"
                  required
                  placeholder="Chọn trạng thái"
                  options={clientStatusOptions}
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
