import { ComboboxField } from "@/components/shared/inputs/ComboboxField"
import { useGetSupplierOptions } from "@/features/suppliers/api"
import { createPurchaseOrderFormDefaultValues } from "@/features/purchase-orders/schemas/create-purchase-order.schema"
import { withForm } from "@/hooks/use-app-form"

export const CreatePurchaseOrderInfoSection = withForm({
  defaultValues: createPurchaseOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const supplier = useGetSupplierOptions()

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin đơn mua
          </h2>
          <p className="text-sm text-muted-foreground">
            PO lập tay đặt cho một nhà cung cấp duy nhất, không qua báo giá
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <form.Field name="supplierId">
            {(field) => (
              <ComboboxField
                id={field.name}
                label="Nhà cung cấp"
                required
                placeholder="Chọn nhà cung cấp"
                value={field.state.value || undefined}
                onValueChange={(next) => field.handleChange(next ?? "")}
                onBlur={field.handleBlur}
                options={supplier.options}
                onSearchChange={supplier.onSearchChange}
                isPending={supplier.isFetching}
                emptyMessage="Không tìm thấy nhà cung cấp"
                isInvalid={
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                }
                errors={field.state.meta.errors}
                disabled={disabled}
              />
            )}
          </form.Field>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Ghi chú hiển thị trên phiếu (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
