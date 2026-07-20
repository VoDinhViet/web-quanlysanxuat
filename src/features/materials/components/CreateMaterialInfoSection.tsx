import { Boxes } from "lucide-react"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { withForm } from "@/hooks/use-app-form"
import { ComboboxField } from "@/components/shared/ComboboxField"
import { MaterialImageField } from "@/features/materials/components/MaterialImageField"
import { CREATE_MATERIAL_DEFAULT_VALUES } from "@/features/materials/schemas/create-material.schema"
import { useGetClientOptions } from "@/features/materials/hooks/use-get-client-options"
import {
  MATERIAL_STATUS_LABELS,
  MATERIAL_TYPE_LABELS,
  MaterialType,
} from "@/features/materials/types/material.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { ComboboxOption } from "@/components/shared/ComboboxField"
import type { MaterialRef } from "@/features/materials/types/material.type"

const MATERIAL_TYPE_OPTIONS = buildOptionsFromLabels(MATERIAL_TYPE_LABELS)
const STATUS_OPTIONS = buildOptionsFromLabels(MATERIAL_STATUS_LABELS)

export const CreateMaterialInfoSection = withForm({
  defaultValues: CREATE_MATERIAL_DEFAULT_VALUES,
  props: {
    disabled: false,
    unitOptions: [] as MaterialRef[],
    materialGroupOptions: [] as MaterialRef[],
    selectedClient: undefined as ComboboxOption | undefined,
  },
  render: function Render({
    form,
    disabled,
    unitOptions,
    materialGroupOptions,
    selectedClient,
  }) {
    const client = useGetClientOptions()

    const unitSelectOptions = unitOptions.map((option) => ({
      value: option.id,
      label: option.name,
    }))
    const materialGroupSelectOptions = materialGroupOptions.map((option) => ({
      value: option.id,
      label: option.name,
    }))

    return (
      <div>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Boxes className="size-5" />
          </div>
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

              <form.AppField name="materialGroupId">
                {(field) => (
                  <field.SelectField
                    label="Nhóm vật tư"
                    required
                    placeholder="Chọn nhóm vật tư"
                    options={materialGroupSelectOptions}
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="type">
                {(field) => (
                  <field.RadioPillField
                    label="Loại vật tư"
                    required
                    options={MATERIAL_TYPE_OPTIONS}
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.Subscribe selector={(state) => state.values.type}>
                {(type) => (
                  <form.Field name="clientId">
                    {(field) => (
                      <ComboboxField
                        id={field.name}
                        label="Khách hàng"
                        required={type === MaterialType.CLIENT}
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
                        isLoading={client.isFetching}
                        initialOption={selectedClient}
                        emptyMessage="Không tìm thấy khách hàng"
                        disabled={disabled || type !== MaterialType.CLIENT}
                      />
                    )}
                  </form.Field>
                )}
              </form.Subscribe>

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
