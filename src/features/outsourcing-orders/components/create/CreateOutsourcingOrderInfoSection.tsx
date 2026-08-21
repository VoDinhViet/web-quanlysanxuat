import { ComboboxField } from "@/components/shared/inputs/ComboboxField"
import { useGetSupplierOptions } from "@/features/suppliers/api"
import { createOutsourcingOrderFormDefaultValues } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import { withForm } from "@/hooks/use-app-form"

// Nửa đầu bước ② — thông tin phiếu (NCC/ngày gửi/ngày cần/ghi chú).
export const CreateOutsourcingOrderInfoSection = withForm({
  defaultValues: createOutsourcingOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const supplier = useGetSupplierOptions()

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ② Thông tin phiếu
          </h2>
          <p className="text-sm text-muted-foreground">
            Chọn nhà cung cấp gia công và thời gian gửi/nhận cho phiếu này.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <form.Field name="supplierId">
            {(field) => (
              <ComboboxField
                id={field.name}
                label="Nhà cung cấp gia công"
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

          <form.AppField name="sendDate">
            {(field) => (
              <field.DateField
                label="Ngày gửi đi"
                required
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="expectedReturnDate">
            {(field) => (
              <field.DateField label="Ngày cần nhận về" disabled={disabled} />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú phiếu"
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
