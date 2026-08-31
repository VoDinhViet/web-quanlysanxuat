import { FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import { withForm } from "@/hooks/use-app-form"
import { useGetClientOptions } from "@/features/clients/api"
import { createInventoryReceiptReturnFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-return.schema"
import { inventoryReceiptAssetTypeLabels } from "@/lib/types/inventory-receipt.type"
import { buildOptionsFromLabels, cn } from "@/lib/utils"

const assetTypeOptions = buildOptionsFromLabels(inventoryReceiptAssetTypeLabels)

// Bước ① của wizard "Khách hàng" — tính năng nhận vật tư DO khách hàng cung cấp (không phải
// khách hàng trả lại hàng đã mua). Chỉ 1 loại phiếu cố định RETURN, không có field "Loại phiếu",
// khác InventoryReceiptCreateHeaderSection.tsx ở combobox "Khách hàng cung cấp" thay cho các
// combobox NCC/PO/Job.
export const InventoryReceiptCreateReturnHeaderSection = withForm({
  defaultValues: createInventoryReceiptReturnFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const client = useGetClientOptions()

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ① Thông tin chung
          </h2>
          <p className="text-sm text-muted-foreground">
            Khách hàng cung cấp, ngày chứng từ và yêu cầu QC cho phiếu này.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <form.AppField name="receiptDate">
            {(field) => (
              <field.DateField label="Ngày nhập" required disabled={disabled} />
            )}
          </form.AppField>

          <form.Field name="clientId">
            {(field) => (
              <ComboboxField
                id={field.name}
                label="Khách hàng cung cấp"
                required
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
                emptyMessage="Không tìm thấy khách hàng"
                disabled={disabled}
              />
            )}
          </form.Field>

          <form.AppField name="assetType">
            {(field) => (
              <field.RadioPillField
                label="Loại tài sản"
                required
                disabled={disabled}
                options={assetTypeOptions}
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Ghi chú hiển thị trên phiếu (nếu có)"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-4"
              />
            )}
          </form.AppField>

          {/* `requiresIqc` là boolean trong form state (không đổi sang chuỗi "no"/"yes" như
              InventoryReceiptCreateFromPoItemsSection.tsx's field.RadioPillField) — đổi type sẽ làm
              form mất khả năng tái dùng InventoryReceiptCreateGenericItemsSection bên dưới, vốn
              khoá cứng theo CreateInventoryReceiptSchema. */}
          <form.Field name="requiresIqc">
            {(field) => (
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                <span className="block text-xs font-medium text-foreground">
                  Yêu cầu QC (IQC) <span className="text-destructive">*</span>
                </span>
                <RadioGroup
                  value={field.state.value ? "yes" : "no"}
                  onValueChange={(value) => field.handleChange(value === "yes")}
                  disabled={disabled}
                  className="flex flex-row flex-wrap gap-2"
                >
                  {[
                    { value: "yes", label: "Yêu cầu QC" },
                    { value: "no", label: "Không yêu cầu QC" },
                  ].map((option) => (
                    <FieldLabel
                      key={option.value}
                      htmlFor={`requiresIqc-${option.value}`}
                      className={cn(
                        "cursor-pointer gap-2 rounded-md border border-input px-4 py-2 text-xs font-medium text-foreground",
                        "has-data-checked:border-primary has-data-checked:bg-primary/5 has-data-checked:text-primary"
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`requiresIqc-${option.value}`}
                      />
                      {option.label}
                    </FieldLabel>
                  ))}
                </RadioGroup>
              </div>
            )}
          </form.Field>
        </div>
      </div>
    )
  },
})
