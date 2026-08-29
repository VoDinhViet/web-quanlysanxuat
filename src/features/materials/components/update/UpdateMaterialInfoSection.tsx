import { useSuspenseQuery } from "@tanstack/react-query"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { withForm } from "@/hooks/use-app-form"
import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import { MaterialImageField } from "@/features/materials/components/MaterialImageField"
import { updateMaterialFormDefaultValues } from "@/features/materials/schemas/update-material.schema"
import { useGetClientOptions } from "@/features/clients/api"
import { unitOptionsQueryOptions } from "@/features/units/api"
import { itemStatusLabels } from "@/lib/types/item.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"
import type { ComboboxOption } from "@/components/shared/composites/ComboboxField"

const statusOptions = buildOptionsFromLabels(itemStatusLabels)

export const UpdateMaterialInfoSection = withForm({
  defaultValues: updateMaterialFormDefaultValues,
  props: {
    disabled: false,
    selectedClient: undefined as ComboboxOption | undefined,
  },
  render: function Render({ form, disabled, selectedClient }) {
    const client = useGetClientOptions()
    // The route loader already prefetches this — resolves synchronously off cache.
    const { data: unitOptions } = useSuspenseQuery(
      unitOptionsQueryOptions("MATERIAL")
    )

    const unitSelectOptions = buildSelectOptions(unitOptions)

    return (
      <div>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Thông tin vật tư
            </h2>
            <p className="text-sm text-muted-foreground">
              Thông tin định danh, phân loại và đơn vị tính của vật tư
            </p>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field>
                <FieldLabel
                  htmlFor="material-code"
                  className="text-xs font-medium text-foreground"
                >
                  Mã vật tư
                </FieldLabel>
                <Input
                  id="material-code"
                  readOnly
                  disabled
                  placeholder="Tự động"
                  className="h-9 bg-background text-xs"
                />
              </Field>

              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Tên vật tư"
                    required
                    placeholder="Nhập tên vật tư"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="unitId">
                {(field) => (
                  <field.SelectField
                    label="Đơn vị tính"
                    required
                    placeholder="Chọn đơn vị tính"
                    options={unitSelectOptions}
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.Field name="clientId">
                {(field) => (
                  <ComboboxField
                    id={field.name}
                    label="Khách hàng"
                    placeholder="Chọn khách hàng"
                    value={field.state.value || undefined}
                    onValueChange={(next) => field.handleChange(next ?? "")}
                    onBlur={field.handleBlur}
                    isInvalid={
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                    }
                    errors={field.state.meta.errors}
                    options={client.options}
                    onSearchChange={client.onSearchChange}
                    isPending={client.isFetching}
                    initialOption={selectedClient}
                    emptyMessage="Không tìm thấy khách hàng"
                    disabled={disabled}
                  />
                )}
              </form.Field>

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
                    className="sm:col-span-2 lg:col-span-3"
                  />
                )}
              </form.AppField>
            </div>

            <form.Field name="image">
              {(field) => (
                <MaterialImageField
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={disabled}
                />
              )}
            </form.Field>
          </div>
        </div>
      </div>
    )
  },
})
