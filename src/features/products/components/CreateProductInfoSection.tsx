import { useSuspenseQuery } from "@tanstack/react-query"
import { PackageSearch } from "lucide-react"

import { withForm } from "@/hooks/use-app-form"
import { ComboboxField } from "@/components/shared/ComboboxField"
import { ProductAttachmentsField } from "@/features/products/components/ProductAttachmentsField"
import { ProductImageField } from "@/features/products/components/ProductImageField"
import { productGroupOptionsQueryOptions } from "@/features/products/api/options"
import { createProductFormDefaultValues } from "@/features/products/schemas/create-product.schema"
import { useGetClientOptions } from "@/features/clients/api"
import { unitOptionsQueryOptions } from "@/features/units/api"
import { PRODUCT_STATUS_LABELS } from "@/lib/types/product.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"
import type { ComboboxOption } from "@/components/shared/ComboboxField"

const STATUS_OPTIONS = buildOptionsFromLabels(PRODUCT_STATUS_LABELS)

export const CreateProductInfoSection = withForm({
  defaultValues: createProductFormDefaultValues,
  props: {
    disabled: false,
    selectedClient: undefined as ComboboxOption | undefined,
  },
  render: function Render({ form, disabled, selectedClient }) {
    const client = useGetClientOptions()
    // The route loader already prefetches both — resolves synchronously off cache.
    const { data: unitOptions } = useSuspenseQuery(
      unitOptionsQueryOptions("PRODUCT")
    )
    const { data: productGroupOptions } = useSuspenseQuery(
      productGroupOptionsQueryOptions()
    )

    const unitSelectOptions = buildSelectOptions(unitOptions)
    const productGroupSelectOptions = buildSelectOptions(productGroupOptions)

    return (
      <div>
        <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5">
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
                <ProductImageField
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={disabled}
                />
              )}
            </form.Field>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <form.Field name="attachments">
              {(field) => (
                <ProductAttachmentsField
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
