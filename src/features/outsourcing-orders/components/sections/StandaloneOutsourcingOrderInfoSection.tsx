import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import type { ComboboxOption } from "@/components/shared/composites/ComboboxField"
import { useGetOperationOptions } from "@/features/operations/api"
import { standaloneOutsourcingOrderFormDefaultValues } from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import { useGetSupplierOptions } from "@/features/suppliers/api"
import { withForm } from "@/hooks/use-app-form"

// Thông tin phiếu thủ công: NCC, công đoạn gia công (áp cho cả phiếu), ngày gửi/nhận và ghi chú.
export const StandaloneOutsourcingOrderInfoSection = withForm({
  defaultValues: standaloneOutsourcingOrderFormDefaultValues,
  props: {
    disabled: false,
    // Nhà cung cấp đã chọn khi sửa phiếu — để ô hiện tên trước khi danh sách NCC tải xong.
    initialSupplierOption: undefined as ComboboxOption | undefined,
    initialOperationOption: undefined as ComboboxOption | undefined,
  },
  render: function Render({
    form,
    disabled,
    initialSupplierOption,
    initialOperationOption,
  }) {
    const supplierPicker = useGetSupplierOptions()
    // Phiếu thủ công không gắn Job nên chọn được mọi công đoạn đang hoạt động.
    const operationPicker = useGetOperationOptions()

    return (
      <div className="px-4 py-5 sm:px-5">
        <h2 className="font-heading text-base font-medium text-foreground">
          Thông tin phiếu
        </h2>
        <p className="text-sm text-muted-foreground">
          Phiếu thủ công không gắn Job nên không kiểm tra định mức cần gửi.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
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
                initialOption={initialSupplierOption}
                options={supplierPicker.options}
                onSearchChange={supplierPicker.onSearchChange}
                isPending={supplierPicker.isFetching}
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

          <form.Field name="operationId">
            {(field) => (
              <ComboboxField
                id={field.name}
                label="Công đoạn gia công"
                required
                placeholder="Chọn công đoạn"
                value={field.state.value || undefined}
                onValueChange={(next) => field.handleChange(next ?? "")}
                onBlur={field.handleBlur}
                initialOption={initialOperationOption}
                options={operationPicker.options}
                onSearchChange={operationPicker.onSearchChange}
                isPending={operationPicker.isFetching}
                emptyMessage="Không tìm thấy công đoạn"
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
