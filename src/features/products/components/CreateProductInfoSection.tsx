import { PackageSearch } from "lucide-react"

import { withForm } from "@/hooks/use-app-form"
import { ComboboxField } from "@/components/shared/ComboboxField"
import { ProductImageField } from "@/features/products/components/ProductImageField"
import { CREATE_PRODUCT_DEFAULT_VALUES } from "@/features/products/schemas/create-product.schema"
import { useGetClientOptions } from "@/features/products/hooks/use-get-client-options"
import { PRODUCT_STATUS_LABELS } from "@/features/products/types/product.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { ComboboxOption } from "@/components/shared/ComboboxField"
import type { ProductFilterOption } from "@/features/products/types/product.type"

const STATUS_OPTIONS = buildOptionsFromLabels(PRODUCT_STATUS_LABELS)

export const CreateProductInfoSection = withForm({
  defaultValues: CREATE_PRODUCT_DEFAULT_VALUES,
  props: {
    disabled: false,
    unitOptions: [] as ProductFilterOption[],
    productGroupOptions: [] as ProductFilterOption[],
    selectedClient: undefined as ComboboxOption | undefined,
  },
  render: function Render({
    form,
    disabled,
    unitOptions,
    productGroupOptions,
    selectedClient,
  }) {
    const client = useGetClientOptions()

    const unitSelectOptions = unitOptions.map((option) => ({
      value: option.id,
      label: option.name,
    }))
    const productGroupSelectOptions = productGroupOptions.map((option) => ({
      value: option.id,
      label: option.name,
    }))

    return (
      <div>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PackageSearch className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Thông tin sản phẩm
            </h2>
            <p className="text-sm text-muted-foreground">
              Thông tin định danh, phân loại và đơn vị tính của sản phẩm
            </p>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <form.AppField name="code">
                {(field) => (
                  <field.TextField
                    label="Mã sản phẩm"
                    placeholder="Tự động sinh nếu để trống"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Tên sản phẩm"
                    required
                    placeholder="Nhập tên sản phẩm"
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

              <form.AppField name="productGroupId">
                {(field) => (
                  <field.SelectField
                    label="Nhóm sản phẩm"
                    placeholder="Chọn nhóm sản phẩm"
                    options={productGroupSelectOptions}
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
                    isLoading={client.isFetching}
                    initialOption={selectedClient}
                    emptyMessage="Không tìm thấy khách hàng"
                    disabled={disabled}
                  />
                )}
              </form.Field>

              <form.AppField name="revision">
                {(field) => (
                  <field.TextField
                    label="Rev"
                    placeholder="R01"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

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

            <form.Field name="imageUrl">
              {(field) => (
                <ProductImageField
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
