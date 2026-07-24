import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { withForm } from "@/hooks/use-app-form"
import { SupplierLogoField } from "@/features/suppliers/components/SupplierLogoField"
import { SUPPLIER_FORM_DEFAULT_VALUES } from "@/features/suppliers/schemas/supplier-form.schema"
import { SUPPLIER_TYPE_LABELS } from "@/features/suppliers/types/supplier.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type {
  CountryRef,
  SupplierGroupRef,
} from "@/features/suppliers/types/supplier.type"

const SUPPLIER_TYPE_OPTIONS = buildOptionsFromLabels(SUPPLIER_TYPE_LABELS)

export const SupplierInfoSection = withForm({
  defaultValues: SUPPLIER_FORM_DEFAULT_VALUES,
  props: {
    disabled: false,
    supplierGroupOptions: [] as SupplierGroupRef[],
    countryOptions: [] as CountryRef[],
  },
  render: function Render({
    form,
    disabled,
    supplierGroupOptions,
    countryOptions,
  }) {
    const supplierGroupSelectOptions = supplierGroupOptions.map((option) => ({
      value: option.id,
      label: option.name,
    }))
    const countrySelectOptions = countryOptions.map((option) => ({
      value: option.id,
      label: option.name,
    }))

    return (
      <div>
        <div className="px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin nhà cung cấp
          </h2>
          <p className="text-sm text-muted-foreground">
            Thông tin định danh, liên hệ và phân loại nhà cung cấp
          </p>
        </div>

        <div className="px-4 pb-5 sm:px-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field>
                <FieldLabel className="text-xs font-medium text-foreground">
                  Mã nhà cung cấp <span className="text-destructive">*</span>
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
                    label="Tên nhà cung cấp"
                    required
                    placeholder="Nhập tên nhà cung cấp"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="supplierGroupId">
                {(field) => (
                  <field.SelectField
                    label="Nhóm NCC"
                    required
                    placeholder="Chọn nhóm nhà cung cấp"
                    options={supplierGroupSelectOptions}
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="type">
                {(field) => (
                  <field.RadioPillField
                    label="Loại hình nhà cung cấp"
                    required
                    options={SUPPLIER_TYPE_OPTIONS}
                    disabled={disabled}
                    className="sm:col-span-2 lg:col-span-3"
                  />
                )}
              </form.AppField>

              <form.AppField name="taxCode">
                {(field) => (
                  <field.TextField
                    label="Mã số thuế"
                    required
                    placeholder="Nhập mã số thuế"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="phoneNumber">
                {(field) => (
                  <field.TextField
                    label="Điện thoại"
                    required
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

              <form.AppField name="representativeName">
                {(field) => (
                  <field.TextField
                    label="Người đại diện"
                    placeholder="Nhập họ và tên người đại diện"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="representativePhone">
                {(field) => (
                  <field.TextField
                    label="Điện thoại người đại diện"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="countryId">
                {(field) => (
                  <field.SelectField
                    label="Quốc gia"
                    placeholder="Chọn quốc gia"
                    options={countrySelectOptions}
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="address">
                {(field) => (
                  <field.TextareaField
                    label="Địa chỉ"
                    required
                    placeholder="Nhập địa chỉ chi tiết"
                    disabled={disabled}
                    className="sm:col-span-2 lg:col-span-3"
                  />
                )}
              </form.AppField>

              <form.AppField name="note">
                {(field) => (
                  <field.TextareaField
                    label="Ghi chú"
                    placeholder="Nhập ghi chú thêm về nhà cung cấp"
                    disabled={disabled}
                    className="sm:col-span-2 lg:col-span-3"
                  />
                )}
              </form.AppField>
            </div>

            <form.Field name="logo">
              {(field) => (
                <SupplierLogoField
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
